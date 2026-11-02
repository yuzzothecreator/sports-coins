import { useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import Shield from "lucide-react-native/icons/shield";
import { colors as c } from "../theme";

export function TeamBadge({ uri, name, size = 46 }: {
  uri?: string | null;
  name: string;
  size?: number;
}) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const valid = uri?.startsWith("https://") && uri !== failedUri;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {valid ? <Image
        source={{ uri: uri || undefined }}
        style={{ width: size, height: size }}
        contentFit="contain"
        cachePolicy="memory-disk"
        accessibilityLabel={`${name} badge`}
        onError={() => setFailedUri(uri || null)}
      /> : <Shield size={size * 0.8} color={c.muted} accessibilityLabel={`${name} badge unavailable`} />}
    </View>
  );
}
