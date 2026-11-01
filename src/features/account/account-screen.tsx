import { useEffect, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, Button, Card, Label, Title, s } from "../../components/ui";
import { AppInput } from "../../components/typography";
import { supabase } from "../../lib/supabase";
import { colors as c } from "../../theme";
import { useCurrentProfile, useSession } from "./session";
import { profileFields, ProfileFields } from "./schema";
import { accountError, saveProfile } from "./api";

export function AccountScreen() {
  const { session } = useSession();
  return <AccountEditor key={session?.user.id || "guest"} />;
}
function AccountEditor() {
  const { session, ready, error: sessionError, retry } = useSession();
  const profile = useCurrentProfile();
  const cache = useQueryClient();
  const [status, setStatus] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFields>({
    resolver: zodResolver(profileFields),
    defaultValues: { username: "", display_name: "", bio: "" },
  });
  useEffect(() => {
    reset(
      profile.data
        ? {
            username: profile.data.username,
            display_name: profile.data.display_name,
            bio: profile.data.bio,
          }
        : { username: "", display_name: "", bio: "" },
    );
  }, [profile.data, session?.user.id, reset]);
  const save = useMutation({
    mutationFn: (values: ProfileFields) =>
      saveProfile(session!.user.id, values, !!profile.data),
    onSuccess: (data) => {
      cache.setQueryData(["connected", "profile", data.id], data);
      void cache.invalidateQueries({ queryKey: ["connected", "community"] });
      setStatus("Your profile is saved.");
    },
  });
  if (!supabase)
    return (
      <Card>
        <Label>Account services are not connected yet.</Label>
        <View style={{ marginTop: 18 }}>
          <Button onPress={() => router.push("/profile")}>
            Back to the demo
          </Button>
        </View>
      </Card>
    );
  if (!ready)
    return (
      <Card>
        <Label>Restoring your session…</Label>
      </Card>
    );
  if (sessionError)
    return (
      <Card>
        <Label>{sessionError}</Label>
        <Button onPress={retry}>Retry session</Button>
      </Card>
    );
  if (!session)
    return (
      <View>
        <Title subtitle="A profile of your own, wherever you sign in.">
          Join your arena.
        </Title>
        <Card>
          <Label muted>
            Create an account or sign in to save your profile and join the
            community.
          </Label>
          <View style={{ marginTop: 20 }}>
            <Button onPress={() => router.push("/auth")}>
              Sign in or create an account
            </Button>
          </View>
        </Card>
      </View>
    );
  if (profile.isPending)
    return (
      <Card>
        <Label>Loading your profile…</Label>
      </Card>
    );
  if (profile.error)
    return (
      <Card>
        <Label>{accountError(profile.error)}</Label>
        <View style={{ marginTop: 16 }}>
          <Button
            onPress={() => {
              void profile.refetch();
            }}
          >
            Retry profile
          </Button>
        </View>
        <SignOutButton busy={signingOut} onPress={signOut} />
      </Card>
    );
  async function signOut() {
    if (!supabase) return;
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;
      router.replace("/auth");
    } catch (error) {
      setStatus(accountError(error));
    } finally {
      setSigningOut(false);
    }
  }
  return (
    <View style={{ maxWidth: 600, width: "100%", alignSelf: "center" }}>
      <Title
        subtitle={
          profile.data
            ? "Your identity. Your community. Your game."
            : "Choose a public name before joining the conversation."
        }
      >
        {profile.data ? "Your corner" : "Make it yours."}
      </Title>
      <Card>
        <View style={[s.row, { gap: 17, marginBottom: 26 }]}>
          <Avatar name={profile.data?.display_name || "Sports fan"} size={58} />
          <View style={{ flex: 1 }}>
            <Label style={{ fontWeight: "600", fontSize: 17 }}>
              {profile.data?.display_name || "Complete your profile"}
            </Label>
            <Label muted style={{ fontSize: 12 }}>
              {session.user.email}
            </Label>
          </View>
        </View>
        {(["display_name", "username", "bio"] as const).map((name) => (
          <View key={name} style={{ marginBottom: 21 }}>
            <Label style={{ fontSize: 12, fontWeight: "600", marginBottom: 8 }}>
              {name === "display_name"
                ? "Display name"
                : name === "username"
                  ? "Username"
                  : "About you"}
            </Label>
            <Controller
              name={name}
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <AppInput
                  accessibilityLabel={
                    name === "display_name"
                      ? "Display name"
                      : name === "username"
                        ? "Username"
                        : "About you"
                  }
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!save.isPending}
                  autoCapitalize={name === "username" ? "none" : "sentences"}
                  autoCorrect={name !== "username"}
                  multiline={name === "bio"}
                  maxLength={
                    name === "bio" ? 500 : name === "username" ? 30 : 80
                  }
                  placeholder={
                    name === "username"
                      ? "your_matchday_name"
                      : name === "bio"
                        ? "What brings you to the game?"
                        : "Your public display name"
                  }
                  style={{
                    color: c.ink,
                    borderWidth: 1,
                    borderColor: errors[name] ? "#BC4659" : c.line,
                    borderRadius: 12,
                    padding: 14,
                    minHeight: name === "bio" ? 110 : 48,
                    textAlignVertical: name === "bio" ? "top" : "center",
                  }}
                />
              )}
            />
            {errors[name] && (
              <Label style={{ fontSize: 11, color: "#BC4659", marginTop: 7 }}>
                {errors[name]?.message}
              </Label>
            )}
          </View>
        ))}
        <Label muted style={{ fontSize: 11, marginBottom: 20 }}>
          Your name, username, and bio are public. Your email stays private.
        </Label>
        <Button
          disabled={save.isPending || (!!profile.data && !isDirty)}
          onPress={handleSubmit((values) => {
            setStatus("");
            save.mutate(values);
          })}
        >
          {save.isPending
            ? "Saving…"
            : profile.data
              ? "Save profile"
              : "Create profile"}
        </Button>
        {save.error && (
          <Label
            accessibilityRole="alert"
            style={{ marginTop: 16, color: "#BC4659", fontSize: 12 }}
          >
            {accountError(save.error)}
          </Label>
        )}
        {status && (
          <Label
            accessibilityRole="alert"
            style={{ marginTop: 16, color: c.green, fontSize: 12 }}
          >
            {status}
          </Label>
        )}
        {profile.data && (
          <View style={{ marginTop: 14 }}>
            <Button secondary onPress={() => router.push("/community")}>
              Join the conversation →
            </Button>
          </View>
        )}
        <SignOutButton busy={signingOut} onPress={signOut} />
      </Card>
      <Label muted style={{ fontSize: 10, marginTop: 18 }}>
        Sports scores, games, and coin rewards are still demo features. Your
        profile and connected community posts are saved to your account.
      </Label>
    </View>
  );
}
function SignOutButton({
  busy,
  onPress,
}: {
  busy: boolean;
  onPress: () => void;
}) {
  return (
    <View style={{ marginTop: 14 }}>
      <Button secondary disabled={busy} onPress={onPress}>
        {busy ? "Signing out…" : "Sign out on this device"}
      </Button>
    </View>
  );
}
