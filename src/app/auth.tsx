import { AppInput as TextInput } from "../components/typography";
import { useState } from "react";
import { View, Pressable } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { Button, Card, Label, Title } from "../components/ui";
import { colors as c } from "../theme";
import { useSession } from "../features/account/session";
import { accountError } from "../features/account/api";
const schema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
});
export default function Auth() {
  const { session, ready, error: sessionError, retry } = useSession();
  const [signup, setSignup] = useState(false);
  const [status, setStatus] = useState("");
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });
  async function submit(values: z.infer<typeof schema>) {
    if (!supabase) {
      setStatus(
        "Account services are not connected yet. Continue exploring with the demo profile.",
      );
      return;
    }
    try {
      const { data, error } = signup
        ? await supabase.auth.signUp({
            ...values,
            options: process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL
              ? { emailRedirectTo: process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL }
              : undefined,
          })
        : await supabase.auth.signInWithPassword(values);
      if (error) throw error;
      if (data.session) {
        router.replace("/account");
      } else
        setStatus(
          "Check your email to confirm your account, then return here to sign in and finish your profile.",
        );
    } catch (error) {
      setStatus(accountError(error));
    }
  }
  if (supabase && !ready)
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
  if (session)
    return (
      <View>
        <Title subtitle="Your session is active.">You’re signed in.</Title>
        <Card>
          <Label>{session.user.email}</Label>
          <View style={{ marginTop: 20 }}>
            <Button onPress={() => router.replace("/account")}>
              Continue to your profile
            </Button>
          </View>
        </Card>
      </View>
    );
  return (
    <View style={{ maxWidth: 470, width: "100%", alignSelf: "center" }}>
      <Title subtitle="Your people. Your predictions. Your game.">
        {signup ? "Find your place in the game." : "Welcome back, sports fan."}
      </Title>
      <Card>
        <Label style={{ fontSize: 19, fontWeight: "500", marginBottom: 24 }}>
          {signup ? "Create your account" : "Sign in to Sport Coins"}
        </Label>
        {(["email", "password"] as const).map((name) => (
          <View key={name} style={{ marginBottom: 21 }}>
            <Label style={{ fontSize: 12, marginBottom: 9 }}>
              {name === "email" ? "Email address" : "Password"}
            </Label>
            <Controller
              name={name}
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  accessibilityLabel={name}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  keyboardType={name === "email" ? "email-address" : "default"}
                  secureTextEntry={name === "password"}
                  placeholder={
                    name === "email"
                      ? "you@example.com"
                      : "At least 8 characters"
                  }
                  style={{
                    borderWidth: 1,
                    borderColor: c.line,
                    borderRadius: 8,
                    padding: 13,
                    color: c.ink,
                  }}
                />
              )}
            />
            {errors[name] && (
              <Label style={{ color: "#BC4659", fontSize: 11, marginTop: 5 }}>
                {errors[name]?.message}
              </Label>
            )}
          </View>
        ))}
        <Button disabled={isSubmitting} onPress={handleSubmit(submit)}>
          {isSubmitting ? "Connecting…" : signup ? "Create account" : "Sign in"}
        </Button>
        {status && (
          <Label style={{ fontSize: 12, marginTop: 17 }}>{status}</Label>
        )}
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setSignup(!signup);
            setStatus("");
          }}
          style={{ paddingVertical: 20, alignItems: "center" }}
        >
          <Label style={{ fontSize: 12 }}>
            {signup
              ? "Already a member? Sign in"
              : "New here? Create an account"}
          </Label>
        </Pressable>
        <Button secondary onPress={() => router.push("/")}>
          Continue in demo mode
        </Button>
        {!supabase && (
          <Label muted style={{ fontSize: 10, marginTop: 17 }}>
            Demo mode is active. No account credentials are sent or stored.
          </Label>
        )}
      </Card>
    </View>
  );
}
