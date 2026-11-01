import {
  Text,
  TextInput,
  StyleSheet,
  TextProps,
  TextInputProps,
} from "react-native";
import { fonts } from "../theme";

// Explicit weight files keep Android, iOS, and web rendering consistent.
export function AppText({ style, ...props }: TextProps) {
  const resolved = StyleSheet.flatten(style) || {};
  const weight =
    Number(resolved.fontWeight) || (resolved.fontWeight === "bold" ? 700 : 400);
  const family =
    resolved.fontFamily ||
    (weight >= 700
      ? fonts.bold
      : weight >= 600
        ? fonts.semibold
        : weight >= 500
          ? fonts.medium
          : fonts.regular);
  return (
    <Text
      {...props}
      style={[style, { fontFamily: family, fontWeight: "normal" }]}
    />
  );
}

export function AppInput({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      {...props}
      style={[{ fontFamily: fonts.regular, fontSize: 14 }, style]}
    />
  );
}
