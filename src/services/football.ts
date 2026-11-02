import { useQuery } from "@tanstack/react-query";
import { Platform } from "react-native";
import { z } from "zod";

const fixtureSchema = z.object({
  id: z.string(),
  sport: z.string(),
  league: z.string(),
  home: z.string(),
  away: z.string(),
  homeCode: z.string(),
  awayCode: z.string(),
  score: z.string(),
  status: z.string(),
  color: z.string(),
  time: z.string(),
  source: z.literal("api-football"),
  kickoff: z.string().datetime({ offset: true }),
  phase: z.enum([
    "live",
    "paused",
    "finished",
    "scheduled",
    "cancelled",
    "unknown",
  ]),
});
const feedSchema = z.object({
  fixtures: z.array(fixtureSchema),
  fetchedAt: z.string().datetime(),
  nextRefreshAt: z.string().datetime(),
  stale: z.boolean(),
  warning: z.string().optional(),
  provider: z.literal("API-Football"),
  refreshSeconds: z.number().min(15),
  partial: z.boolean().default(false),
  date: z.string(),
  timezone: z.string(),
});
export type FootballFeed = z.infer<typeof feedSchema>;
async function request(path: string) {
  const base = (process.env.EXPO_PUBLIC_SPORTS_API_URL || "").replace(
    /\/$/,
    "",
  );
  if (!base && Platform.OS !== "web")
    throw new Error(
      "Set EXPO_PUBLIC_SPORTS_API_URL to the sports backend URL for this device.",
    );
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${base}/api/sports/${path}`, {
      signal: controller.signal,
    });
    let body;
    try {
      body = await response.json();
    } catch {
      throw new Error(
        "The sports backend is unavailable. Check its connection and try again.",
      );
    }
    if (!response.ok) {
      const message = z.object({ error: z.string() }).safeParse(body);
      throw new Error(
        message.success ? message.data.error : "Sports data is unavailable.",
      );
    }
    const data = feedSchema.safeParse(body);
    if (!data.success)
      throw new Error(
        "The sports service returned an invalid response. Please try again later.",
      );
    return data.data;
  } finally {
    clearTimeout(timeout);
  }
}
export function useFootballFeed(id?: string) {
  return useQuery({
    queryKey: ["sports", "football", id || "today"],
    queryFn: () =>
      request(id ? `fixture?id=${encodeURIComponent(id)}` : "fixtures"),
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: (query) =>
      query.state.data
        ? Math.min(60_000, query.state.data.refreshSeconds * 1000)
        : false,
    staleTime: 60_000,
  });
}
