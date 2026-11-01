import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { Session } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { accountError, getProfile } from "./api";

type SessionState = {
  session: Session | null;
  ready: boolean;
  error: string;
  retry: () => void;
};
const SessionContext = createContext<SessionState | null>(null);
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!supabase);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const identity = useRef<string | null>(null);
  const cache = useQueryClient();
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    let authEvents = 0;
    const apply = (next: Session | null) => {
      if (!active) return;
      const id = next?.user.id || null;
      if (identity.current !== id) {
        // Keep account-scoped cache entries from surviving sign-out/account switches.
        void cache.cancelQueries({ queryKey: ["connected"] });
        cache.removeQueries({ queryKey: ["connected"] });
        identity.current = id;
      }
      setSession(next);
      setReady(true);
      setError("");
    };
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      authEvents += 1;
      apply(next);
    });
    const initialEvents = authEvents;
    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active || authEvents !== initialEvents) return;
        if (error) {
          setError(accountError(error));
          setReady(true);
        } else apply(data.session);
      })
      .catch((error) => {
        if (active && authEvents === initialEvents) {
          setError(accountError(error));
          setReady(true);
        }
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [cache, attempt]);
  return (
    <SessionContext.Provider
      value={{
        session,
        ready,
        error,
        retry: () => {
          setReady(false);
          setAttempt((v) => v + 1);
        },
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("SessionProvider is missing.");
  return value;
}
export function useCurrentProfile() {
  const { session } = useSession();
  return useQuery({
    queryKey: ["connected", "profile", session?.user.id],
    queryFn: () => getProfile(session!.user.id),
    enabled: !!session,
    staleTime: 60_000,
    retry: 1,
  });
}
