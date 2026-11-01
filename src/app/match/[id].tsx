import { useLocalSearchParams, router } from "expo-router";
import { View } from "react-native";
import { fixtures } from "../../data/demo";
import { Button, Card, Label, MatchCard, Title, s } from "../../components/ui";
import { colors as c } from "../../theme";
export function generateStaticParams() {
  return fixtures.map((f) => ({ id: f.id }));
}
export default function Match() {
  const { id } = useLocalSearchParams();
  const match = fixtures.find((m) => m.id === id);
  if (!match)
    return (
      <View>
        <Title>Fixture not found</Title>
        <Button onPress={() => router.push("/live")}>Back to fixtures</Button>
      </View>
    );
  return (
    <View>
      <Title subtitle={`${match.league} · Demonstration data`}>
        {match.home} vs {match.away}
      </Title>
      <MatchCard match={match} />
      <Card style={{ marginTop: 22 }}>
        <Label style={{ fontSize: 18, fontWeight: "500", marginBottom: 22 }}>
          The match in numbers
        </Label>
        {(match.sport === "Football"
          ? [
              ["Possession", "58%", "42%"],
              ["Shots", "12", "7"],
              ["Shots on target", "6", "3"],
              ["Corners", "5", "2"],
            ]
          : match.sport === "Basketball"
            ? [
                ["Rebounds", "32", "29"],
                ["Assists", "18", "16"],
                ["Turnovers", "8", "11"],
              ]
            : [
                ["Aces", "8", "6"],
                ["Winners", "21", "19"],
                ["Break points won", "3", "2"],
              ]
        ).map(([name, a, b]) => (
          <View key={name} style={{ marginBottom: 20 }}>
            <View style={[s.row, { justifyContent: "space-between" }]}>
              <Label style={{ fontSize: 12 }}>{a}</Label>
              <Label muted style={{ fontSize: 12 }}>
                {name}
              </Label>
              <Label style={{ fontSize: 12 }}>{b}</Label>
            </View>
            <View
              style={{
                height: 4,
                backgroundColor: c.line,
                borderRadius: 4,
                marginTop: 10,
              }}
            >
              <View
                style={{
                  height: 4,
                  width: "58%",
                  backgroundColor: c.ink,
                  borderRadius: 4,
                }}
              />
            </View>
          </View>
        ))}
        <Label muted style={{ fontSize: 10 }}>
          Illustrative statistics · Not from a live data provider
        </Label>
      </Card>
      <View style={{ gap: 12, marginTop: 22 }}>
        <Button onPress={() => router.push("/community?tab=Groups")}>
          Join the matchday conversation
        </Button>
        <Button secondary onPress={() => router.push("/live")}>
          Back to fixtures
        </Button>
      </View>
    </View>
  );
}
