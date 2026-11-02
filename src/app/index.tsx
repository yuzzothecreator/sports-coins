import { useState } from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import ArrowUpRight from "lucide-react-native/icons/arrow-up-right";
import Sparkles from "lucide-react-native/icons/sparkles";
import Trophy from "lucide-react-native/icons/trophy";
import { Card, Label, SportSelector, Title, s } from "../components/ui";
import { colors as c } from "../theme";
import { FootballFixtures } from "../features/sports/football-screen";
import { supabase } from "../lib/supabase";
import { useCurrentProfile } from "../features/account/session";
export default function Home() {
  const [sport, setSport] = useState("Football");
  const { data: profile } = useCurrentProfile();
  return (
    <View>
      <Title subtitle="Live action, upcoming kickoffs, and the final word.">
        {`Your arena, ${supabase ? profile?.display_name.split(" ")[0] || "sports fan" : "sports fan"}.`}
      </Title>
      <View style={{ marginBottom: 27 }}>
        <SportSelector value={sport} onChange={setSport} />
      </View>
      <Title
        compact
        action="All fixtures"
        onAction={() => router.push("/live")}
      >
        Around the grounds
      </Title>
      {sport === "Football" ? (
        <FootballFixtures compact />
      ) : (
        <Card>
          <Label>{sport} coverage is not connected.</Label>
          <Label muted style={{ marginTop: 8, fontSize: 12 }}>
            Real results will appear when an adapter for this sport is
            connected.
          </Label>
        </Card>
      )}
      <View style={{ marginTop: 30 }}>
        <Title compact>Make your next move</Title>
        <View style={{ gap: 12 }}>
          {[
            {
              title: "Trust your matchday instincts",
              text: "Build a prediction slip and share your thinking.",
              icon: Sparkles,
              path: "/predictions",
            },
            {
              title: "A daily dose of friendly competition",
              text: "Test your knowledge in today’s sports trivia.",
              icon: Trophy,
              path: "/play",
            },
          ].map((x) => (
            <Pressable
              accessibilityRole="link"
              key={x.title}
              onPress={() => router.push(x.path as any)}
            >
              <Card style={[s.row, { gap: 17 }]}>
                <x.icon size={22} color={c.ink} />
                <View style={{ flex: 1 }}>
                  <Label style={{ fontWeight: "500" }}>{x.title}</Label>
                  <Label muted style={{ fontSize: 12, marginTop: 4 }}>
                    {x.text}
                  </Label>
                </View>
                <ArrowUpRight size={18} color={c.muted} />
              </Card>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
