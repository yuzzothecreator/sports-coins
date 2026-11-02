import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Card, Label, Title, s } from "../components/ui";
import { TeamBadge } from "../components/team-badge";
import { FootballStatus } from "../features/sports/football-screen";
import { useFootballFeed } from "../services/football";

type Outcome = "home" | "draw" | "away";
export default function Predictions() {
  const feed = useFootballFeed();
  const [picks, setPicks] = useState<Record<string, Outcome>>({});
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, []);
  const fixtures = (feed.data?.fixtures || []).filter(
    (match) => match.phase === "scheduled" && Date.parse(match.kickoff) > now,
  );
  const selected = fixtures.filter((match) => picks[match.id]);
  const unavailable = !!feed.error || !!feed.data?.stale;
  const outcomeLabel = (home: string, away: string, outcome: Outcome) =>
    outcome === "draw" ? "Draw" : `${outcome === "home" ? home : away} to win`;
  return (
    <View>
      <Title subtitle="Make your own picks on scheduled football matches.">Your next prediction</Title>
      <Card style={{ marginBottom: 24 }}>
        <Label>Match schedules supplied by API-Football.</Label>
        <Label muted style={{ marginTop: 10, fontSize: 12 }}>
          Picks reflect your opinion. Model probabilities and bookmaker odds are not available.
          Your selections stay on this screen and earn no rewards.
        </Label>
      </Card>
      {feed.isPending ? <Card><Label>Loading scheduled matches…</Label></Card>
        : feed.error && !feed.data ? (
          <Card>
            <Label>Match data is unavailable.</Label>
            <Label muted style={{ marginVertical: 14 }}>{feed.error.message}</Label>
            <Button disabled={feed.isFetching} onPress={() => { void feed.refetch(); }}>
              {feed.isFetching ? "Checking…" : "Check connection"}
            </Button>
          </Card>
        ) : feed.data ? (
          <View>
            <FootballStatus feed={feed.data} failed={!!feed.error} />
            {unavailable && <Label accessibilityRole="alert" style={{ marginBottom: 16 }}>
              Updates are unavailable. New picks are paused until match data refreshes.
            </Label>}
            <Button secondary disabled={feed.isFetching} onPress={() => { void feed.refetch(); }}>
              {feed.isFetching ? "Checking…" : "Refresh matches"}
            </Button>
            <View style={{ gap: 14, marginTop: 20 }}>
              {fixtures.map((match) => (
                <Card key={match.id}>
                  <View style={s.row}>
                    <TeamBadge uri={match.homeLogo} name={match.home} size={38} />
                    <View style={{ flex: 1 }}>
                      <Label style={{ fontWeight: "600" }}>{match.home} vs {match.away}</Label>
                      <Label muted style={{ fontSize: 11, marginTop: 5 }}>{match.league}</Label>
                      <Label muted style={{ fontSize: 11, marginTop: 5 }}>
                        {new Date(match.kickoff).toLocaleString()} · Your local time
                      </Label>
                    </View>
                  </View>
                  <View style={[s.row, { flexWrap: "wrap", marginTop: 18 }]}>
                    {(["home", "draw", "away"] as const).map((outcome) => (
                      <Button key={outcome} secondary={picks[match.id] !== outcome} disabled={unavailable}
                        onPress={() => {
                          if (Date.parse(match.kickoff) <= Date.now()) { setNow(Date.now()); return; }
                          setPicks((current) => {
                            const next = { ...current };
                            if (next[match.id] === outcome) delete next[match.id];
                            else next[match.id] = outcome;
                            return next;
                          });
                        }}>
                        {`${picks[match.id] === outcome ? "✓ " : ""}${outcomeLabel(match.home, match.away, outcome)}`}
                      </Button>
                    ))}
                  </View>
                </Card>
              ))}
              {!fixtures.length && <Card>
                <Label>No upcoming matches were returned for today.</Label>
                <Label muted style={{ marginTop: 10, fontSize: 12 }}>
                  Availability depends on the provider’s schedule and your plan’s season coverage.
                </Label>
              </Card>}
            </View>
          </View>
        ) : null}
      <Card style={{ marginTop: 24 }}>
        <Title compact>My picks · {selected.length}</Title>
        {selected.length ? selected.map((match) => (
          <View key={match.id} style={{ marginBottom: 14 }}>
            <Label>{match.home} vs {match.away}</Label>
            <Label muted style={{ marginTop: 4, fontSize: 12 }}>
              {outcomeLabel(match.home, match.away, picks[match.id])}
            </Label>
          </View>
        )) : <Label muted>Select a match outcome to start.</Label>}
        <Label muted style={{ marginTop: 12, fontSize: 11 }}>
          Picks disappear when matches leave the upcoming schedule. Published slips,
          settlement, and rewards are not connected yet.
        </Label>
      </Card>
    </View>
  );
}
