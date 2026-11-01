import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Post = {
  id: string;
  name: string;
  avatar: number;
  text: string;
  tag?: string;
};
type AppState = {
  likes: string[];
  saved: string[];
  following: string[];
  picks: string[];
  posts: Post[];
  messages: Record<string, string[]>;
  triviaDone: boolean;
  rewardClaimed: string | null;
  demoCoins: number;
  toggle: (key: "likes" | "saved" | "following" | "picks", id: string) => void;
  post: (text: string) => void;
  send: (room: string, text: string) => void;
  claim: () => void;
  trivia: (correct: boolean) => void;
};
export const useApp = create<AppState>()(
  persist(
    (set) => ({
      likes: [],
      saved: [],
      following: [],
      picks: [],
      messages: {},
      triviaDone: false,
      rewardClaimed: null,
      demoCoins: 1250,
      posts: [
        {
          id: "amara",
          name: "Amara Okafor",
          avatar: 47,
          text: "Big match energy. Small margins.\n\nArsenal’s pressing has been incredible lately. I’m backing them to keep the momentum going today. What’s your pick?",
          tag: "Match talk",
        },
        {
          id: "lewis",
          name: "Lewis Jones",
          avatar: 12,
          text: "Nothing beats matchday with your people. The conversations, the nerves, the last-minute celebrations. This is why we love the game.",
          tag: "Matchday",
        },
      ],
      toggle: (key, id) =>
        set((s) => ({
          [key]: s[key].includes(id)
            ? s[key].filter((x) => x !== id)
            : [...s[key], id],
        })),
      post: (text) =>
        set((s) => ({
          posts: [
            {
              id: Date.now().toString(),
              name: "Alex Morgan",
              avatar: 11,
              text,
            },
            ...s.posts,
          ],
        })),
      send: (room, text) =>
        set((s) => ({
          messages: {
            ...s.messages,
            [room]: [...(s.messages[room] || []), text],
          },
        })),
      claim: () =>
        set((s) =>
          s.rewardClaimed === new Date().toDateString()
            ? {}
            : {
                rewardClaimed: new Date().toDateString(),
                demoCoins: s.demoCoins + 50,
              },
        ),
      trivia: (correct) =>
        set((s) =>
          s.triviaDone
            ? {}
            : {
                triviaDone: true,
                demoCoins: s.demoCoins + (correct ? 100 : 0),
              },
        ),
    }),
    {
      name: "sport-coins-demo-v1",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
