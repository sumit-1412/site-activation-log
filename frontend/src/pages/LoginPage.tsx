import { GoogleLogin } from '@react-oauth/google';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { IconBrand } from '../components/icons';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/paths';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export function LoginPage() {
  const { loaded, currentHospitalId } = useApp();
  const { user, authRequired, authReady, googleEnabled, passwordEnabled, login, loginWithGoogle } =
    useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from;

  if (authReady && (!authRequired || user)) {
    if (!loaded) {
      return (
        <div className="flex min-h-dvh items-center justify-center text-ink2">
          Loading your workspace…
        </div>
      );
    }

    const dest =
      from && from !== ROUTES.login ? from : currentHospitalId ? ROUTES.home : ROUTES.hospitals;
    return <Navigate to={dest} replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const showGoogle = googleEnabled && Boolean(GOOGLE_CLIENT_ID);
  const showPassword = passwordEnabled;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-4 py-10 sm:px-6">
      <div className="w-full max-w-md rounded-app border border-line bg-surface p-6 shadow-app sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-white">
            <IconBrand className="h-5 w-5 stroke-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-ink">Humblx Activation Log</h1>
            <p className="text-sm text-ink2">Sign in to continue</p>
          </div>
        </div>

        {showGoogle && (
          <div className="mb-5">
            <div className="flex justify-center [&>div]:w-full">
              <GoogleLogin
                onSuccess={(res) => {
                  if (!res.credential) {
                    setError('Google did not return a credential');
                    return;
                  }
                  setError(null);
                  setLoading(true);
                  void loginWithGoogle(res.credential)
                    .catch((err) => setError(err instanceof Error ? err.message : 'Google sign-in failed'))
                    .finally(() => setLoading(false));
                }}
                onError={() => setError('Google sign-in was cancelled or failed')}
                theme="outline"
                size="large"
                width="360"
                text="continue_with"
                shape="rectangular"
              />
            </div>
            <p className="mt-3 text-center text-xs text-ink3">
              Use your Gmail or Google Workspace account
            </p>
          </div>
        )}

        {googleEnabled && !GOOGLE_CLIENT_ID && (
          <div className="mb-4 rounded-app-sm border border-amber bg-amber-soft px-3 py-2 text-xs text-amber">
            Add <code className="text-ink">VITE_GOOGLE_CLIENT_ID</code> to <code className="text-ink">frontend/.env</code>
          </div>
        )}

        {showGoogle && showPassword && (
          <div className="relative mb-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line" />
            </div>
            <span className="relative bg-surface px-3 text-xs text-ink3">or</span>
          </div>
        )}

        {showPassword && (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink2">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-app-sm border border-line bg-surface2 px-3 py-2.5 text-sm outline-none focus:border-accent"
                placeholder="you@humblx.com"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink2">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-app-sm border border-line bg-surface2 px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-app-sm bg-accent py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in with password'}
            </button>
          </form>
        )}

        {!showGoogle && !showPassword && authReady && (
          <p className="text-sm text-ink2">
            Authentication is not configured. Set <code>GOOGLE_CLIENT_ID</code> in the backend{' '}
            <code>.env</code> file.
          </p>
        )}

        {error && (
          <div className="mt-4 rounded-app-sm border border-red bg-red-soft px-3 py-2 text-sm text-red">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
