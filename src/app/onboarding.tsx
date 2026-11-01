import { AppText as Text } from "../components/typography";
import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import Compass from "lucide-react-native/icons/compass";
import Users from "lucide-react-native/icons/users";
import Trophy from "lucide-react-native/icons/trophy";
import { Button, Card, Label } from "../components/ui";
import { colors as c } from "../theme";
const steps = [
  {
    title: "Your game. A whole new perspective.",
    text: "Follow your favorite sports, explore match stats, and turn your instincts into thoughtful predictions.",
    icon: Compass,
  },
  {
    title: "Every fan has a place here.",
    text: "Find your club, share your matchday takes, and join conversations with people who love the game.",
    icon: Users,
  },
  {
    title: "Play a little. Learn a lot.",
    text: "Try sports trivia, call a score, and collect virtual coins. All for fun, with no cash value.",
    icon: Trophy,
  },
];
export default function Onboarding() {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const Icon = current.icon;
  return (
    <View
      style={{
        maxWidth: 520,
        alignSelf: "center",
        width: "100%",
        paddingVertical: 30,
      }}
    >
      <Card style={{ padding: 35, alignItems: "center" }}>
        <View
          style={{
            width: 120,
            height: 120,
            backgroundColor: c.purple,
            borderRadius: 60,
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 30,
          }}
        >
          <Icon size={49} color={c.ink} strokeWidth={1.2} />
        </View>
        <Label muted style={{ fontSize: 10, letterSpacing: 2 }}>
          PREDICT. PLAY. CONNECT.
        </Label>
        <Text
          style={{
            fontSize: 33,
            lineHeight: 41,
            fontWeight: "500",
            color: c.ink,
            textAlign: "center",
            marginVertical: 22,
            letterSpacing: -1,
          }}
        >
          {current.title}
        </Text>
        <Label muted style={{ textAlign: "center", marginBottom: 35 }}>
          {current.text}
        </Label>
        <View style={{ flexDirection: "row", gap: 7, marginBottom: 30 }}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={{
                height: 5,
                width: i === step ? 23 : 5,
                borderRadius: 4,
                backgroundColor: i === step ? c.ink : c.line,
              }}
            />
          ))}
        </View>
        <View style={{ width: "100%", gap: 12 }}>
          <Button
            onPress={() =>
              step < 2 ? setStep(step + 1) : router.push("/auth")
            }
          >
            {step < 2 ? "Next →" : "Find your arena"}
          </Button>
          <Button secondary onPress={() => router.push("/")}>
            Explore the demo
          </Button>
        </View>
      </Card>
    </View>
  );
}
