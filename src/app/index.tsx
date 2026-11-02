import { AppText as Text } from "../components/typography";
import { useState } from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import ArrowUpRight from "lucide-react-native/icons/arrow-up-right";
import Compass from "lucide-react-native/icons/compass";
import Sparkles from "lucide-react-native/icons/sparkles";
import Trophy from "lucide-react-native/icons/trophy";
import { Button, Card, Label, SportSelector, Title, s } from "../components/ui";
import { colors as c, fonts } from "../theme";
import { FootballFixtures } from "../features/sports/football-screen";
import { supabase } from "../lib/supabase";
import { useCurrentProfile } from "../features/account/session";
export default function Home() {
  const [sport, setSport] = useState("Football");
  const { data: profile } = useCurrentProfile();
  return (
    <View>
      <Title subtitle="A new day. A new game. Make it yours.">
        {`Your arena, ${supabase ? profile?.display_name.split(" ")[0] || "sports fan" : "sports fan"}.`}
      </Title>
      <Card
        style={{
          backgroundColor: c.navy,
          borderWidth: 0,
          padding: 28,
          marginBottom: 28,
          overflow: "hidden",
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: -90,
            top: -30,
            width: 300,
            height: 390,
            borderWidth: 1,
            borderRadius: 150,
            borderColor: "#FFFFFF10",
            transform: [{ rotate: "30deg" }],
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: -50,
            top: 10,
            width: 220,
            height: 310,
            borderWidth: 1,
            borderRadius: 120,
            borderColor: "#FFFFFF10",
            transform: [{ rotate: "30deg" }],
          }}
        />
        <View style={s.row}>
          <Compass size={16} color="#D9C399" />
          <Label
            style={{
              fontSize: 9,
              letterSpacing: 1.8,
              color: "#D9C399",
              fontWeight: "600",
            }}
          >
            WELCOME TO YOUR ARENA
          </Label>
        </View>
        <Text
          style={{
            fontSize: 35,
            lineHeight: 45,
            letterSpacing: -1.2,
            fontFamily: fonts.heading,
            color: "white",
            marginTop: 18,
            fontWeight: "500",
          }}
        >
          {"More than a spectator.\nPart of the game."}
        </Text>
        <Label
          style={{
            marginTop: 15,
            maxWidth: 350,
            color: "#B9C5DA",
            fontSize: 12,
            lineHeight: 21,
          }}
        >
          Follow the action. Share your instincts. Find a community that loves
          the game like you do.
        </Label>
        <View style={{ alignSelf: "flex-start", marginTop: 23 }}>
          <Button secondary onPress={() => router.push("/community")}>
            Find your community ↗
          </Button>
        </View>
      </Card>
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
