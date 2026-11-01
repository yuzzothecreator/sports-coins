import {
  AppText as Text,
  AppInput as TextInput,
} from "../components/typography";
import { useState } from "react";
import { View, Pressable, ScrollView, Modal, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Bookmark from "lucide-react-native/icons/bookmark";
import Heart from "lucide-react-native/icons/heart";
import MessageCircle from "lucide-react-native/icons/message-circle";
import MoreHorizontal from "lucide-react-native/icons/ellipsis";
import Plus from "lucide-react-native/icons/plus";
import Send from "lucide-react-native/icons/send";
import Share2 from "lucide-react-native/icons/share-2";
import X from "lucide-react-native/icons/x";
import Check from "lucide-react-native/icons/check";
import ArrowLeft from "lucide-react-native/icons/arrow-left";
import PenLine from "lucide-react-native/icons/pen-line";
import {
  Avatar,
  Button,
  Card,
  Crest,
  Label,
  SearchBox,
  Tabs,
  Title,
  s,
} from "../components/ui";
import { colors as c } from "../theme";
import { clubs, people, rooms } from "../data/demo";
import { useApp } from "../store/use-app";
import { supabase } from "../lib/supabase";
import { ConnectedCommunity } from "../features/community/connected-community";
export default function Community() {
  return supabase ? <ConnectedCommunity /> : <DemoCommunity />;
}
function DemoCommunity() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const tab = ["Feed", "Groups", "Friends"].includes(params.tab || "")
    ? params.tab!
    : "Feed";
  const setTab = (tab: string) => router.setParams({ tab });
  const [filter, setFilter] = useState("For you");
  const [search, setSearch] = useState("");
  const [club, setClub] = useState("");
  const [compose, setCompose] = useState(false);
  const [draft, setDraft] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [comment, setComment] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [comments, setComments] = useState<Record<string, string[]>>({});
  const [info, setInfo] = useState("");
  const { posts, post, likes, saved, following, toggle, messages, send } =
    useApp();
  const filtered = posts.filter(
    (p) =>
      (!search ||
        `${p.name} ${p.text}`.toLowerCase().includes(search.toLowerCase())) &&
      (!club || p.text.toLowerCase().includes(club.toLowerCase())) &&
      (filter !== "Following" || following.includes(p.name)),
  );
  return (
    <View>
      <Title
        subtitle="The game brings us together."
        action="Create a post"
        onAction={() => setCompose(true)}
      >
        Community
      </Title>
      <SearchBox
        value={search}
        onChangeText={setSearch}
        placeholder="Search for a conversation, club or fan"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 25, paddingTop: 26, paddingBottom: 21 }}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setClub("");
            setCompose(true);
          }}
          style={{ alignItems: "center", gap: 10 }}
        >
          <View
            style={{
              width: 59,
              height: 59,
              borderRadius: 30,
              backgroundColor: c.ink,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Plus size={25} color="white" strokeWidth={1.4} />
          </View>
          <Label style={{ fontSize: 11 }}>Your story</Label>
        </Pressable>
        {clubs.map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item.name}
            onPress={() => setClub(club === item.name ? "" : item.name)}
            style={{ alignItems: "center", gap: 8 }}
          >
            <View
              style={{
                borderWidth: 1.5,
                borderColor: club === item.name ? c.ink : item.color + "65",
                borderRadius: 35,
                padding: 4,
              }}
            >
              <Crest code={item.code} color={item.color} size={49} />
            </View>
            <Label style={{ fontSize: 11 }}>{item.name}</Label>
          </Pressable>
        ))}
      </ScrollView>
      <Tabs
        items={["Feed", "Groups", "Friends"]}
        value={tab}
        onChange={(v) => {
          setTab(v);
          setRoom("");
        }}
      />
      {tab === "Feed" && (
        <View>
          <View
            style={[
              s.row,
              { justifyContent: "space-between", marginBottom: 21 },
            ]}
          >
            <View style={[s.row, { gap: 8 }]}>
              {["For you", "Following", "Trending"].map((f) => (
                <Pressable
                  accessibilityRole="button"
                  key={f}
                  onPress={() => setFilter(f)}
                  style={{
                    backgroundColor: filter === f ? "#F1F0F5" : "white",
                    borderRadius: 20,
                    paddingHorizontal: 13,
                    paddingVertical: 6,
                  }}
                >
                  <Label
                    style={{
                      fontSize: 11,
                      color: filter === f ? c.ink : c.muted,
                    }}
                  >
                    {f}
                  </Label>
                </Pressable>
              ))}
            </View>
            <Label muted style={{ fontSize: 10 }}>
              DEMO FEED
            </Label>
          </View>
          {club && (
            <Pressable accessibilityRole="button" onPress={() => setClub("")}>
              <Label muted style={{ marginBottom: 14, fontSize: 12 }}>
                Showing {club} conversations · Clear ×
              </Label>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            onPress={() => setCompose(true)}
            style={[
              s.row,
              {
                padding: 15,
                borderWidth: 1,
                borderColor: c.line,
                borderRadius: 12,
                marginBottom: 20,
                gap: 13,
              },
            ]}
          >
            <Avatar size={35} />
            <Label muted style={{ flex: 1, fontSize: 12 }}>
              What’s your matchday take, Alex?
            </Label>
            <PenLine size={18} color={c.muted} />
          </Pressable>
          <View style={{ gap: 20 }}>
            {(filter === "Trending"
              ? [...filtered].sort(
                  (a, b) =>
                    Number(likes.includes(b.id)) - Number(likes.includes(a.id)),
                )
              : filtered
            ).map((p, i) => (
              <Card key={p.id} style={{ padding: 22 }}>
                <View style={[s.row, { gap: 11 }]}>
                  <Avatar id={p.avatar} size={39} />
                  <View style={{ flex: 1 }}>
                    <View style={s.row}>
                      <Label style={{ fontSize: 13, fontWeight: "600" }}>
                        {p.name}
                      </Label>
                      {p.id === "amara" && (
                        <View
                          style={{
                            backgroundColor: c.ink,
                            borderRadius: 10,
                            padding: 2,
                          }}
                        >
                          <Check size={8} color="white" />
                        </View>
                      )}
                    </View>
                    <Label muted style={{ fontSize: 10 }}>
                      {p.id.length > 10
                        ? "Just now"
                        : i === 0
                          ? "50 minutes ago"
                          : "2 hours ago"}{" "}
                      · {p.tag || "Community"}
                    </Label>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Post options"
                    onPress={() =>
                      setInfo(
                        "Demo post options: use the bookmark below to save this post. Reporting, blocking, and moderation will be available with connected accounts.",
                      )
                    }
                  >
                    <MoreHorizontal size={19} color={c.muted} />
                  </Pressable>
                </View>
                <Label
                  style={{
                    fontSize: 13,
                    lineHeight: 22,
                    marginTop: 19,
                    marginBottom: 19,
                  }}
                >
                  {p.text}
                </Label>
                {p.id === "amara" && (
                  <View
                    style={{
                      backgroundColor: "#F8F8FA",
                      padding: 16,
                      borderRadius: 8,
                      marginBottom: 19,
                    }}
                  >
                    <View style={[s.row, { justifyContent: "space-between" }]}>
                      <Label muted style={{ fontSize: 9, letterSpacing: 1 }}>
                        A MATCHDAY INSTINCT
                      </Label>
                      <Label muted style={{ fontSize: 9 }}>
                        USER PREDICTION
                      </Label>
                    </View>
                    <View style={[s.row, { marginTop: 13 }]}>
                      <Crest code="ARS" color="#B93242" size={29} />
                      <Crest code="CHE" color="#344CA0" size={29} />
                      <View style={{ marginLeft: 5 }}>
                        <Label style={{ fontSize: 12 }}>
                          Arsenal vs Chelsea
                        </Label>
                        <Label muted style={{ fontSize: 10 }}>
                          Arsenal to win · Sample prediction
                        </Label>
                      </View>
                      <ArrowLeft
                        size={14}
                        color={c.muted}
                        style={{
                          marginLeft: "auto",
                          transform: [{ rotate: "135deg" }],
                        }}
                      />
                    </View>
                  </View>
                )}
                {p.id === "lewis" && (
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1000&auto=format&fit=crop&q=80",
                    }}
                    accessibilityLabel="Football stadium on matchday"
                    style={{
                      height: 210,
                      width: "100%",
                      borderRadius: 8,
                      marginBottom: 18,
                      backgroundColor: "#E4EBE4",
                    }}
                  />
                )}
                <View
                  style={[
                    s.row,
                    {
                      paddingTop: 15,
                      borderTopWidth: 1,
                      borderColor: c.line,
                      gap: 25,
                    },
                  ]}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      likes.includes(p.id) ? "Unlike post" : "Like post"
                    }
                    onPress={() => toggle("likes", p.id)}
                    style={s.row}
                  >
                    <Heart
                      size={17}
                      color={likes.includes(p.id) ? "#C55C68" : c.muted}
                      fill={likes.includes(p.id) ? "#C55C68" : "none"}
                      strokeWidth={1.4}
                    />
                    <Label muted style={{ fontSize: 10 }}>
                      {(p.id === "amara" ? 24 : p.id === "lewis" ? 17 : 0) +
                        Number(likes.includes(p.id))}
                    </Label>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Comment on post"
                    onPress={() => setComment(p.id)}
                    style={s.row}
                  >
                    <MessageCircle
                      size={17}
                      color={c.muted}
                      strokeWidth={1.4}
                    />
                    <Label muted style={{ fontSize: 10 }}>
                      {(comments[p.id] || []).length +
                        (p.id === "amara" ? 6 : 0)}
                    </Label>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Share post"
                    onPress={() =>
                      setInfo(
                        `Post by ${p.name}: ${p.text}\n\nPublic share links will be available when the community backend is connected.`,
                      )
                    }
                  >
                    <Share2 size={16} color={c.muted} strokeWidth={1.4} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      saved.includes(p.id) ? "Unsave post" : "Save post"
                    }
                    onPress={() => toggle("saved", p.id)}
                    style={{ marginLeft: "auto" }}
                  >
                    <Bookmark
                      size={17}
                      color={saved.includes(p.id) ? c.ink : c.muted}
                      fill={saved.includes(p.id) ? c.ink : "none"}
                      strokeWidth={1.4}
                    />
                  </Pressable>
                </View>
              </Card>
            ))}
            {filtered.length === 0 && (
              <Card>
                <Label>No conversations here yet.</Label>
                <Label muted style={{ marginTop: 7 }}>
                  Try another search, follow a fan, or start a conversation.
                </Label>
              </Card>
            )}
          </View>
        </View>
      )}
      {tab === "Groups" &&
        (!room ? (
          <View>
            <Label muted style={{ marginBottom: 20, fontSize: 12 }}>
              Find your corner of the sports world. Rooms are local demos.
            </Label>
            {rooms
              .filter((r) =>
                r.name.toLowerCase().includes(search.toLowerCase()),
              )
              .map((r) => (
                <Pressable
                  accessibilityRole="button"
                  key={r.name}
                  onPress={() => setRoom(r.name)}
                  style={[
                    s.row,
                    {
                      paddingVertical: 21,
                      borderBottomWidth: 1,
                      borderColor: c.line,
                      gap: 16,
                    },
                  ]}
                >
                  <Crest code={r.code} color={r.color} size={49} />
                  <View style={{ flex: 1 }}>
                    <Label style={{ fontWeight: "500" }}>{r.name}</Label>
                    <Label
                      muted
                      numberOfLines={1}
                      style={{ fontSize: 11, marginTop: 4 }}
                    >
                      {r.text}
                    </Label>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Label muted style={{ fontSize: 9 }}>
                      09:10
                    </Label>
                    {r.count > 0 && (
                      <View
                        style={{
                          backgroundColor: c.ink,
                          minWidth: 18,
                          height: 18,
                          borderRadius: 10,
                          justifyContent: "center",
                          alignItems: "center",
                          marginTop: 5,
                        }}
                      >
                        <Text style={{ color: "white", fontSize: 9 }}>
                          {r.count}
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
          </View>
        ) : (
          <View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setRoom("")}
              style={[s.row, { marginBottom: 20 }]}
            >
              <ArrowLeft size={17} color={c.ink} />
              <Label>{room}</Label>
            </Pressable>
            <Card>
              <Label muted style={{ fontSize: 11 }}>
                Local demo chat · Messages are saved only on this device
              </Label>
              <View
                style={{
                  backgroundColor: c.canvas,
                  padding: 15,
                  borderRadius: 9,
                  marginVertical: 20,
                }}
              >
                <Label style={{ fontSize: 12 }}>
                  Amara · Welcome! What’s your matchday take?
                </Label>
              </View>
              {(messages[room] || []).map((m, i) => (
                <View
                  key={i}
                  style={{
                    padding: 14,
                    backgroundColor: c.purple,
                    borderRadius: 10,
                    marginVertical: 5,
                    alignSelf: "flex-end",
                    maxWidth: "90%",
                  }}
                >
                  <Label style={{ fontSize: 12 }}>{m}</Label>
                </View>
              ))}
              <View style={[s.row, { marginTop: 20 }]}>
                <TextInput
                  accessibilityLabel="Message"
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Join the conversation…"
                  style={{
                    flex: 1,
                    backgroundColor: c.canvas,
                    padding: 13,
                    borderRadius: 8,
                    color: c.ink,
                  }}
                  maxLength={1000}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Send message"
                  onPress={() => {
                    if (message.trim()) {
                      send(room, message.trim());
                      setMessage("");
                    }
                  }}
                  style={{ padding: 10 }}
                >
                  <Send size={21} color={c.ink} />
                </Pressable>
              </View>
            </Card>
          </View>
        ))}
      {tab === "Friends" && (
        <View>
          <Label muted style={{ fontSize: 12, marginBottom: 17 }}>
            Discover a familiar voice. Follow your next favorite fan.
          </Label>
          {people
            .filter((p) => p.toLowerCase().includes(search.toLowerCase()))
            .map((p, i) => (
              <View
                key={p}
                style={[
                  s.row,
                  {
                    paddingVertical: 18,
                    borderBottomWidth: 1,
                    borderColor: c.line,
                    gap: 14,
                  },
                ]}
              >
                <Avatar id={[47, 13, 44, 12, 49][i]} size={45} />
                <View style={{ flex: 1 }}>
                  <Label style={{ fontWeight: "500" }}>{p}</Label>
                  <Label muted style={{ fontSize: 11 }}>
                    {
                      [
                        "Football enthusiast",
                        "All about the beautiful game",
                        "Tennis fan",
                        "Matchday regular",
                        "Basketball & good company",
                      ][i]
                    }
                  </Label>
                </View>
                <Button secondary onPress={() => toggle("following", p)}>
                  {following.includes(p) ? "Following" : "Follow"}
                </Button>
              </View>
            ))}
        </View>
      )}
      <Modal
        transparent
        visible={compose || comment !== null || !!info}
        animationType="fade"
        onRequestClose={() => {
          setCompose(false);
          setComment(null);
          setInfo("");
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#15153260",
            alignItems: "center",
            justifyContent: "center",
            padding: 22,
          }}
        >
          <Card style={{ width: "100%", maxWidth: 510 }}>
            <View
              style={[
                s.row,
                { justifyContent: "space-between", marginBottom: 20 },
              ]}
            >
              <Label style={{ fontSize: 20, fontWeight: "500" }}>
                {compose
                  ? "Your voice. Your game."
                  : info
                    ? "Sport Coins"
                    : "The conversation"}
              </Label>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
                onPress={() => {
                  setCompose(false);
                  setComment(null);
                  setInfo("");
                }}
              >
                <X size={20} color={c.ink} />
              </Pressable>
            </View>
            {info ? (
              <Label muted>{info}</Label>
            ) : compose ? (
              <View>
                <View style={s.row}>
                  <Avatar />
                  <Label>Alex Morgan · Demo profile</Label>
                </View>
                <TextInput
                  accessibilityLabel="Post content"
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="What’s on your mind, sports fan?"
                  multiline
                  maxLength={2000}
                  style={{
                    minHeight: 150,
                    color: c.ink,
                    paddingVertical: 20,
                    fontSize: 15,
                    textAlignVertical: "top",
                  }}
                />
                <Label muted style={{ fontSize: 11, marginBottom: 15 }}>
                  Visible on this device in demo mode.
                </Label>
                <Button
                  disabled={!draft.trim()}
                  onPress={() => {
                    post(draft.trim());
                    setDraft("");
                    setCompose(false);
                    setFilter("For you");
                    setClub("");
                  }}
                >
                  Publish post
                </Button>
              </View>
            ) : (
              <View>
                <Label muted style={{ fontSize: 11 }}>
                  Your replies are local to this session.
                </Label>
                {(comments[comment || ""] || []).map((m, i) => (
                  <Label key={i} style={{ paddingVertical: 15 }}>
                    Alex: {m}
                  </Label>
                ))}
                <TextInput
                  accessibilityLabel="Write a reply"
                  value={reply}
                  onChangeText={setReply}
                  placeholder="Add your perspective…"
                  multiline
                  maxLength={1000}
                  style={{ minHeight: 100, color: c.ink, paddingVertical: 20 }}
                />
                <Button
                  disabled={!reply.trim()}
                  onPress={() => {
                    const id = comment!;
                    setComments((v) => ({
                      ...v,
                      [id]: [...(v[id] || []), reply.trim()],
                    }));
                    setReply("");
                  }}
                >
                  Post reply
                </Button>
              </View>
            )}
          </Card>
        </View>
      </Modal>
    </View>
  );
}
