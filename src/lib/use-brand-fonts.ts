import { useFonts, FontDisplay } from "expo-font";

// Bundled assets: no runtime Google Fonts request and no network dependency.
const brandFonts = {
  Inter_400Regular: {
    uri: require("@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf"),
    display: FontDisplay.SWAP,
  },
  Inter_500Medium: {
    uri: require("@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf"),
    display: FontDisplay.SWAP,
  },
  Inter_600SemiBold: {
    uri: require("@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf"),
    display: FontDisplay.SWAP,
  },
  Inter_700Bold: {
    uri: require("@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf"),
    display: FontDisplay.SWAP,
  },
  Manrope_700Bold: {
    uri: require("@expo-google-fonts/manrope/700Bold/Manrope_700Bold.ttf"),
    display: FontDisplay.SWAP,
  },
  Manrope_800ExtraBold: {
    uri: require("@expo-google-fonts/manrope/800ExtraBold/Manrope_800ExtraBold.ttf"),
    display: FontDisplay.SWAP,
  },
};
export function useBrandFonts() {
  return useFonts(brandFonts);
}
