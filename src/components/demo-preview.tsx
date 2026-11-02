import { useState, type ReactNode } from "react";
import { View } from "react-native";
import { Badge, Button, Card, Label, Title } from "./ui";

export function DemoPreview({ title, description, children }: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const [preview, setPreview] = useState(false);
  return <View>
    <Card style={{ marginBottom: 24 }}>
      <Badge tone="gold">{preview ? "Sample preview" : "Not connected"}</Badge>
      <Title compact>{title}</Title>
      <Label muted style={{ marginBottom: 16 }}>{description}</Label>
      <Button secondary onPress={() => setPreview((value) => !value)}>
        {preview ? "Close sample preview" : "Explore labelled sample preview"}
      </Button>
      {preview && <Label muted style={{ marginTop: 12, fontSize: 11 }}>
        All profiles, posts, rankings, and balances below are illustrative or device-local.
      </Label>}
    </Card>
    {preview ? children : null}
  </View>;
}
