import { useState } from "react";
import { View, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Badge,
  Button,
  Card,
  Label,
  MatchCard,
  SearchBox,
  SportSelector,
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
  const { width } = useWindowDimensions();
  const columns = width >= 1100;
  const params = useLocalSearchParams<{ date?: string; status?: string }>();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const selectedDate = !compact && typeof params.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : today;
  const feed = useFootballFeed(undefined, compact ? undefined : selectedDate);
  const changeDate = (offset: number) => {
    const date = new Date(`${selectedDate}T12:00:00Z`);
    if (!Number.isFinite(date.getTime())) return;
    date.setUTCDate(date.getUTCDate() + offset);
    router.setParams({ date: date.toISOString().slice(0, 10) });
  };
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(() => !compact && ["In play", "Upcoming", "Completed"].includes(params.status || "") ? params.status! : "All");
  const [page, setPage] = useState({ key: "", count: 30 });
  const pageKey = JSON.stringify([selectedDate, search, status]);
  const visibleCount = page.key === pageKey ? page.count : 30;
  const fixtures = feed.data?.fixtures || [];
  const counts = {
    All: fixtures.length,
    "In play": fixtures.filter((f) => ["live", "paused"].includes(f.phase)).length,
    Upcoming: fixtures.filter((f) => f.phase === "scheduled").length,
    Completed: fixtures.filter((f) => f.phase === "finished").length,
  };
  const rank = (phase: string) => ["live", "paused"].includes(phase) ? 0 : phase === "scheduled" ? 1 : phase === "finished" ? 2 : 3;
  const rows = fixtures.filter(
    (f) =>
      `${f.home} ${f.away} ${f.league}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (status === "All" ||
        (status === "In play" && ["live", "paused"].includes(f.phase)) ||
        (status === "Upcoming" && f.phase === "scheduled") ||
        (status === "Completed" && f.phase === "finished")),
  ).sort((a, b) => rank(a.phase) - rank(b.phase) ||
    (a.phase === "finished" ? Date.parse(b.kickoff) - Date.parse(a.kickoff) : Date.parse(a.kickoff) - Date.parse(b.kickoff)));
  const homeSelection = [
    ...rows.filter((match) => rank(match.phase) === 0).slice(0, 2),
    ...rows.filter((match) => rank(match.phase) === 1).slice(0, 2),
    ...rows.filter((match) => rank(match.phase) === 2).slice(0, 1),
  ];
  const displayed = compact
    ? [...homeSelection, ...rows.filter((match) => !homeSelection.includes(match))].slice(0, 5).sort((a, b) => rank(a.phase) - rank(b.phase))
    : rows.slice(0, visibleCount);
  const section = (phase: string) => ["live", "paused"].includes(phase) ? "In play" : phase === "scheduled" ? "Next kickoffs" : phase === "finished" ? "Final whistle" : "Other matches";
  return (
    <View>
      {feed.data && <View style={{ backgroundColor: c.navy, borderRadius: 22, padding: 22, marginBottom: 24, overflow: "hidden" }}>
        <View style={[s.row, { justifyContent: "space-between", marginBottom: 20 }]}>
          <Label style={{ color: "#D9C399", fontSize: 10, fontWeight: "600", letterSpacing: 1.8 }}>THE MATCHDAY EDIT</Label>
          <Label style={{ color: "#A9B7CF", fontSize: 10 }}>{feed.data.date.slice(5).replace("-", " / ")}</Label>
        </View>
        <Label style={{ color: "white", fontSize: 25, fontWeight: "700", letterSpacing: -0.7 }}>Every match. At a glance.</Label>
        <View style={[s.row, { marginTop: 24, gap: 0 }]}>
          {([ ["In play", counts["In play"], "#9AECC6"], ["Upcoming", counts.Upcoming, "#D9C399"], ["Completed", counts.Completed, "#D1D9E6"] ] as const).map(([label, count, color], index) => (
            <Pressable key={label} accessibilityRole="button" accessibilityLabel={`Show ${count} ${label.toLowerCase()} matches`}
              onPress={() => compact ? router.push({ pathname: "/live", params: { status: label } }) : setStatus(label)}
              style={{ flex: 1, minHeight: 56, paddingLeft: index ? 15 : 0, borderLeftWidth: index ? 1 : 0, borderColor: "#FFFFFF20" }}>
              <Label style={{ color, fontSize: 26, fontWeight: "700", fontVariant: ["tabular-nums"] }}>{count}</Label>
              <Label style={{ color: "#B9C8DD", fontSize: 10, marginTop: 5 }}>{label}</Label>
            </Pressable>
          ))}
        </View>
        {(feed.data.stale || feed.error) && <Label style={{ color: "#D9C399", fontSize: 10, marginTop: 16 }}>Saved data · updates delayed</Label>}
      </View>}
      {!compact && (
        <View style={{ marginBottom: 18 }}>
          <Title compact>Match calendar</Title>
          <View style={[s.row, { flexWrap: "wrap", justifyContent: "space-between", marginBottom: 12 }]}>
            <Button secondary onPress={() => changeDate(-1)}>← Previous day</Button>
            <Button secondary disabled={selectedDate >= today} onPress={() => changeDate(1)}>Next day →</Button>
          </View>
          <Label style={{ textAlign: "center", marginBottom: 12 }}>{selectedDate} · Africa/Nairobi</Label>
          {selectedDate !== today && <View style={{ marginBottom: 12 }}>
            <Button secondary onPress={() => router.setParams({ date: today })}>Back to today</Button>
          </View>}
          <SearchBox
            value={search}
            onChangeText={setSearch}
            placeholder="Search provider fixtures"
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 16 }}>
            {(["All", "In play", "Upcoming", "Completed"] as const).map((item) => (
              <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: status === item }} onPress={() => setStatus(item)}
                style={[s.row, { minHeight: 44, gap: 8, paddingHorizontal: 16, borderRadius: 24, backgroundColor: status === item ? c.ink : "white", borderWidth: 1, borderColor: status === item ? c.ink : c.line }]}>
                <Label style={{ fontSize: 12, fontWeight: "600", color: status === item ? "white" : c.muted }}>{item}</Label>
                <Label style={{ fontSize: 10, color: status === item ? "#D9C399" : c.muted }}>{counts[item]}</Label>
              </Pressable>
            ))}
          </ScrollView>
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
              {Array.from(new Set(displayed.map((match) => section(match.phase)))).map((heading, index) => (
                <View key={heading}>
                    <View style={[s.row, { gap: 8, marginBottom: 13, marginTop: index ? 10 : 0 }]}>
                      <View style={{ height: 6, width: 6, borderRadius: 3, backgroundColor: heading === "In play" ? c.green : heading === "Next kickoffs" ? c.gold : c.muted }} />
                      <Label style={{ fontSize: 13, fontWeight: "600" }}>{heading}</Label>
                    </View>
                    <View style={{ flexDirection: columns ? "row" : "column", flexWrap: "wrap", gap: 14 }}>
                      {displayed.filter((match) => section(match.phase) === heading).map((match) => (
                        <View key={match.id} style={{ width: columns ? "48.8%" : "100%" }}>
                          <MatchCard match={match} fixtureDate={compact ? undefined : selectedDate} />
                        </View>
                      ))}
                    </View>
                </View>
              ))}
              {!compact && rows.length > visibleCount && (
                <Button secondary onPress={() => setPage({ key: pageKey, count: visibleCount + 30 })}>
                  {`Show more matches (${Math.min(visibleCount, rows.length)} of ${rows.length})`}
                </Button>
              )}
              {rows.length === 0 && (
                <Card>
                  <Label>No provider fixtures in this view.</Label>
                  <Label muted style={{ fontSize: 12, marginTop: 8 }}>
                    There may be no matching matches on this date, or your plan may
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
