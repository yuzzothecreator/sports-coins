import { AppText as Text, AppInput as TextInput } from "./typography";
import { ReactNode, useState } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Image,
  ScrollView,
  TextProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import ArrowRight from "lucide-react-native/icons/arrow-right";
import Search from "lucide-react-native/icons/search";
import Shield from "lucide-react-native/icons/shield";
import Volleyball from "lucide-react-native/icons/volleyball";
import Svg, { Circle, Path } from "react-native-svg";
import CircleDot from "lucide-react-native/icons/circle-dot";
import Activity from "lucide-react-native/icons/activity";
import Disc from "lucide-react-native/icons/disc";
import { router } from "expo-router";
import { colors as c, fonts, radii } from "../theme";
import { avatar, Fixture } from "../data/demo";
export function Label({
  children,
  muted = false,
  style,
  ...props
}: TextProps & { children: ReactNode; muted?: boolean }) {
  const fontSize = StyleSheet.flatten(style)?.fontSize || 14;
  return (
    <Text
      {...props}
      style={[
        {
          color: muted ? c.muted : c.ink,
          fontSize: 14,
          lineHeight: Math.ceil(fontSize * 1.55),
          letterSpacing: -0.15,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Title({
  children,
  subtitle,
  action,
  onAction,
  compact = false,
}: {
  children: ReactNode;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  compact?: boolean;
}) {
  return (
    <View style={s.heading}>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            s.title,
            compact && { fontSize: 21, lineHeight: 29, letterSpacing: -0.6 },
          ]}
        >
          {children}
        </Text>
        {subtitle && (
          <Label muted style={{ marginTop: 8, fontSize: 13, lineHeight: 21 }}>
            {subtitle}
          </Label>
        )}
      </View>
      {action && (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={[s.row, { minHeight: 44 }]}
        >
          <Label style={{ fontSize: 11, fontWeight: "600" }}>{action}</Label>
          <ArrowRight size={14} color={c.ink} />
        </Pressable>
      )}
    </View>
  );
}
export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[s.card, style]}>{children}</View>;
}
export function Button({
  children,
  onPress,
  secondary = false,
  disabled = false,
}: {
  children: ReactNode;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        s.button,
        {
          backgroundColor: secondary
            ? hovered
              ? "#E8EDF4"
              : c.canvas
            : hovered
              ? "#2D3D5C"
              : c.ink,
          borderWidth: 1,
          borderColor: focused ? c.gold : secondary ? c.line : "transparent",
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <Label
        style={{
          color: secondary ? c.ink : "white",
          fontWeight: "600",
          fontSize: 12,
          letterSpacing: 0.1,
        }}
      >
        {children}
      </Label>
    </Pressable>
  );
}
export function Avatar({
  id = 11,
  size = 40,
  name,
}: {
  id?: number;
  size?: number;
  name?: string;
}) {
  if (name !== undefined)
    return (
      <View
        accessibilityLabel={`${name || "Member"} avatar`}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: c.purple,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Label
          style={{
            fontSize: Math.round(size * 0.32),
            fontWeight: "600",
            color: c.ink,
          }}
        >
          {(name || "Member")
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase()}
        </Label>
      </View>
    );
  return (
    <Image
      source={{ uri: avatar(id) }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: c.purple,
      }}
    />
  );
}
export function Crest({
  code,
  color = c.ink,
  size = 40,
}: {
  code: string;
  color?: string;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: color + "35",
        backgroundColor: color + "0C",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Shield size={size * 0.67} fill={color} color={color} strokeWidth={1} />
      <Text
        style={{
          position: "absolute",
          color: "white",
          fontSize: size * 0.18,
          fontWeight: "800",
          paddingBottom: 2,
        }}
      >
        {code}
      </Text>
    </View>
  );
}
export function SearchBox({
  value,
  onChangeText,
  placeholder = "Search matches, clubs or people",
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[s.search, focused && { borderColor: c.gold }]}>
      <Search size={19} color={c.ink} />
      <TextInput
        accessibilityLabel={placeholder}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={c.muted}
        style={{ flex: 1, fontSize: 13, color: c.ink, outlineWidth: 0 } as any}
      />
    </View>
  );
}
export function Tabs({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.tabs}
    >
      {items.map((item) => (
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: value === item }}
          key={item}
          onPress={() => onChange(item)}
          style={[s.tab, value === item && { borderBottomColor: c.ink }]}
        >
          <Label
            style={{
              color: value === item ? c.ink : c.muted,
              fontWeight: value === item ? "600" : "400",
            }}
          >
            {item}
          </Label>
        </Pressable>
      ))}
    </ScrollView>
  );
}
function BasketballIcon({
  size = 16,
  color,
  strokeWidth = 1.5,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
    >
      <Circle cx={12} cy={12} r={9} />
      <Path d="M3 12h18M12 3v18M5.6 5.6c7 3 7 9.8 0 12.8M18.4 5.6c-7 3-7 9.8 0 12.8" />
    </Svg>
  );
}
const sports = [
  { name: "Football", icon: Volleyball },
  { name: "Basketball", icon: BasketballIcon },
  { name: "Tennis", icon: CircleDot },
  { name: "Cricket", icon: Activity },
  { name: "Hockey", icon: Disc },
];
export function SportSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (sport: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 9, paddingVertical: 2 }}
    >
      {sports.map(({ name, icon: Icon }) => (
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: value === name }}
          key={name}
          onPress={() => onChange(name)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            minHeight: 44,
            borderRadius: 12,
            paddingHorizontal: 15,
            borderWidth: 1,
            borderColor: value === name ? c.ink : c.line,
            backgroundColor: value === name ? c.ink : "white",
          }}
        >
          <Icon
            size={16}
            color={value === name ? "#D9C399" : c.muted}
            strokeWidth={1.5}
          />
          <Label
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: value === name ? "white" : c.muted,
            }}
          >
            {name}
          </Label>
        </Pressable>
      ))}
    </ScrollView>
  );
}
export function MatchCard({ match }: { match: Fixture }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${match.home} versus ${match.away}, ${match.status}, ${match.score}, demo fixture`}
      onPress={() => router.push(`/match/${match.id}`)}
    >
      <Card>
        <View style={[s.row, { justifyContent: "space-between" }]}>
          <Label muted style={{ fontSize: 11 }}>
            {match.league}
          </Label>
          <Badge
            tone={
              match.status === "Upcoming"
                ? "gold"
                : match.status === "FT"
                  ? "neutral"
                  : "green"
            }
          >
            {match.status === "FT" ? "Full time" : match.status}
          </Badge>
        </View>
        <View
          style={[s.row, { justifyContent: "space-between", marginTop: 23 }]}
        >
          <View style={{ alignItems: "center", width: 90 }}>
            <Crest code={match.homeCode} color={match.color} size={46} />
            <Label
              style={{
                fontSize: 12,
                marginTop: 10,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {match.home}
            </Label>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: 32,
                fontFamily: fonts.heading,
                color: c.ink,
                fontVariant: ["tabular-nums"],
                letterSpacing: -1,
              }}
            >
              {match.score}
            </Text>
            <Label muted style={{ fontSize: 9, marginTop: 4 }}>
              DEMO FIXTURE
            </Label>
          </View>
          <View style={{ alignItems: "center", width: 90 }}>
            <Crest code={match.awayCode} color="#5065A2" size={46} />
            <Label
              style={{
                fontSize: 12,
                marginTop: 10,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {match.away}
            </Label>
          </View>
        </View>
        <View
          style={{
            marginTop: 22,
            paddingTop: 12,
            borderTopWidth: 1,
            borderColor: c.line,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Label muted style={{ fontSize: 10 }}>
            {match.time}
          </Label>
          <View style={s.row}>
            <Label style={{ fontSize: 10, fontWeight: "600" }}>
              Match centre
            </Label>
            <ArrowRight size={12} color={c.ink} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "green" | "gold" | "neutral";
}) {
  const color = tone === "green" ? c.green : tone === "gold" ? c.gold : c.muted;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor:
          tone === "green"
            ? c.softGreen
            : tone === "gold"
              ? c.softGold
              : c.canvas,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: radii.pill,
      }}
    >
      <View
        style={{ width: 4, height: 4, borderRadius: 3, backgroundColor: color }}
      />
      <Label style={{ fontSize: 10, lineHeight: 15, fontWeight: "600", color }}>
        {children}
      </Label>
    </View>
  );
}
export const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 9 },
  card: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radii.card,
    padding: 22,
    boxShadow: "0px 3px 16px rgba(24, 33, 57, 0.035)",
  },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    lineHeight: 37,
    fontFamily: fonts.heading,
    letterSpacing: -1.1,
    color: c.ink,
  },
  button: {
    minHeight: 46,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radii.control,
    alignItems: "center",
    justifyContent: "center",
  },
  search: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: radii.control,
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.line,
    alignItems: "center",
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: c.line,
    marginBottom: 22,
    gap: 22,
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    minWidth: 65,
    alignItems: "center",
  },
});
