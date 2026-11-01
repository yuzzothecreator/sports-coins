import { View } from "react-native";
import { router } from "expo-router";
import Award from "lucide-react-native/icons/award";
import Bookmark from "lucide-react-native/icons/bookmark";
import Coins from "lucide-react-native/icons/coins";
import Users from "lucide-react-native/icons/users";
import { Avatar, Button, Card, Label, Title, s } from "../components/ui";
import { useApp } from "../store/use-app";
import { colors as c } from "../theme";
import { supabase } from "../lib/supabase";
import { AccountScreen } from "../features/account/account-screen";
export default function Profile() {
  return supabase ? <AccountScreen /> : <DemoProfile />;
}
function DemoProfile() {
  const { following, saved, demoCoins, picks, rewardClaimed, triviaDone } =
    useApp();
  return (
    <View>
      <Title subtitle="Every fan has a story. This one’s yours.">
        Your corner
      </Title>
      <Card>
        <View style={[s.row, { gap: 20 }]}>
          <Avatar size={73} />
          <View style={{ flex: 1 }}>
            <Label style={{ fontSize: 24, fontWeight: "500" }}>
              Alex Morgan
            </Label>
            <Label muted style={{ fontSize: 12 }}>
              @alexmorgan · Demo profile
            </Label>
            <Label muted style={{ fontSize: 12, marginTop: 8 }}>
              Here for the beautiful game. And the conversation.
            </Label>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            gap: 25,
            marginTop: 28,
            flexWrap: "wrap",
          }}
        >
          {[
            { title: "Following", value: following.length },
            { title: "Saved posts", value: saved.length },
            { title: "Selections", value: picks.length },
          ].map((x) => (
            <View key={x.title}>
              <Label style={{ fontSize: 23, fontWeight: "500" }}>
                {x.value}
              </Label>
              <Label muted style={{ fontSize: 11 }}>
                {x.title}
              </Label>
            </View>
          ))}
        </View>
      </Card>
      <Card style={{ marginTop: 20, backgroundColor: "#FAF8F1" }}>
        <View style={s.row}>
          <Coins size={24} color="#A18A57" />
          <Label>Sport Coins balance</Label>
        </View>
        <Label style={{ fontSize: 34, fontWeight: "500", marginVertical: 17 }}>
          {demoCoins.toLocaleString()}
        </Label>
        <Label muted style={{ fontSize: 11 }}>
          Demo balance stored on your device. Coins cannot be bought,
          transferred, redeemed, or withdrawn.
        </Label>
        <View
          style={{
            borderTopWidth: 1,
            borderColor: c.line,
            marginTop: 20,
            paddingTop: 15,
            gap: 7,
          }}
        >
          <Label style={{ fontSize: 12 }}>Demo opening balance +1,250</Label>
          {rewardClaimed && (
            <Label style={{ fontSize: 12 }}>
              Daily rewards earned · Current total includes check-ins
            </Label>
          )}
          {triviaDone && (
            <Label style={{ fontSize: 12 }}>Sports trivia completed</Label>
          )}
        </View>
      </Card>
      <View style={{ marginTop: 26 }}>
        <Title compact>Your matchday collection</Title>
        <View style={{ gap: 12 }}>
          {[
            {
              icon: Bookmark,
              title: `${saved.length} saved conversations`,
              text: "Revisit your bookmarked posts.",
              path: "/community",
            },
            {
              icon: Users,
              title: `${following.length} voices you follow`,
              text: "Find the fans who see the game like you do.",
              path: "/community?tab=Friends",
            },
            {
              icon: Award,
              title: "Your next achievement awaits",
              text: "Try a challenge and build your sporting story.",
              path: "/play",
            },
          ].map((x) => (
            <Card key={x.title}>
              <View style={s.row}>
                <x.icon size={20} color={c.ink} />
                <View style={{ flex: 1 }}>
                  <Label style={{ fontWeight: "500" }}>{x.title}</Label>
                  <Label muted style={{ fontSize: 12, marginTop: 5 }}>
                    {x.text}
                  </Label>
                </View>
              </View>
              <View style={{ alignSelf: "flex-start", marginTop: 15 }}>
                <Button secondary onPress={() => router.push(x.path as any)}>
                  Explore →
                </Button>
              </View>
            </Card>
          ))}
        </View>
      </View>
      <View style={{ marginTop: 24 }}>
        <Button onPress={() => router.push("/auth")}>
          Sign in or create an account
        </Button>
      </View>
    </View>
  );
}
