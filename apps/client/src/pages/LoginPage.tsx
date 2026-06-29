import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

type Mode = 'signin' | 'signup';

function isSafeRedirectUrl(rawRedirectTo: string | null): string {
  if (typeof window === 'undefined') {
    return '/';
  }

  const fallbackUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
  if (!rawRedirectTo) {
    return fallbackUrl.href;
  }

  try {
    const redirectUrl = new URL(rawRedirectTo, window.location.href);
    const localDemoPorts = new Set(['3000', '3001', '3002', '3003']);
    const isLocalDemo =
      ['localhost', '127.0.0.1', '::1'].includes(redirectUrl.hostname) &&
      localDemoPorts.has(redirectUrl.port);

    if (redirectUrl.origin === window.location.origin || isLocalDemo) {
      return redirectUrl.href;
    }
  } catch {
    return fallbackUrl.href;
  }

  return fallbackUrl.href;
}

export function LoginPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { signIn, signUp, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectTo = isSafeRedirectUrl(searchParams.get('redirectTo'));

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      window.location.replace(redirectTo);
    }
  }, [isAuthenticated, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
          return;
        }
        window.location.assign(redirectTo);
      } else {
        const result = await signUp(email, password, name);
        if (result.error) {
          setError(result.error);
          return;
        }
        const signInResult = await signIn(email, password);
        if (signInResult.error) {
          setError('Account created — please sign in.');
          setMode('signin');
          return;
        }
        window.location.assign(redirectTo);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">{t('app.title', '')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === 'signin'
              ? t('ui.common.signIn', 'Sign in to your account')
              : t('ui.common.createAccount', 'Create a new account')}
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
              {mode === 'signup' ? (
                <div className="grid gap-1.5">
                  <Label htmlFor="name">{t('ui.form.name', 'Name')}</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('ui.form.namePlaceholder', 'Your full name')}
                  />
                </div>
              ) : null}

              <div className="grid gap-1.5">
                <Label htmlFor="email">{t('ui.form.email', 'Email')}</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete={mode === 'signin' ? 'email' : 'new-email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="password">{t('ui.form.password', 'Password')}</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading
                  ? t('ui.common.loading', 'Loading...')
                  : mode === 'signin'
                    ? t('ui.buttons.signIn', 'Sign In')
                    : t('ui.buttons.signUp', 'Create Account')}
              </Button>
            </form>

            {mode === 'signin' ? (
              <Alert className="mt-4 p-3 text-sm border-emerald-200 bg-emerald-200 text-emerald-800">
                <AlertTitle>Demo account</AlertTitle>
                <AlertDescription className="text-emerald-700">
                  <span className="font-mono">user@example.com</span>
                  <br />
                  <span className="font-mono">user1234</span>
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="mt-4 text-center text-sm text-muted-foreground">
              {mode === 'signin'
                ? t('ui.common.noAccount', "Don't have an account?")
                : t('ui.common.haveAccount', 'Already have an account?')}{' '}
              <Button
                type="button"
                variant="link"
                className="h-auto p-0"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError(null);
                }}
              >
                {mode === 'signin' ? t('ui.buttons.signUp', 'Sign up') : t('ui.buttons.signIn', 'Sign in')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
