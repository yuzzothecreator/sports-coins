import { AppText as Text } from "../components/typography";
import { useState } from "react";
import { View, Pressable } from "react-native";
import Coins from "lucide-react-native/icons/coins";
import Flame from "lucide-react-native/icons/flame";
import Trophy from "lucide-react-native/icons/trophy";
import { Avatar, Button, Card, Label, Tabs, Title, s } from "../components/ui";
import { useApp } from "../store/use-app";
import { colors as c } from "../theme";
export default function Play() {
  const { claim, rewardClaimed, triviaDone, trivia } = useApp();
  const [answer, setAnswer] = useState<number | null>(null);
  const [tab, setTab] = useState("This week");
  const [score, setScore] = useState([0, 0]);
  const [submitted, setSubmitted] = useState(false);
  return (
    <View>
      <Title subtitle="Good instincts deserve a little recognition.">
        Play for the love of it.
      </Title>
      <Label muted style={{ fontSize: 11, marginBottom: 20 }}>
        Free to play · Demo coins have no monetary value
      </Label>
      <Card
        style={{ backgroundColor: "#F8F6EF", borderWidth: 0, marginBottom: 22 }}
      >
        <View style={s.row}>
          <Flame size={23} color="#A18A57" />
          <View style={{ flex: 1 }}>
            <Label style={{ fontWeight: "600" }}>
              Show up. Stay curious. Get rewarded.
            </Label>
            <Label muted style={{ fontSize: 12, marginTop: 6 }}>
              Your daily check-in earns 50 demo coins.
            </Label>
          </View>
        </View>
        <View style={{ marginTop: 18, alignSelf: "flex-start" }}>
          <Button
            disabled={rewardClaimed === new Date().toDateString()}
            onPress={claim}
          >
            {rewardClaimed === new Date().toDateString()
              ? "See you tomorrow ✓"
              : "Claim daily reward"}
          </Button>
        </View>
      </Card>
      <Card>
        <View style={[s.row, { justifyContent: "space-between" }]}>
          <Label style={{ fontSize: 17, fontWeight: "500" }}>
            The daily sports question
          </Label>
          <View style={s.row}>
            <Coins size={15} color="#A18A57" />
            <Label muted style={{ fontSize: 11 }}>
              +100
            </Label>
          </View>
        </View>
        <Label style={{ marginVertical: 22, fontSize: 16 }}>
          How many players does a football team start on the pitch?
        </Label>
        <View style={{ gap: 9 }}>
          {["9 players", "10 players", "11 players", "12 players"].map(
            (a, i) => (
              <Pressable
                accessibilityRole="button"
                disabled={triviaDone}
                key={a}
                onPress={() => {
                  setAnswer(i);
                  trivia(i === 2);
                }}
                style={{
                  padding: 14,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: triviaDone && i === 2 ? c.green : c.line,
                  backgroundColor:
                    triviaDone && i === 2
                      ? c.softGreen
                      : answer === i
                        ? c.purple
                        : "white",
                }}
              >
                <Label style={{ fontSize: 13 }}>
                  {a}
                  {triviaDone && i === 2 ? "  ✓" : ""}
                </Label>
              </Pressable>
            ),
          )}
        </View>
        {triviaDone && (
          <Label style={{ marginTop: 17, color: c.green }}>
            {answer === 2
              ? "That’s the one! 100 demo coins earned."
              : "A team starts with 11 players. Challenge completed."}
          </Label>
        )}
        <Label muted style={{ fontSize: 10, marginTop: 18 }}>
          One answer per device for this sample question. No time limit.
        </Label>
      </Card>
      <Card style={{ marginTop: 22 }}>
        <Label style={{ fontSize: 17, fontWeight: "500" }}>
          Call the score
        </Label>
        <Label muted style={{ marginVertical: 10, fontSize: 12 }}>
          Liverpool vs Man City · Upcoming demo fixture
        </Label>
        <View
          style={[
            s.row,
            { justifyContent: "center", marginVertical: 15, gap: 35 },
          ]}
        >
          {["Liverpool", "Man City"].map((name, i) => (
            <View key={name} style={{ alignItems: "center", gap: 12 }}>
              <Label style={{ fontSize: 12 }}>{name}</Label>
              <View style={s.row}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Decrease ${name} score`}
                  disabled={submitted}
                  onPress={() =>
                    setScore((v) =>
                      v.map((n, j) => (j === i ? Math.max(0, n - 1) : n)),
                    )
                  }
                  style={{ padding: 10 }}
                >
                  <Label>−</Label>
                </Pressable>
                <Text style={{ fontSize: 29, color: c.ink }}>{score[i]}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Increase ${name} score`}
                  disabled={submitted}
                  onPress={() =>
                    setScore((v) =>
                      v.map((n, j) => (j === i ? Math.min(20, n + 1) : n)),
                    )
                  }
                  style={{ padding: 10 }}
                >
                  <Label>+</Label>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
        <Button disabled={submitted} onPress={() => setSubmitted(true)}>
          {submitted
            ? `Demo pick saved: ${score[0]}–${score[1]}`
            : "Save score prediction"}
        </Button>
        <Label muted style={{ fontSize: 10, marginTop: 12 }}>
          Practice only · No settlement or reward until real fixtures and server
          validation are connected.
        </Label>
      </Card>
      <View style={{ marginTop: 29 }}>
        <Title compact>This week’s game changers</Title>
        <Tabs items={["This week", "All time"]} value={tab} onChange={setTab} />
        <Label muted style={{ fontSize: 10, marginBottom: 15 }}>
          ILLUSTRATIVE LEADERBOARD · Participation points
        </Label>
        {(tab === "This week"
          ? ["Amara Okafor", "Daniel Kimani", "Maya Chen"]
          : ["Maya Chen", "Amara Okafor", "Daniel Kimani"]
        ).map((name, i) => (
          <View
            key={name}
            style={[
              s.row,
              {
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderColor: c.line,
                gap: 15,
              },
            ]}
          >
            <Label muted style={{ width: 17 }}>
              0{i + 1}
            </Label>
            <Avatar id={[47, 13, 44][i]} size={35} />
            <Label style={{ flex: 1, fontSize: 13 }}>{name}</Label>
            <Trophy size={15} color="#A18A57" />
            <Label style={{ fontSize: 12 }}>
              {(tab === "This week" ? 2450 : 18450) - i * 210} pts
            </Label>
          </View>
        ))}
      </View>
    </View>
  );
}
