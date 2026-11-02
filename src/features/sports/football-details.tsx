import { View } from "react-native";
import { router } from "expo-router";
import { Button, Card, Label, MatchCard, Title, s } from "../../components/ui";
import { useFootballFeed } from "../../services/football";
import { FootballStatus } from "./football-screen";
import { TeamBadge } from "../../components/team-badge";
import { colors as c } from "../../theme";
export function FootballDetails({ id }: { id: string }) {
  return /^\d{1,12}$/.test(id) ? (
    <Details id={id} />
  ) : (
    <Card>
      <Label>Invalid provider fixture.</Label>
      <Button onPress={() => router.push("/live")}>Back to fixtures</Button>
    </Card>
  );
}
function Details({ id }: { id: string }) {
  const feed = useFootballFeed(id);
  const match = feed.data?.fixtures[0];
  return (
    <View>
      <Title subtitle="API-Football provider data">Match centre</Title>
      {feed.isPending ? (
        <Card>
          <Label>Loading provider fixture…</Label>
        </Card>
      ) : feed.error && !match ? (
        <Card>
          <Label>{feed.error.message}</Label>
          <Button
            onPress={() => {
              void feed.refetch();
            }}
          >
            Retry
          </Button>
        </Card>
      ) : match && feed.data ? (
        <View>
          <FootballStatus feed={feed.data} failed={!!feed.error} />
          {feed.error && <Label accessibilityRole="alert" style={{ marginBottom: 12, color: c.gold }}>
            The latest update failed. Previously received match data is shown.
          </Label>}
          <View style={{ alignSelf: "flex-start", marginBottom: 16 }}>
            <Button secondary disabled={feed.isFetching} onPress={() => { void feed.refetch(); }}>
              {feed.isFetching ? "Checking…" : "Refresh match"}
            </Button>
          </View>
          <MatchCard match={match} navigable={false} />
          <Card style={{ marginTop: 20 }}>
            <Title compact>Score breakdown</Title>
            <View style={[s.row, { justifyContent: "space-between", marginBottom: 14 }]}>
              <Label muted style={{ flex: 1, fontSize: 11 }}>Period</Label>
              <Label muted style={{ width: 74, textAlign: "center", fontSize: 11 }}>{match.home}</Label>
              <Label muted style={{ width: 74, textAlign: "center", fontSize: 11 }}>{match.away}</Label>
            </View>
            {([
              ["Half-time", match.scores?.halftime],
              ["Full-time", match.scores?.fulltime],
              ["Extra time", match.scores?.extratime],
              ["Penalties", match.scores?.penalty],
            ] as const).map(([period, score]) => (
              <View key={period} style={[s.row, { paddingVertical: 14, borderTopWidth: 1, borderColor: c.line }]}>
                <Label style={{ flex: 1, fontSize: 12 }}>{period}</Label>
                <Label style={{ width: 74, textAlign: "center", fontWeight: "600" }}>{score?.home ?? "—"}</Label>
                <Label style={{ width: 74, textAlign: "center", fontWeight: "600" }}>{score?.away ?? "—"}</Label>
              </View>
            ))}
            <Label muted style={{ fontSize: 11, marginTop: 14 }}>
              A dash means the provider has not supplied a score for that period.
            </Label>
          </Card>
          <Card style={{ marginTop: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <TeamBadge uri={match.leagueLogo} name={match.league} size={36} />
              <View style={{ flex: 1 }}>
                <Label style={{ fontWeight: "600" }}>{match.league}</Label>
                <Label muted style={{ fontSize: 12, marginTop: 4 }}>{match.country || "Country unavailable"}</Label>
              </View>
            </View>
            <Title compact>Match details</Title>
            {[
              ["Kickoff", `${new Date(match.kickoff).toLocaleString()} (your local time)`],
              ["Status", match.statusLabel || match.status],
              ["Match clock", match.elapsed != null ? `${match.elapsed}′${match.addedTime ? ` + ${match.addedTime}′ added` : ""} (provider clock)` : null],
              ["Season", match.season?.toString()],
              ["Round", match.round],
              ["Venue", match.venue],
              ["City", match.city],
              ["Referee", match.referee],
            ].map(([label, value]) => (
              <View key={label} style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: c.line, gap: 5 }}>
                <Label muted style={{ fontSize: 11 }}>{label}</Label>
                <Label style={{ fontSize: 13 }}>{value || "Not provided"}</Label>
              </View>
            ))}
          </Card>
          <Card style={{ marginTop: 20 }}>
            <Label>Match statistics aren’t connected yet.</Label>
            <Label muted style={{ fontSize: 12, marginTop: 8 }}>
              Possession, shots, events, and model probabilities are not
              invented from the score.
            </Label>
          </Card>
        </View>
      ) : (
        <Card>
          <Label>No fixture was returned by the provider.</Label>
        </Card>
      )}
      <View style={{ marginTop: 20 }}>
        <Button secondary onPress={() => router.push("/live")}>
          Back to fixtures
        </Button>
      </View>
    </View>
  );
}
