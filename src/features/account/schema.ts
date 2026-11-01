import { z } from "zod";

export const profileFields = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,30}$/, "Use 3–30 letters, numbers, or underscores."),
  display_name: z.string().trim().min(1, "Enter your display name.").max(80),
  bio: z.string().trim().max(500, "Keep your bio under 500 characters."),
});
export const profileSchema = profileFields.extend({
  id: z.uuid(),
  created_at: z.string(),
});
export type Profile = z.infer<typeof profileSchema>;
export type ProfileFields = z.infer<typeof profileFields>;
export const postContent = z
  .string()
  .trim()
  .min(1, "Write something before posting.")
  .max(2000);
export const replyContent = z
  .string()
  .trim()
  .min(1, "Write a reply first.")
  .max(1000);
