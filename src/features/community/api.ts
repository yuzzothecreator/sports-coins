import { z } from "zod";
import { requireBackend } from "../account/api";
import { postContent, profileSchema, replyContent } from "../account/schema";

const authorFields = "id,username,display_name,bio,created_at";
const recordSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  content: z.string(),
  created_at: z.string(),
  author: profileSchema.nullable(),
});
const feedSchema = recordSchema.extend({
  post_likes: z.array(z.object({ count: z.number() })),
  post_comments: z.array(z.object({ count: z.number() })),
});
export type CommunityPost = z.infer<typeof feedSchema>;
export type CommunityReply = z.infer<typeof recordSchema>;
export async function fetchFeed() {
  const { data, error } = await requireBackend()
    .from("posts")
    .select(
      `id,user_id,content,created_at,author:profiles!posts_user_id_fkey(${authorFields}),post_likes(count),post_comments(count)`,
    )
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return z.array(feedSchema).parse(data);
}
export async function fetchPeople() {
  const { data, error } = await requireBackend()
    .from("profiles")
    .select(authorFields)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return z.array(profileSchema).parse(data);
}
export async function fetchActivity(userId: string) {
  const client = requireBackend();
  const [likes, bookmarks, follows] = await Promise.all([
    client
      .from("post_likes")
      .select("post_id")
      .eq("user_id", userId)
      .limit(1000),
    client
      .from("post_bookmarks")
      .select("post_id")
      .eq("user_id", userId)
      .limit(1000),
    client
      .from("follows")
      .select("following_id")
      .eq("user_id", userId)
      .limit(1000),
  ]);
  for (const result of [likes, bookmarks, follows])
    if (result.error) throw result.error;
  return {
    likes: (likes.data || []).map((row) => row.post_id as string),
    bookmarks: (bookmarks.data || []).map((row) => row.post_id as string),
    following: (follows.data || []).map((row) => row.following_id as string),
  };
}
export async function publishPost(userId: string, content: string) {
  const { data, error } = await requireBackend()
    .from("posts")
    .insert({ user_id: userId, content: postContent.parse(content) })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}
export async function fetchReplies(postId: string) {
  const { data, error } = await requireBackend()
    .from("post_comments")
    .select(
      `id,user_id,content,created_at,author:profiles!post_comments_user_id_fkey(${authorFields})`,
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return z.array(recordSchema).parse(data).reverse();
}
export async function publishReply(
  userId: string,
  postId: string,
  content: string,
) {
  const { error } = await requireBackend()
    .from("post_comments")
    .insert({
      user_id: userId,
      post_id: postId,
      content: replyContent.parse(content),
    });
  if (error) throw error;
}
export async function setActivity(
  userId: string,
  kind: "like" | "bookmark" | "follow",
  target: string,
  active: boolean,
) {
  const table =
    kind === "like"
      ? "post_likes"
      : kind === "bookmark"
        ? "post_bookmarks"
        : "follows";
  const key = kind === "follow" ? "following_id" : "post_id";
  const query = requireBackend().from(table);
  const { error } = active
    ? await query.insert({ user_id: userId, [key]: target })
    : await query.delete().eq("user_id", userId).eq(key, target);
  if (error && !(active && error.code === "23505")) throw error;
}
export async function deleteOwnPost(userId: string, postId: string) {
  const { data, error } = await requireBackend()
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", userId)
    .select("id");
  if (error) throw error;
  if (!data?.length)
    throw new Error(
      "This post could not be removed. Refresh the feed and try again.",
    );
}
