import { useState, useEffect } from 'react';
import { getSupabase } from './lib/supabase';
import Login from './pages/Login';
import AuditForm from './pages/AuditForm';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [hasAudit, setHasAudit] = useState<boolean | null>(null);
  const [isReAuditing, setIsReAuditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const supabase = getSupabase();
      
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session) {
          checkAudit(session.access_token);
        } else {
          setLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) {
          localStorage.setItem('token', session.access_token);
          checkAudit(session.access_token);
        } else {
          localStorage.removeItem('token');
          setHasAudit(null);
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } catch (err: any) {
      setConfigError(err.message);
      setLoading(false);
    }
  }, []);

  const checkAudit = async (token: string) => {
    try {
      const res = await fetch('/api/my-audits', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setHasAudit(data.length > 0);
      setIsReAuditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
    } catch (err) {
      console.error(err);
    }
  };

  if (configError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="max-w-md w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-4">Configuration Required</h2>
          <p className="text-slate-400 mb-6">{configError}</p>
          <div className="text-sm text-slate-500 bg-black/20 p-4 rounded-xl text-left">
            <p className="font-mono">1. Open Secrets panel</p>
            <p className="font-mono">2. Add VITE_SUPABASE_URL</p>
            <p className="font-mono">3. Add VITE_SUPABASE_ANON_KEY</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  if (hasAudit === false || isReAuditing) {
    return (
      <AuditForm 
        onComplete={() => checkAudit(session.access_token)} 
        onCancel={isReAuditing ? () => setIsReAuditing(false) : undefined}
      />
    );
  }

  return (
    <Dashboard 
      user={session.user} 
      onSignOut={handleSignOut} 
      onReAudit={() => setIsReAuditing(true)} 
    />
  );
}
