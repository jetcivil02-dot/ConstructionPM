import { useEffect, useState } from 'react';
import { supabase, UserProfile } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        setSession(session);

        if (session?.user) {
          const { data, error: profileError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (profileError) throw profileError;
          setProfile(data || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Auth error');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          const { data } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', newSession.user.id)
            .maybeSingle();
          setProfile(data || null);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  return { session, profile, loading, error };
}
