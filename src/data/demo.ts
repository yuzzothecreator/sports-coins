export type Fixture = {
  id: string;
  sport: string;
  league: string;
  home: string;
  away: string;
  homeLogo?: string | null;
  awayLogo?: string | null;
  homeCode: string;
  awayCode: string;
  score: string;
  status: string;
  color: string;
  time: string;
  source?: "api-football";
  phase?: "live" | "paused" | "finished" | "scheduled" | "cancelled" | "unknown";
  kickoff?: string;
};
export const fixtures: Fixture[] = [
  {
    id: "ars-che",
    sport: "Football",
    league: "Premier League",
    home: "Arsenal",
    away: "Chelsea",
    homeCode: "ARS",
    awayCode: "CHE",
    score: "2 : 1",
    status: "67′",
    color: "#B93242",
    time: "Demo in play",
  },
  {
    id: "liv-mci",
    sport: "Football",
    league: "Premier League",
    home: "Liverpool",
    away: "Man City",
    homeCode: "LIV",
    awayCode: "MCI",
    score: "—",
    status: "Upcoming",
    color: "#CB3C48",
    time: "Tomorrow · 19:30",
  },
  {
    id: "avl-eve",
    sport: "Football",
    league: "Premier League",
    home: "Aston Villa",
    away: "Everton",
    homeCode: "AVL",
    awayCode: "EVE",
    score: "1 : 0",
    status: "FT",
    color: "#823D61",
    time: "Demo completed",
  },
  {
    id: "bos-lal",
    sport: "Basketball",
    league: "NBA",
    home: "Boston Celtics",
    away: "LA Lakers",
    homeCode: "BOS",
    awayCode: "LAL",
    score: "84 : 79",
    status: "Q3",
    color: "#24856B",
    time: "Demo in play",
  },
  {
    id: "sin-alc",
    sport: "Tennis",
    league: "ATP Tour",
    home: "J. Sinner",
    away: "C. Alcaraz",
    homeCode: "SIN",
    awayCode: "ALC",
    score: "1 : 1",
    status: "Set 3",
    color: "#B38733",
    time: "Demo in play",
  },
];
export const clubs = [
  { name: "Arsenal", code: "ARS", color: "#B93242" },
  { name: "Aston Villa", code: "AVL", color: "#823D61" },
  { name: "Everton", code: "EVE", color: "#344CA0" },
  { name: "Brentford", code: "BRE", color: "#D34545" },
  { name: "Man United", code: "MUN", color: "#B73232" },
  { name: "Chelsea", code: "CHE", color: "#344CA0" },
];
export const rooms = [
  {
    name: "Football Fanatics",
    code: "FF",
    color: "#3B705E",
    members: "2.4k",
    text: "Amara: That midfield is looking so strong.",
    count: 17,
  },
  {
    name: "The Premier League",
    code: "PL",
    color: "#764694",
    members: "8.1k",
    text: "Daniel: Who is your player of the week?",
    count: 2,
  },
  {
    name: "Courtside Collective",
    code: "CC",
    color: "#BD8450",
    members: "1.8k",
    text: "Sam: What a fourth quarter!",
    count: 5,
  },
  {
    name: "The Tennis Club",
    code: "TC",
    color: "#73935D",
    members: "960",
    text: "Maya: A final we will remember.",
    count: 0,
  },
];
export const people = [
  "Amara Okafor",
  "Daniel Kimani",
  "Maya Chen",
  "Lewis Jones",
  "Sofia Martins",
];
export const avatar = (id: number) => `https://i.pravatar.cc/100?img=${id}`;
