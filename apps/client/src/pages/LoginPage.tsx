import finograficLogoUrl from '@workspace/shared/assets/finografic-logo.png';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

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
  const { signIn, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectTo = isSafeRedirectUrl(searchParams.get('redirectTo'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
        return;
      }
      window.location.assign(redirectTo);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3">
            <img
              src={finograficLogoUrl}
              alt=""
              width={40}
              height={40}
              className="size-9 shrink-0 sm:size-10"
              aria-hidden="true"
            />
            <h1 className="text-2xl font-bold text-brand-wordmark">finografic monorepo-demo</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('ui.common.signIn', 'Sign in to your account')}
          </p>
        </div>

        <Card>
          <CardContent className="px-6 pt-4 pb-2">
            <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="email">{t('ui.form.email', 'Email')}</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
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
                  autoComplete="current-password"
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

              <Button
                type="submit"
                disabled={isLoading}
                className="min-h-11 w-full bg-brand-cyan px-5 text-sm font-semibold text-white hover:bg-brand-cyan-hover"
              >
                {isLoading ? t('ui.common.loading', 'Loading...') : t('ui.buttons.signIn', 'Sign In')}
              </Button>
            </form>

            <Alert className="mt-4 border-brand-green-strong/25 bg-brand-green-soft p-3 text-sm text-brand-green-strong">
              <AlertTitle className="text-brand-green-strong">Demo account</AlertTitle>
              <AlertDescription className="text-brand-green-strong/90">
                <span className="font-mono">guest@test.com</span>
                <br />
                <span className="font-mono">test1234</span>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
