import { useState } from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import ArrowUpRight from "lucide-react-native/icons/arrow-up-right";
import Radio from "lucide-react-native/icons/radio";
import Trophy from "lucide-react-native/icons/trophy";
import {
  Badge,
  Card,
  Crest,
  Label,
  MatchCard,
  SearchBox,
  SportSelector,
  Title,
  s,
} from "../components/ui";
import { AppText as Text } from "../components/typography";
import { fixtures, Fixture } from "../data/demo";
import { colors as c, fonts } from "../theme";

function Spotlight({ match }: { match: Fixture }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open featured ${match.home} versus ${match.away} demo match`}
      onPress={() => router.push(`/match/${match.id}`)}
    >
      <Card
        style={{
          backgroundColor: c.navy,
          borderColor: c.navy,
          padding: 24,
          overflow: "hidden",
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 280,
            height: 280,
            borderRadius: 140,
            borderWidth: 1,
            borderColor: "#FFFFFF0C",
            right: -85,
            top: -90,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 210,
            height: 210,
            borderRadius: 110,
            borderWidth: 1,
            borderColor: "#FFFFFF0C",
            right: -50,
            top: -55,
          }}
        />
        <View style={[s.row, { justifyContent: "space-between" }]}>
          <View style={s.row}>
            <Radio size={14} color="#D9C399" />
            <Label
              style={{
                fontSize: 9,
                color: "#D9C399",
                fontWeight: "600",
                letterSpacing: 1.8,
              }}
            >
              IN THE SPOTLIGHT
            </Label>
          </View>
          <Label style={{ fontSize: 10, color: "#CBD5E5" }}>
            {match.league}
          </Label>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 28,
            marginBottom: 25,
            gap: 8,
          }}
        >
          <View style={{ flex: 1, alignItems: "center", gap: 10 }}>
            <View
              style={{
                padding: 5,
                backgroundColor: "#FFFFFF",
                borderRadius: 50,
              }}
            >
              <Crest code={match.homeCode} color={match.color} size={46} />
            </View>
            <Label
              style={{
                color: "white",
                fontSize: 12,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {match.home}
            </Label>
          </View>
          <View style={{ alignItems: "center", gap: 7 }}>
            <Badge tone="green">Demo · {match.status}</Badge>
            <Text
              style={{
                fontFamily: fonts.heading,
                fontSize: 43,
                lineHeight: 57,
                letterSpacing: -1.7,
                color: "white",
                fontVariant: ["tabular-nums"],
              }}
            >
              {match.score}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "center", gap: 10 }}>
            <View
              style={{
                padding: 5,
                backgroundColor: "#FFFFFF",
                borderRadius: 50,
              }}
            >
              <Crest code={match.awayCode} color="#4567AB" size={46} />
            </View>
            <Label
              style={{
                color: "white",
                fontSize: 12,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {match.away}
            </Label>
          </View>
        </View>
        <View
          style={[
            s.row,
            {
              justifyContent: "space-between",
              borderTopWidth: 1,
              borderColor: "#FFFFFF17",
              paddingTop: 14,
            },
          ]}
        >
          <Label style={{ color: "#A5B2CA", fontSize: 10 }}>
            Illustrative score · Not a live feed
          </Label>
          <View style={s.row}>
            <Label
              style={{ color: "#D9C399", fontSize: 10, fontWeight: "600" }}
            >
              Match centre
            </Label>
            <ArrowUpRight size={13} color="#D9C399" />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export default function Live() {
  const [sport, setSport] = useState("Football");
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const sportFixtures = fixtures.filter((f) => f.sport === sport);
  const list = sportFixtures.filter(
    (f) =>
      `${f.home} ${f.away} ${f.league}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (status === "All" ||
        (status === "Upcoming" && f.status === "Upcoming") ||
        (status === "Completed" && f.status === "FT") ||
        (status === "In play" && !["Upcoming", "FT"].includes(f.status))),
  );
  const featured = list.find((f) => !["Upcoming", "FT"].includes(f.status));
  const others = list.filter((f) => f.id !== featured?.id);
  return (
    <View>
      <View style={[s.row, { marginBottom: 10 }]}>
        <View style={{ height: 1, width: 23, backgroundColor: c.gold }} />
        <Label
          style={{
            fontSize: 9,
            color: c.gold,
            fontWeight: "600",
            letterSpacing: 1.8,
          }}
        >
          THE MATCHDAY EDIT
        </Label>
      </View>
      <Title subtitle="Every point. Every moment. Your front-row seat.">
        Around the grounds
      </Title>
      <SportSelector value={sport} onChange={setSport} />
      <View style={{ marginVertical: 23 }}>
        <SearchBox
          value={search}
          onChangeText={setSearch}
          placeholder="Search teams, players or competitions"
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          padding: 4,
          borderWidth: 1,
          borderColor: c.line,
          backgroundColor: "#EDF0F5",
          borderRadius: 13,
          marginBottom: 25,
        }}
      >
        {["All", "In play", "Upcoming", "Completed"].map((item) => (
          <Pressable
            key={item}
            accessibilityRole="tab"
            accessibilityState={{ selected: status === item }}
            onPress={() => setStatus(item)}
            style={{
              flex: 1,
              minHeight: 39,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 9,
              backgroundColor: status === item ? "white" : "transparent",
              boxShadow:
                status === item ? "0px 2px 6px rgba(24,33,57,0.06)" : "none",
            }}
          >
            <Label
              style={{
                fontSize: 10,
                fontWeight: status === item ? "600" : "500",
                color: status === item ? c.ink : c.muted,
              }}
            >
              {item}
            </Label>
          </Pressable>
        ))}
      </View>
      {featured && (
        <View style={{ marginBottom: 28 }}>
          <Spotlight match={featured} />
        </View>
      )}
      <View
        style={[s.row, { justifyContent: "space-between", marginBottom: 18 }]}
      >
        <View style={s.row}>
          <Trophy size={17} color={c.gold} />
          <Label style={{ fontFamily: fonts.heading, fontSize: 17 }}>
            {sport === "Football"
              ? "Premier League"
              : sport === "Basketball"
                ? "NBA"
                : sport === "Tennis"
                  ? "ATP Tour"
                  : `${sport} fixtures`}
          </Label>
        </View>
        <Badge>
          {list.length} {list.length === 1 ? "match" : "matches"}
        </Badge>
      </View>
      <View style={{ gap: 15 }}>
        {others.map((f) => (
          <MatchCard key={f.id} match={f} />
        ))}
        {list.length === 0 && (
          <Card style={{ alignItems: "center", paddingVertical: 35 }}>
            <Trophy size={29} strokeWidth={1.2} color={c.gold} />
            <Label
              style={{ fontFamily: fonts.heading, fontSize: 17, marginTop: 15 }}
            >
              A quiet moment in the arena.
            </Label>
            <Label
              muted
              style={{ textAlign: "center", fontSize: 12, marginTop: 7 }}
            >
              No sample fixtures match these filters. Try another sport or match
              status.
            </Label>
          </Card>
        )}
        {featured && others.length === 0 && (
          <Label muted style={{ fontSize: 12 }}>
            You’re up to date with the available demo fixtures.
          </Label>
        )}
      </View>
      <View
        style={[s.row, { marginTop: 23, alignItems: "flex-start", gap: 8 }]}
      >
        <View
          style={{
            width: 5,
            height: 5,
            borderRadius: 5,
            backgroundColor: c.gold,
            marginTop: 7,
          }}
        />
        <Label muted style={{ flex: 1, fontSize: 10, lineHeight: 18 }}>
          Demo experience. Scores and fixtures are samples. Real-time coverage
          will appear when a sports provider is connected.
        </Label>
      </View>
    </View>
  );
}
