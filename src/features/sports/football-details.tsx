import { View } from "react-native";
import { router } from "expo-router";
import { Button, Card, Label, MatchCard, Title } from "../../components/ui";
import { useFootballFeed } from "../../services/football";
import { FootballStatus } from "./football-screen";
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
          <MatchCard match={match} navigable={false} />
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
