import { AppText as Text } from "../components/typography";
import { useState } from "react";
import { View, Pressable, Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import Check from "lucide-react-native/icons/check";
import Plus from "lucide-react-native/icons/plus";
import Sparkles from "lucide-react-native/icons/sparkles";
import { Button, Card, Crest, Label, Title, s } from "../components/ui";
import { useApp } from "../store/use-app";
import { colors as c } from "../theme";
const selections = [
  {
    id: "liv-home",
    home: "Liverpool",
    away: "Man City",
    code: "LIV",
    color: "#BE394A",
    selection: "Liverpool to win",
    market: "Match result",
    probability: 44,
  },
  {
    id: "liv-goals",
    home: "Liverpool",
    away: "Man City",
    code: "MCI",
    color: "#749CB9",
    selection: "Over 2.5 goals",
    market: "Total goals",
    probability: 62,
  },
  {
    id: "tennis",
    home: "J. Sinner",
    away: "C. Alcaraz",
    code: "ATP",
    color: "#809653",
    selection: "Over 3.5 sets",
    market: "Total sets",
    probability: 57,
  },
];
export default function Predictions() {
  const picks = useApp((s) => s.picks);
  const toggle = useApp((s) => s.toggle);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const selected = selections.filter((s) => picks.includes(s.id));
  return (
    <View>
      <Title subtitle="A little research. A lot of sporting instinct.">
        Your next prediction
      </Title>
      <Card
        style={{ backgroundColor: "#F6F5FA", borderWidth: 0, marginBottom: 25 }}
      >
        <View style={s.row}>
          <Sparkles size={19} color={c.ink} />
          <Label style={{ fontWeight: "500" }}>
            See the thinking behind the pick.
          </Label>
        </View>
        <Label muted style={{ fontSize: 12, marginTop: 10 }}>
          Illustrative probabilities only. These samples have no measured model
          accuracy and are not betting advice. Predictions are never guarantees.
        </Label>
      </Card>
      <Title compact>Build your slip</Title>
      <View style={{ gap: 13 }}>
        {selections.map((item) => {
          const checked = picks.includes(item.id);
          return (
            <Card key={item.id}>
              <View style={s.row}>
                <Crest code={item.code} color={item.color} size={38} />
                <View style={{ flex: 1 }}>
                  <Label style={{ fontSize: 13, fontWeight: "500" }}>
                    {item.home} vs {item.away}
                  </Label>
                  <Label muted style={{ fontSize: 10 }}>
                    Upcoming sample fixture · {item.market}
                  </Label>
                </View>
              </View>
              <View
                style={[
                  s.row,
                  {
                    marginTop: 18,
                    paddingTop: 15,
                    borderTopWidth: 1,
                    borderColor: c.line,
                    justifyContent: "space-between",
                  },
                ]}
              >
                <View>
                  <Label style={{ fontSize: 13 }}>{item.selection}</Label>
                  <Label muted style={{ fontSize: 10 }}>
                    {item.probability}% illustrative probability · Demo
                  </Label>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${checked ? "Remove" : "Add"} ${item.selection}`}
                  onPress={() => {
                    toggle("picks", item.id);
                    setCode("");
                    setCopied(false);
                  }}
                  style={{
                    padding: 9,
                    backgroundColor: checked ? c.ink : c.canvas,
                    borderRadius: 7,
                  }}
                >
                  {checked ? (
                    <Check size={17} color="white" />
                  ) : (
                    <Plus size={17} color={c.ink} />
                  )}
                </Pressable>
              </View>
            </Card>
          );
        })}
      </View>
      <Card style={{ marginTop: 26 }}>
        <View style={[s.row, { justifyContent: "space-between" }]}>
          <Label style={{ fontWeight: "600" }}>My prediction slip</Label>
          <Label muted style={{ fontSize: 11 }}>
            {selected.length} selections
          </Label>
        </View>
        {selected.length === 0 ? (
          <Label muted style={{ marginVertical: 20 }}>
            Add a selection to start your matchday story.
          </Label>
        ) : (
          selected.map((item) => (
            <View
              key={item.id}
              style={{
                paddingVertical: 15,
                borderBottomWidth: 1,
                borderColor: c.line,
              }}
            >
              <Label style={{ fontSize: 12 }}>
                {item.home} vs {item.away}
              </Label>
              <Label muted style={{ fontSize: 11 }}>
                {item.selection}
              </Label>
            </View>
          ))
        )}
        <Label muted style={{ fontSize: 10, marginVertical: 16 }}>
          User-created prediction · Local demo only · No bookmaker connection
        </Label>
        <Button
          disabled={!selected.length}
          onPress={() => {
            setCode(
              `SC-DEMO-${selected.map((s) => selections.indexOf(s) + 1).join("")}`,
            );
            setCopied(false);
          }}
        >
          Save demo slip & generate code
        </Button>
        {code && (
          <View style={{ marginTop: 20, gap: 12 }}>
            <Text
              selectable
              style={{
                color: c.ink,
                fontSize: 22,
                fontWeight: "600",
                letterSpacing: 2,
              }}
            >
              {code}
            </Text>
            <Label muted style={{ fontSize: 11 }}>
              Saved on this device. Public links and code import need the
              backend.
            </Label>
            <View style={s.row}>
              <Button
                secondary
                onPress={async () => {
                  await Clipboard.setStringAsync(code);
                  setCopied(true);
                }}
              >
                {copied ? "Copied ✓" : "Copy code"}
              </Button>
              <Button
                secondary
                onPress={() => {
                  void Share.share({
                    message: `Sport Coins · Demo prediction slip ${code}\n${selected.map((s) => `${s.home} vs ${s.away}: ${s.selection}`).join("\n")}\nIllustrative predictions only.`,
                  });
                }}
              >
                Share slip
              </Button>
            </View>
          </View>
        )}
      </Card>
    </View>
  );
}
