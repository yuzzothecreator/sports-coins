import { supabase } from "../../lib/supabase";
import { profileFields, profileSchema, ProfileFields } from "./schema";

export function requireBackend() {
  if (!supabase) throw new Error("Account services are not connected.");
  return supabase;
}
export function accountError(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    if (error.code === "23505")
      return "That username is already taken. Try another.";
    if (error.code === "42P01" || error.code === "PGRST205")
      return "The account database is not ready. Apply the Sport Coins migrations to the selected project.";
    if (error.code === "42501")
      return "Your account cannot perform this action. Sign in again, or check the database access policies.";
  }
  return error instanceof Error
    ? error.message
    : error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string"
      ? error.message
      : "Could not reach the service. Please try again.";
}
export async function getProfile(userId: string) {
  const { data, error } = await requireBackend()
    .from("profiles")
    .select("id,username,display_name,bio,created_at")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? profileSchema.parse(data) : null;
}
export async function saveProfile(
  userId: string,
  values: ProfileFields,
  exists: boolean,
) {
  const fields = profileFields.parse(values);
  const table = requireBackend().from("profiles");
  const query = exists
    ? table.update(fields).eq("id", userId)
    : table.insert({ ...fields, id: userId });
  const { data, error } = await query
    .select("id,username,display_name,bio,created_at")
    .single();
  if (error) throw error;
  return profileSchema.parse(data);
}
