import { useState } from "react";
import { View } from "react-native";
import {
  Badge,
  Button,
  Card,
  Label,
  MatchCard,
  SearchBox,
  SportSelector,
  Tabs,
  Title,
  s,
} from "../../components/ui";
import { FootballFeed, useFootballFeed } from "../../services/football";
import { colors as c } from "../../theme";

export function FootballStatus({
  feed,
  failed = false,
}: {
  feed: FootballFeed;
  failed?: boolean;
}) {
  return (
    <View style={{ marginVertical: 15, gap: 6 }}>
      <View
        style={[s.row, { justifyContent: "space-between", flexWrap: "wrap" }]}
      >
        <Badge tone={feed.stale || failed ? "gold" : "green"}>
          {feed.stale || failed
            ? "Saved provider data · stale"
            : "API-Football"}
        </Badge>
        <Label muted style={{ fontSize: 10 }}>
          Checked {new Date(feed.fetchedAt).toLocaleTimeString()}
        </Label>
      </View>
      <Label muted style={{ fontSize: 11 }}>
        Provider refresh interval:{" "}
        {feed.refreshSeconds < 60
          ? `${feed.refreshSeconds} seconds`
          : `${Math.round(feed.refreshSeconds / 60)} minutes`}{" "}
        · {feed.timezone}
      </Label>
      {feed.warning && (
        <Label
          accessibilityRole="alert"
          style={{ color: c.gold, fontSize: 11 }}
        >
          {feed.warning}
        </Label>
      )}
      {feed.partial && (
        <Label muted style={{ fontSize: 11 }}>
          The provider returned a partial page of fixtures. This view is
          incomplete.
        </Label>
      )}
    </View>
  );
}
export function FootballFixtures({ compact = false }: { compact?: boolean }) {
  const feed = useFootballFeed();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const rows = (feed.data?.fixtures || []).filter(
    (f) =>
      `${f.home} ${f.away} ${f.league}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (status === "All" ||
        (status === "In play" && ["live", "paused"].includes(f.phase)) ||
        (status === "Upcoming" && f.phase === "scheduled") ||
        (status === "Completed" && f.phase === "finished")),
  );
  return (
    <View>
      {!compact && (
        <View style={{ marginBottom: 18 }}>
          <SearchBox
            value={search}
            onChangeText={setSearch}
            placeholder="Search provider fixtures"
          />
          <Tabs
            items={["All", "In play", "Upcoming", "Completed"]}
            value={status}
            onChange={setStatus}
          />
        </View>
      )}
      {feed.isPending ? (
        <Card>
          <Label>Contacting the sports backend…</Label>
        </Card>
      ) : feed.error && !feed.data ? (
        <Card>
          <Badge tone="gold">Data unavailable</Badge>
          <Label style={{ marginTop: 16, fontWeight: "600" }}>
            Real scores need a provider connection.
          </Label>
          <Label muted style={{ fontSize: 12, marginVertical: 14 }}>
            {feed.error.message}
          </Label>
          <Button
            disabled={feed.isFetching}
            onPress={() => {
              void feed.refetch();
            }}
          >
            {feed.isFetching ? "Checking…" : "Check connection"}
          </Button>
          <Label muted style={{ fontSize: 10, marginTop: 14 }}>
            No sample scores are substituted for provider failures.
          </Label>
        </Card>
      ) : (
        feed.data && (
          <View>
            <FootballStatus feed={feed.data} failed={!!feed.error} />
            {feed.error && (
              <Label
                accessibilityRole="alert"
                style={{ color: c.gold, fontSize: 11, marginBottom: 12 }}
              >
                Refresh failed. The previously received data remains visible.
              </Label>
            )}
            <View
              style={[
                s.row,
                { justifyContent: "space-between", marginBottom: 18 },
              ]}
            >
              <Label style={{ fontWeight: "600", fontSize: 12 }}>
                Fixtures · {feed.data.date}
              </Label>
              <Button
                secondary
                disabled={feed.isFetching}
                onPress={() => {
                  void feed.refetch();
                }}
              >
                {feed.isFetching ? "Checking…" : "Refresh"}
              </Button>
            </View>
            <View style={{ gap: 14 }}>
              {(compact ? rows.slice(0, 3) : rows).map((f) => (
                <MatchCard key={f.id} match={f} />
              ))}
              {rows.length === 0 && (
                <Card>
                  <Label>No provider fixtures in this view.</Label>
                  <Label muted style={{ fontSize: 12, marginTop: 8 }}>
                    There may be no matching matches today, or your plan may
                    limit this season’s coverage.
                  </Label>
                </Card>
              )}
            </View>
          </View>
        )
      )}
      <Label muted style={{ fontSize: 10, lineHeight: 18, marginTop: 20 }}>
        Scores and schedules supplied by API-Football. Free-tier updates are
        cached to protect its limited daily quota. Coverage and provider latency
        can vary.
      </Label>
    </View>
  );
}
export function FootballScreen() {
  const [sport, setSport] = useState("Football");
  return (
    <View>
      <Title subtitle="Provider scores, explicit update times, and no simulated results.">
        Around the grounds
      </Title>
      <View style={{ marginBottom: 24 }}>
        <SportSelector value={sport} onChange={setSport} />
      </View>
      {sport === "Football" ? (
        <FootballFixtures />
      ) : (
        <Card>
          <Badge tone="gold">Not connected</Badge>
          <Label style={{ fontWeight: "600", marginTop: 15 }}>
            {sport} coverage isn’t connected.
          </Label>
          <Label muted style={{ marginTop: 10, fontSize: 12 }}>
            This integration uses API-Football. Other sports require their own
            provider adapters; no sample results are shown here.
          </Label>
        </Card>
      )}
    </View>
  );
}
