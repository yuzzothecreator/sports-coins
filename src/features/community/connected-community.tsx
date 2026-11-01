import { useState } from "react";
import { View, Pressable, Modal, ScrollView, Share } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Heart from "lucide-react-native/icons/heart";
import Bookmark from "lucide-react-native/icons/bookmark";
import MessageCircle from "lucide-react-native/icons/message-circle";
import Share2 from "lucide-react-native/icons/share-2";
import X from "lucide-react-native/icons/x";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Label,
  SearchBox,
  Tabs,
  Title,
  s,
} from "../../components/ui";
import { AppInput } from "../../components/typography";
import { colors as c } from "../../theme";
import { useCurrentProfile, useSession } from "../account/session";
import { accountError } from "../account/api";
import {
  CommunityPost,
  deleteOwnPost,
  fetchActivity,
  fetchFeed,
  fetchPeople,
  fetchReplies,
  publishPost,
  publishReply,
  setActivity,
} from "./api";

export function ConnectedCommunity() {
  const { session } = useSession();
  return <CommunityView key={session?.user.id || "guest"} />;
}
function CommunityView() {
  const { session, ready, error: sessionError, retry } = useSession();
  const profile = useCurrentProfile();
  const cache = useQueryClient();
  const uid = session?.user.id;
  const params = useLocalSearchParams<{ tab?: string }>();
  const tab =
    params.tab === "Groups" || params.tab === "Friends" ? params.tab : "Feed";
  const [filter, setFilter] = useState("For you");
  const [search, setSearch] = useState("");
  const [compose, setCompose] = useState(false);
  const [draft, setDraft] = useState("");
  const [selected, setSelected] = useState<CommunityPost | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [notice, setNotice] = useState("");
  const enabled = ready && !sessionError;
  const feed = useQuery({
    queryKey: ["connected", "community", "feed", uid],
    queryFn: fetchFeed,
    enabled: !!enabled,
    refetchInterval: 30_000,
    retry: 1,
  });
  const people = useQuery({
    queryKey: ["connected", "community", "people", uid],
    queryFn: fetchPeople,
    enabled: !!enabled && tab === "Friends",
    retry: 1,
  });
  const activity = useQuery({
    queryKey: ["connected", "community", "activity", uid],
    queryFn: () => fetchActivity(uid!),
    enabled: !!uid,
    retry: 1,
  });
  const replies = useQuery({
    queryKey: ["connected", "community", "replies", selected?.id, uid],
    queryFn: () => fetchReplies(selected!.id),
    enabled: !!selected,
    refetchInterval: selected ? 15_000 : false,
    retry: 1,
  });
  const refresh = () =>
    cache.invalidateQueries({ queryKey: ["connected", "community"] });
  // The parent keys this view by identity, clearing drafts on account switches.
  const publish = useMutation({
    mutationFn: () => publishPost(uid!, draft),
    onSuccess: () => {
      setDraft("");
      setCompose(false);
      setFilter("For you");
      setSearch("");
      void refresh();
    },
  });
  const comment = useMutation({
    mutationFn: () => publishReply(uid!, selected!.id, reply),
    onSuccess: () => {
      setReply("");
      void refresh();
    },
  });
  const interact = useMutation({
    mutationFn: ({
      kind,
      target,
      active,
    }: {
      kind: "like" | "bookmark" | "follow";
      target: string;
      active: boolean;
    }) => setActivity(uid!, kind, target, active),
    onSuccess: () => {
      void refresh();
    },
    onError: (error) => setNotice(accountError(error)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteOwnPost(uid!, id),
    onSuccess: () => {
      setDeleting(null);
      void refresh();
    },
    onError: (error) => {
      setDeleting(null);
      setNotice(accountError(error));
    },
  });
  const requireProfile = () => {
    if (!uid) {
      router.push("/auth");
      return false;
    }
    if (!profile.data) {
      router.push("/account");
      return false;
    }
    return true;
  };
  const action = (
    kind: "like" | "bookmark" | "follow",
    target: string,
    active: boolean,
  ) => {
    if (requireProfile()) {
      setNotice("");
      interact.mutate({ kind, target, active });
    }
  };
  const visible = (feed.data || []).filter(
    (p) =>
      `${p.content} ${p.author?.display_name} ${p.author?.username}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter !== "Following" ||
        activity.data?.following.includes(p.user_id)) &&
      (filter !== "Saved" || activity.data?.bookmarks.includes(p.id)),
  );
  if (!ready)
    return (
      <Card>
        <Label>Restoring your session…</Label>
      </Card>
    );
  if (sessionError) return <ErrorCard error={sessionError} retry={retry} />;
  return (
    <View>
      <Title
        subtitle="Real voices. Shared matchday moments."
        action="Create a post"
        onAction={() => {
          if (requireProfile()) {
            publish.reset();
            setCompose(true);
          }
        }}
      >
        Community
      </Title>
      <View
        style={[s.row, { marginBottom: 20, justifyContent: "space-between" }]}
      >
        <Badge tone="green">Connected community</Badge>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Refresh community"
          disabled={feed.isFetching}
          onPress={() => {
            void refresh();
          }}
          style={{ padding: 8 }}
        >
          <Label style={{ fontSize: 11 }}>
            {feed.isFetching ? "Refreshing…" : "Refresh ↻"}
          </Label>
        </Pressable>
      </View>
      {!uid && (
        <Card style={{ marginBottom: 18 }}>
          <Label muted>
            Read the conversation, or sign in to add your voice.
          </Label>
          <View style={{ alignSelf: "flex-start", marginTop: 12 }}>
            <Button onPress={() => router.push("/auth")}>
              Sign in to connect
            </Button>
          </View>
        </Card>
      )}
      {uid && !profile.isPending && !profile.data && (
        <Card style={{ marginBottom: 18 }}>
          <Label>
            {profile.error
              ? accountError(profile.error)
              : "Choose your public name before posting."}
          </Label>
          <View style={{ marginTop: 12 }}>
            <Button onPress={() => router.push("/account")}>
              Complete your profile
            </Button>
          </View>
        </Card>
      )}
      <SearchBox
        value={search}
        onChangeText={setSearch}
        placeholder="Search conversations or fans"
      />
      <Tabs
        items={["Feed", "Friends", "Groups"]}
        value={tab}
        onChange={(tab) => router.setParams({ tab })}
      />
      {notice && (
        <Label
          accessibilityRole="alert"
          style={{ color: "#BC4659", fontSize: 12, marginBottom: 16 }}
        >
          {notice}
        </Label>
      )}
      {tab === "Feed" && (
        <View>
          <View style={[s.row, { marginBottom: 20, flexWrap: "wrap" }]}>
            {["For you", "Following", "Saved"].map((item) => (
              <Pressable
                key={item}
                accessibilityRole="button"
                onPress={() => {
                  if (item !== "For you" && !uid) {
                    router.push("/auth");
                    return;
                  }
                  setFilter(item);
                }}
                style={{
                  paddingHorizontal: 15,
                  paddingVertical: 8,
                  borderRadius: 25,
                  backgroundColor: filter === item ? c.ink : "white",
                }}
              >
                <Label
                  style={{
                    color: filter === item ? "white" : c.muted,
                    fontSize: 11,
                  }}
                >
                  {item}
                </Label>
              </Pressable>
            ))}
          </View>
          {feed.error ? (
            <ErrorCard
              error={accountError(feed.error)}
              retry={() => {
                void feed.refetch();
              }}
            />
          ) : feed.isPending ? (
            <Card>
              <Label>Loading the conversation…</Label>
            </Card>
          ) : (
            <View style={{ gap: 17 }}>
              {visible.map((post) => {
                const liked = activity.data?.likes.includes(post.id) || false;
                const saved =
                  activity.data?.bookmarks.includes(post.id) || false;
                return (
                  <Card key={post.id}>
                    <View style={[s.row, { gap: 12 }]}>
                      <Avatar name={post.author?.display_name || "Member"} />
                      <View style={{ flex: 1 }}>
                        <Label style={{ fontWeight: "600", fontSize: 13 }}>
                          {post.author?.display_name || "Member"}
                        </Label>
                        <Label muted style={{ fontSize: 10 }}>
                          @{post.author?.username || "member"} ·{" "}
                          {new Date(post.created_at).toLocaleString()}
                        </Label>
                      </View>
                      {uid === post.user_id && (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Delete your post"
                          disabled={remove.isPending}
                          onPress={() => setDeleting(post.id)}
                          style={{ padding: 8 }}
                        >
                          <Label muted style={{ fontSize: 10 }}>
                            Delete
                          </Label>
                        </Pressable>
                      )}
                    </View>
                    <Label
                      style={{
                        marginVertical: 21,
                        fontSize: 14,
                        lineHeight: 24,
                      }}
                    >
                      {post.content}
                    </Label>
                    <View
                      style={[
                        s.row,
                        {
                          borderTopWidth: 1,
                          borderColor: c.line,
                          paddingTop: 14,
                          gap: 23,
                        },
                      ]}
                    >
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={liked ? "Unlike post" : "Like post"}
                        disabled={
                          interact.isPending || (!!uid && !activity.data)
                        }
                        onPress={() => action("like", post.id, !liked)}
                        style={[s.row, { minHeight: 36 }]}
                      >
                        <Heart
                          size={18}
                          color={liked ? "#BC4659" : c.muted}
                          fill={liked ? "#BC4659" : "none"}
                        />
                        <Label muted style={{ fontSize: 11 }}>
                          {post.post_likes[0]?.count || 0}
                        </Label>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Open replies"
                        onPress={() => {
                          comment.reset();
                          setReply("");
                          setSelected(post);
                        }}
                        style={[s.row, { minHeight: 36 }]}
                      >
                        <MessageCircle size={18} color={c.muted} />
                        <Label muted style={{ fontSize: 11 }}>
                          {post.post_comments[0]?.count || 0}
                        </Label>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Share post text"
                        onPress={() => {
                          void Share.share({
                            message: `${post.author?.display_name || "A Sport Coins member"}: ${post.content}`,
                          }).catch((error) => setNotice(accountError(error)));
                        }}
                        style={{ padding: 8 }}
                      >
                        <Share2 size={17} color={c.muted} />
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={saved ? "Unsave post" : "Save post"}
                        disabled={
                          interact.isPending || (!!uid && !activity.data)
                        }
                        onPress={() => action("bookmark", post.id, !saved)}
                        style={{ marginLeft: "auto", padding: 8 }}
                      >
                        <Bookmark
                          size={18}
                          color={saved ? c.ink : c.muted}
                          fill={saved ? c.ink : "none"}
                        />
                      </Pressable>
                    </View>
                  </Card>
                );
              })}
              {visible.length === 0 && (
                <Card>
                  <Label style={{ fontWeight: "600" }}>
                    The conversation starts with you.
                  </Label>
                  <Label muted style={{ marginTop: 8, fontSize: 12 }}>
                    No posts match this view. Share your first matchday take, or
                    try another search.
                  </Label>
                </Card>
              )}
            </View>
          )}
          <Label muted style={{ fontSize: 10, marginTop: 18 }}>
            Latest 50 posts · Refreshes every 30 seconds
          </Label>
        </View>
      )}
      {tab === "Friends" &&
        (people.error ? (
          <ErrorCard
            error={accountError(people.error)}
            retry={() => {
              void people.refetch();
            }}
          />
        ) : people.isPending ? (
          <Card>
            <Label>Finding your fellow fans…</Label>
          </Card>
        ) : (
          <View style={{ gap: 12 }}>
            {people.data
              .filter(
                (person) =>
                  person.id !== uid &&
                  `${person.display_name} ${person.username}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
              )
              .map((person) => (
                <Card key={person.id}>
                  <View style={s.row}>
                    <Avatar name={person.display_name} />
                    <View style={{ flex: 1 }}>
                      <Label style={{ fontWeight: "600", fontSize: 13 }}>
                        {person.display_name}
                      </Label>
                      <Label muted style={{ fontSize: 11 }}>
                        @{person.username}
                      </Label>
                    </View>
                    <Button
                      secondary
                      disabled={interact.isPending || (!!uid && !activity.data)}
                      onPress={() =>
                        action(
                          "follow",
                          person.id,
                          !activity.data?.following.includes(person.id),
                        )
                      }
                    >
                      {activity.data?.following.includes(person.id)
                        ? "Following"
                        : "Follow"}
                    </Button>
                  </View>
                  {person.bio && (
                    <Label muted style={{ fontSize: 12, marginTop: 12 }}>
                      {person.bio}
                    </Label>
                  )}
                </Card>
              ))}
            {!people.data.some((person) => person.id !== uid) && (
              <Card>
                <Label>Your community is just getting started.</Label>
                <Label muted style={{ fontSize: 12, marginTop: 8 }}>
                  New public profiles will appear here as fans join.
                </Label>
              </Card>
            )}
          </View>
        ))}
      {tab === "Groups" && (
        <Card>
          <Label style={{ fontWeight: "600" }}>
            Rooms are the next chapter.
          </Label>
          <Label muted style={{ marginTop: 10, fontSize: 12 }}>
            Shared rooms, Realtime messaging, and moderation are not connected
            in this milestone. For now, start a conversation in the feed.
          </Label>
          <View style={{ marginTop: 18 }}>
            <Button onPress={() => router.setParams({ tab: "Feed" })}>
              Back to the feed
            </Button>
          </View>
        </Card>
      )}
      {activity.error && (
        <ErrorCard
          error={accountError(activity.error)}
          retry={() => {
            void activity.refetch();
          }}
        />
      )}
      <Modal
        transparent
        visible={compose || !!selected || !!deleting}
        animationType="fade"
        onRequestClose={() => {
          setCompose(false);
          setSelected(null);
          setDeleting(null);
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#18213970",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Card style={{ width: "100%", maxWidth: 540, maxHeight: "90%" }}>
            <View
              style={[
                s.row,
                { justifyContent: "space-between", marginBottom: 20 },
              ]}
            >
              <Label style={{ fontWeight: "600", fontSize: 19 }}>
                {deleting
                  ? "Delete your post?"
                  : compose
                    ? "Your voice. Your game."
                    : "The conversation"}
              </Label>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
                onPress={() => {
                  setCompose(false);
                  setSelected(null);
                  setDeleting(null);
                }}
                style={{ padding: 8 }}
              >
                <X size={20} color={c.ink} />
              </Pressable>
            </View>
            {deleting ? (
              <View>
                <Label muted style={{ marginBottom: 20 }}>
                  This permanently removes the post and its replies, likes, and
                  bookmarks.
                </Label>
                <Button
                  disabled={remove.isPending}
                  onPress={() => remove.mutate(deleting)}
                >
                  {remove.isPending ? "Deleting…" : "Delete post"}
                </Button>
                <View style={{ marginTop: 12 }}>
                  <Button
                    secondary
                    disabled={remove.isPending}
                    onPress={() => setDeleting(null)}
                  >
                    Keep post
                  </Button>
                </View>
              </View>
            ) : compose ? (
              <View>
                <View style={s.row}>
                  <Avatar name={profile.data?.display_name || "Member"} />
                  <Label>{profile.data?.display_name}</Label>
                </View>
                <AppInput
                  accessibilityLabel="Post content"
                  multiline
                  value={draft}
                  onChangeText={setDraft}
                  maxLength={2000}
                  placeholder="What’s your matchday take?"
                  editable={!publish.isPending}
                  style={{
                    minHeight: 140,
                    color: c.ink,
                    textAlignVertical: "top",
                    paddingVertical: 20,
                  }}
                />
                <Label muted style={{ fontSize: 10, marginBottom: 15 }}>
                  Public post · {draft.length}/2,000 characters
                </Label>
                {publish.error && (
                  <Label
                    accessibilityRole="alert"
                    style={{ color: "#BC4659", fontSize: 12, marginBottom: 12 }}
                  >
                    {accountError(publish.error)}
                  </Label>
                )}
                <Button
                  disabled={!draft.trim() || publish.isPending}
                  onPress={() => {
                    if (requireProfile()) publish.mutate();
                  }}
                >
                  {publish.isPending ? "Publishing…" : "Publish post"}
                </Button>
              </View>
            ) : (
              <View style={{ flexShrink: 1 }}>
                <ScrollView style={{ maxHeight: 330 }}>
                  <Label style={{ marginBottom: 18 }}>
                    {selected?.content}
                  </Label>
                  {replies.error ? (
                    <ErrorCard
                      error={accountError(replies.error)}
                      retry={() => {
                        void replies.refetch();
                      }}
                    />
                  ) : replies.isPending ? (
                    <Label muted>Loading replies…</Label>
                  ) : (
                    replies.data.map((item) => (
                      <View
                        key={item.id}
                        style={{
                          borderTopWidth: 1,
                          borderColor: c.line,
                          paddingVertical: 15,
                        }}
                      >
                        <Label style={{ fontWeight: "600", fontSize: 12 }}>
                          {item.author?.display_name || "Member"}
                        </Label>
                        <Label muted style={{ fontSize: 10 }}>
                          {new Date(item.created_at).toLocaleString()}
                        </Label>
                        <Label style={{ marginTop: 7, fontSize: 13 }}>
                          {item.content}
                        </Label>
                      </View>
                    ))
                  )}
                </ScrollView>
                {uid && profile.data ? (
                  <View>
                    <AppInput
                      accessibilityLabel="Write a reply"
                      multiline
                      value={reply}
                      onChangeText={setReply}
                      maxLength={1000}
                      editable={!comment.isPending}
                      placeholder="Add your perspective…"
                      style={{
                        minHeight: 85,
                        paddingVertical: 15,
                        color: c.ink,
                        textAlignVertical: "top",
                      }}
                    />
                    {comment.error && (
                      <Label
                        accessibilityRole="alert"
                        style={{
                          color: "#BC4659",
                          fontSize: 12,
                          marginBottom: 12,
                        }}
                      >
                        {accountError(comment.error)}
                      </Label>
                    )}
                    <Button
                      disabled={!reply.trim() || comment.isPending}
                      onPress={() => {
                        if (requireProfile()) comment.mutate();
                      }}
                    >
                      {comment.isPending ? "Posting…" : "Post reply"}
                    </Button>
                  </View>
                ) : (
                  <View style={{ marginTop: 20 }}>
                    <Button
                      onPress={() => {
                        setSelected(null);
                        router.push(uid ? "/account" : "/auth");
                      }}
                    >
                      {uid
                        ? "Complete your profile to reply"
                        : "Sign in to reply"}
                    </Button>
                  </View>
                )}
                <Label muted style={{ fontSize: 10, marginTop: 12 }}>
                  Latest 100 replies · Refreshes every 15 seconds
                </Label>
              </View>
            )}
          </Card>
        </View>
      </Modal>
    </View>
  );
}
function ErrorCard({ error, retry }: { error: string; retry: () => void }) {
  return (
    <Card style={{ marginBottom: 16 }}>
      <Label accessibilityRole="alert" style={{ fontSize: 12 }}>
        {error}
      </Label>
      <View style={{ alignSelf: "flex-start", marginTop: 12 }}>
        <Button secondary onPress={retry}>
          Retry
        </Button>
      </View>
    </Card>
  );
}
