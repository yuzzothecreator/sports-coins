import { AppText as Text } from "../components/typography";
import { useState } from "react";
import { Slot, router, usePathname } from "expo-router";
import {
  View,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Modal,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Home from "lucide-react-native/icons/house";
import ChartNoAxesCombined from "lucide-react-native/icons/chart-no-axes-combined";
import Radio from "lucide-react-native/icons/radio";
import Gamepad2 from "lucide-react-native/icons/gamepad-2";
import Users from "lucide-react-native/icons/users";
import UserRound from "lucide-react-native/icons/user-round";
import Bell from "lucide-react-native/icons/bell";
import Coins from "lucide-react-native/icons/coins";
import ChevronDown from "lucide-react-native/icons/chevron-down";
import ArrowUpRight from "lucide-react-native/icons/arrow-up-right";
import CircleHelp from "lucide-react-native/icons/circle-question-mark";
import X from "lucide-react-native/icons/x";
import Hexagon from "lucide-react-native/icons/hexagon";
import Trophy from "lucide-react-native/icons/trophy";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { colors as c, fonts } from "../theme";
import { useBrandFonts } from "../lib/use-brand-fonts";
import { Avatar, Button, Card, Crest, Label, s } from "../components/ui";
import { useApp } from "../store/use-app";
import { people, rooms } from "../data/demo";
import { supabase } from "../lib/supabase";
import {
  SessionProvider,
  useSession,
  useCurrentProfile,
} from "../features/account/session";
const client = new QueryClient();
const nav = [
  { name: "Home", path: "/", icon: Home },
  { name: "Predictions", path: "/predictions", icon: ChartNoAxesCombined },
  { name: "Live scores", path: "/live", icon: Radio },
  { name: "Play & earn", path: "/play", icon: Gamepad2 },
  { name: "Community", path: "/community", icon: Users },
  { name: "Profile", path: "/profile", icon: UserRound },
];
function Brand() {
  const { width } = useWindowDimensions();
  const compact = width < 1000;
  return (
    <View style={[s.row, { gap: 10 }]}>
      <View
        style={{
          width: 34,
          height: 37,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Hexagon size={35} color={c.ink} strokeWidth={2} />
        <Text
          style={{
            position: "absolute",
            color: c.ink,
            fontWeight: "800",
            fontSize: 19,
          }}
        >
          S
        </Text>
      </View>
      <View>
        <Text
          style={{
            fontSize: compact ? 13 : 16,
            fontWeight: "800",
            fontFamily: fonts.display,
            letterSpacing: compact ? 0.8 : 1.1,
            color: c.ink,
          }}
        >
          SPORT COINS
        </Text>
        <Text
          style={{
            fontSize: compact ? 6.5 : 7,
            color: c.muted,
            letterSpacing: 1.15,
            marginTop: 2,
          }}
        >
          PREDICT. PLAY. CONNECT.
        </Text>
      </View>
    </View>
  );
}
export default function RootLayout() {
  return (
    <QueryClientProvider client={client}>
      <SessionProvider>
        <Layout />
      </SessionProvider>
    </QueryClientProvider>
  );
}
function Layout() {
  const [fontsLoaded, fontError] = useBrandFonts();
  const { width } = useWindowDimensions();
  const desktop = width >= 1000;
  const path = usePathname();
  const [notice, setNotice] = useState(false);
  const coins = useApp((x) => x.demoCoins);
  const claim = useApp((x) => x.claim);
  const claimed = useApp((x) => x.rewardClaimed);
  const { session } = useSession();
  const { data: profile } = useCurrentProfile();
  const displayName = !supabase
    ? "Alex Morgan"
    : profile?.display_name || (session ? "Sports fan" : "Guest");
  const active = nav.find((n) => n.path === path)?.name || "Sport Coins";
  if (Platform.OS !== "web" && !fontsLoaded && !fontError)
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          backgroundColor: c.canvas,
        }}
      >
        <Hexagon size={44} color={c.ink} />
        <ActivityIndicator
          color={c.gold}
          accessibilityLabel="Loading Sport Coins"
        />
      </View>
    );
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{ flex: 1, flexDirection: "row" }}>
          {desktop && (
            <View
              style={{
                width: 236,
                borderRightWidth: 1,
                borderColor: c.line,
                padding: 27,
                paddingHorizontal: 24,
                justifyContent: "space-between",
              }}
            >
              <View>
                <Pressable
                  accessibilityRole="link"
                  onPress={() => router.push("/")}
                >
                  <Brand />
                </Pressable>
                <Label
                  muted
                  style={{
                    fontSize: 9,
                    letterSpacing: 2,
                    marginTop: 56,
                    marginBottom: 17,
                    paddingLeft: 13,
                  }}
                >
                  YOUR ARENA
                </Label>
                {nav.map((n) => {
                  const selected = path === n.path;
                  return (
                    <Pressable
                      accessibilityRole="link"
                      key={n.path}
                      onPress={() => router.push(n.path as any)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 14,
                        padding: 14,
                        paddingVertical: 15,
                        marginBottom: 5,
                        borderRadius: 12,
                        backgroundColor: selected ? c.ink : "transparent",
                      }}
                    >
                      <n.icon
                        size={19}
                        color={selected ? "#D9C399" : c.muted}
                        strokeWidth={1.7}
                      />
                      <Label
                        style={{
                          color: selected ? "white" : c.muted,
                          fontSize: 13,
                          fontWeight: selected ? "600" : "500",
                        }}
                      >
                        {n.name}
                      </Label>
                      {n.name === "Community" && (
                        <View
                          style={{
                            marginLeft: "auto",
                            backgroundColor: selected ? "#36364E" : c.purple,
                            paddingHorizontal: 6,
                            borderRadius: 4,
                          }}
                        >
                          <Label
                            style={{
                              fontSize: 9,
                              color: selected ? "white" : c.ink,
                            }}
                          >
                            12
                          </Label>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
                <Card
                  style={{
                    marginTop: 38,
                    backgroundColor: "#F7F6FB",
                    padding: 17,
                    borderWidth: 0,
                  }}
                >
                  <Coins size={22} color="#A18A57" />
                  <Label style={{ fontWeight: "600", marginTop: 12 }}>
                    A little play. A daily reward.
                  </Label>
                  <Label
                    muted
                    style={{ fontSize: 11, marginTop: 7, marginBottom: 15 }}
                  >
                    Your next great prediction starts here.
                  </Label>
                  <Button
                    onPress={claim}
                    disabled={claimed === new Date().toDateString()}
                  >
                    {claimed === new Date().toDateString()
                      ? "Claimed today"
                      : "Claim 50 demo coins"}
                  </Button>
                </Card>
              </View>
              <View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push("/onboarding")}
                  style={[s.row, { padding: 10, marginBottom: 20 }]}
                >
                  <CircleHelp size={18} color={c.muted} />
                  <Label muted style={{ fontSize: 12 }}>
                    How Sport Coins works
                  </Label>
                </Pressable>
                <Pressable
                  accessibilityRole="link"
                  onPress={() => router.push("/profile")}
                  style={[
                    s.row,
                    {
                      borderTopWidth: 1,
                      borderColor: c.line,
                      paddingTop: 22,
                    },
                  ]}
                >
                  <Avatar size={36} name={supabase ? displayName : undefined} />
                  <View>
                    <Label style={{ fontSize: 12, fontWeight: "600" }}>
                      {displayName}
                    </Label>
                    <Label muted style={{ fontSize: 10 }}>
                      {supabase
                        ? session
                          ? "Your account"
                          : "Sign in to connect"
                        : "The matchday regular"}
                    </Label>
                  </View>
                  <ChevronDown size={13} color={c.muted} />
                </Pressable>
              </View>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <View
              style={{
                height: desktop ? 83 : 66,
                borderBottomWidth: 1,
                borderColor: c.line,
                paddingHorizontal: desktop ? 38 : 20,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {desktop ? (
                <View style={s.row}>
                  <Label muted style={{ fontSize: 12 }}>
                    Your arena
                  </Label>
                  <Label muted style={{ marginHorizontal: 6 }}>
                    /
                  </Label>
                  <Label style={{ fontSize: 12 }}>{active}</Label>
                </View>
              ) : (
                <Brand />
              )}
              <View style={[s.row, { gap: desktop ? 23 : 14 }]}>
                <View
                  style={[
                    s.row,
                    {
                      backgroundColor: "#F8F6F0",
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 20,
                    },
                  ]}
                >
                  <Coins size={16} color="#A18A57" />
                  <Label style={{ fontSize: 12, fontWeight: "600" }}>
                    {supabase ? "Demo games" : coins.toLocaleString()}
                  </Label>
                  {desktop && !supabase && (
                    <Label muted style={{ fontSize: 10 }}>
                      demo coins
                    </Label>
                  )}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Notifications"
                  onPress={() => setNotice(true)}
                  style={{
                    minHeight: 44,
                    width: 36,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bell size={21} color={c.ink} strokeWidth={1.5} />
                  <View
                    style={{
                      position: "absolute",
                      right: 8,
                      top: 8,
                      width: 5,
                      height: 5,
                      backgroundColor: "#B7965A",
                      borderRadius: 5,
                    }}
                  />
                </Pressable>
                {desktop && (
                  <Pressable
                    accessibilityRole="link"
                    onPress={() => router.push("/profile")}
                  >
                    <Avatar
                      size={34}
                      name={supabase ? displayName : undefined}
                    />
                  </Pressable>
                )}
              </View>
            </View>
            <ScrollView
              key={path}
              contentContainerStyle={{
                padding: desktop ? 38 : 20,
                paddingTop: desktop ? 35 : 26,
                paddingBottom: 35,
                flexGrow: 1,
              }}
              style={{ backgroundColor: c.canvas }}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: 36,
                  maxWidth: supabase ? 900 : 1320,
                  width: "100%",
                  alignSelf: "center",
                }}
              >
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Slot />
                </View>
                {width >= 1250 && !supabase && (
                  <View style={{ width: 286, gap: 27 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Label style={{ fontWeight: "600" }}>
                        Your matchday, connected.
                      </Label>
                      <ArrowUpRight size={16} color={c.muted} />
                    </View>
                    <Card
                      style={{ backgroundColor: "#F8F8FA", borderWidth: 0 }}
                    >
                      <View style={s.row}>
                        <View
                          style={{
                            width: 6,
                            height: 6,
                            backgroundColor: c.green,
                            borderRadius: 5,
                          }}
                        />
                        <Label muted style={{ fontSize: 10, letterSpacing: 1 }}>
                          THE BIG CONVERSATION
                        </Label>
                      </View>
                      <Text
                        style={{
                          color: c.ink,
                          fontSize: 25,
                          fontFamily: fonts.heading,
                          lineHeight: 32,
                          letterSpacing: -0.8,
                          fontWeight: "500",
                          marginTop: 18,
                        }}
                      >
                        {"A game of opinions.\nFind your people."}
                      </Text>
                      <Label muted style={{ marginVertical: 15, fontSize: 12 }}>
                        From the first whistle to the final word. There’s a room
                        for every fan.
                      </Label>
                      <Button
                        onPress={() => router.push("/community?tab=Groups")}
                      >
                        Explore communities →
                      </Button>
                    </Card>
                    <View>
                      <Label style={{ fontWeight: "600", marginBottom: 20 }}>
                        Suggested for you
                      </Label>
                      {people.slice(0, 3).map((name, i) => (
                        <SuggestedPerson key={name} name={name} index={i} />
                      ))}
                    </View>
                    <View style={{ height: 1, backgroundColor: c.line }} />
                    <View>
                      <View
                        style={[
                          s.row,
                          {
                            justifyContent: "space-between",
                            marginBottom: 20,
                          },
                        ]}
                      >
                        <Label style={{ fontWeight: "600" }}>
                          Rooms worth joining
                        </Label>
                        <Users size={16} color={c.muted} />
                      </View>
                      {rooms.slice(0, 3).map((room) => (
                        <Pressable
                          key={room.name}
                          accessibilityRole="button"
                          onPress={() => router.push("/community?tab=Groups")}
                          style={[s.row, { marginBottom: 19, gap: 12 }]}
                        >
                          <Crest
                            code={room.code}
                            color={room.color}
                            size={35}
                          />
                          <View>
                            <Label style={{ fontSize: 12 }}>{room.name}</Label>
                            <Label muted style={{ fontSize: 10 }}>
                              {room.members} members
                            </Label>
                          </View>
                          <ArrowUpRight
                            size={13}
                            color={c.muted}
                            style={{ marginLeft: "auto" }}
                          />
                        </Pressable>
                      ))}
                    </View>
                    <View
                      style={{
                        backgroundColor: "#FBFAF6",
                        borderRadius: 10,
                        padding: 18,
                      }}
                    >
                      <View style={s.row}>
                        <Trophy size={19} color="#A18A57" />
                        <Label style={{ fontSize: 12, fontWeight: "600" }}>
                          A little friendly competition
                        </Label>
                      </View>
                      <Label muted style={{ fontSize: 11, marginVertical: 10 }}>
                        Test your sports knowledge. Climb the ranks. Enjoy the
                        game.
                      </Label>
                      <Pressable
                        accessibilityRole="link"
                        onPress={() => router.push("/play")}
                      >
                        <Label style={{ fontSize: 11 }}>
                          See this week’s leaderboard →
                        </Label>
                      </Pressable>
                    </View>
                    <Label muted style={{ fontSize: 10, lineHeight: 18 }}>
                      Sport Coins © 2026 · Demo experience · Virtual coins have
                      no cash value.
                    </Label>
                  </View>
                )}
              </View>
            </ScrollView>
            {!desktop && (
              <View
                style={{
                  flexDirection: "row",
                  borderTopWidth: 1,
                  borderColor: c.line,
                  backgroundColor: "white",
                  paddingTop: 12,
                  paddingBottom: 10,
                }}
              >
                {nav.map((n) => (
                  <Pressable
                    key={n.path}
                    accessibilityRole="link"
                    accessibilityLabel={n.name}
                    onPress={() => router.push(n.path as any)}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      gap: 6,
                      minHeight: 44,
                    }}
                  >
                    <n.icon
                      size={21}
                      color={path === n.path ? c.ink : c.muted}
                      strokeWidth={path === n.path ? 2.2 : 1.5}
                    />
                    <Label
                      style={{
                        fontSize: 9,
                        fontWeight: path === n.path ? "600" : "400",
                        color: path === n.path ? c.ink : c.muted,
                      }}
                    >
                      {n.name.replace(" scores", "").replace(" & earn", "")}
                    </Label>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
        <Modal
          visible={notice}
          transparent
          animationType="fade"
          onRequestClose={() => setNotice(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#15153260",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <Card style={{ width: "100%", maxWidth: 420 }}>
              <View style={[s.row, { justifyContent: "space-between" }]}>
                <Label style={{ fontSize: 19, fontWeight: "600" }}>
                  You’re all caught up.
                </Label>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close notifications"
                  onPress={() => setNotice(false)}
                >
                  <X size={20} color={c.ink} />
                </Pressable>
              </View>
              <Label muted style={{ marginTop: 18 }}>
                Welcome to your demo arena. Follow a club, join a conversation,
                or make your first prediction.
              </Label>
              <Label muted style={{ marginTop: 12, fontSize: 12 }}>
                Real match alerts will be available after a sports provider and
                push notifications are connected.
              </Label>
            </Card>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
function SuggestedPerson({ name, index }: { name: string; index: number }) {
  const follows = useApp((s) => s.following.includes(name));
  const toggle = useApp((s) => s.toggle);
  return (
    <View style={[s.row, { marginBottom: 18 }]}>
      <Avatar id={[47, 13, 44][index]} size={35} />
      <View style={{ flex: 1 }}>
        <Label style={{ fontSize: 12, fontWeight: "500" }}>{name}</Label>
        <Label muted style={{ fontSize: 10 }}>
          {["Football enthusiast", "The stats guy", "Tennis, always"][index]}
        </Label>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => toggle("following", name)}
        style={{
          paddingVertical: 5,
          paddingHorizontal: 10,
          borderWidth: 1,
          borderColor: c.line,
          borderRadius: 6,
        }}
      >
        <Label style={{ fontSize: 10 }}>
          {follows ? "Following" : "Follow +"}
        </Label>
      </Pressable>
    </View>
  );
}
