import React, { useEffect, useState } from 'react';
import { Button, Input, Checkbox, Link, Image, Divider } from '@heroui/react';
import { Icon } from '@/components/Common/Iconify/icons';
import { signIn } from 'next-auth/react';
import { RootStore } from '@/store';
import { useRouter } from 'next/router';
import { ToastPlugin } from '@/store/module/Toast/Toast';
import { useTranslation } from 'react-i18next';
import { StorageState } from '@/store/standard/StorageState';
import { UserStore } from '@/store/user';
import { ShowTwoFactorModal } from '@/components/Common/TwoFactorModal';
import { DialogStore } from '@/store/module/Dialog';
import { PromiseState } from '@/store/standard/PromiseState';
import { useTheme } from 'next-themes';
import { api } from '@/lib/trpc';
import dynamic from 'next/dynamic';
import { link } from 'fs';

const GradientBackground = dynamic(() => import('@/components/Common/GradientBackground').then((mod) => mod.GradientBackground), { ssr: false });

type OAuthProvider = {
  id: string;
  name: string;
  icon?: string;
};

export default function Component() {
  const router = useRouter();
  const [isVisible, setIsVisible] = React.useState(false);
  const [user, setUser] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [canRegister, setCanRegister] = useState(false);
  const [providers, setProviders] = useState<OAuthProvider[]>([]);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [loadingProvider, setLoadingProvider] = useState<string>('');

  useEffect(() => {
    api.public.oauthProviders.query().then((providers) => {
      setProviders(providers);
    });
  }, []);

  const SignIn = new PromiseState({
    function: async () => {
      const res = await signIn('credentials', {
        username: user ?? userStorage.value,
        password: password ?? passwordStorage.value,
        callbackUrl: '/',
        redirect: false,
      });
      return res;
    },
  });
  const SignInTwoFactor = new PromiseState({
    function: async (code: string) => {
      const res = await signIn('credentials', {
        username: user ?? userStorage.value,
        password: password ?? passwordStorage.value,
        callbackUrl: '/',
        redirect: false,
        twoFactorCode: code,
        isSecondStep: 'true',
      });
      return res;
    },
  });

  const userStorage = new StorageState({ key: 'username' });
  const passwordStorage = new StorageState({ key: 'password' });

  useEffect(() => {
    try {
      RootStore.Get(UserStore)
        .canRegister.call()
        .then((v) => {
          setCanRegister(v ?? false);
        });
      if (userStorage.value) {
        setUser(userStorage.value);
      }
      if (passwordStorage.value) {
        setPassword(passwordStorage.value);
      }
    } catch (error) {}
  }, []);

  const login = async () => {
    try {
      const res = await SignIn.call();

      if (res?.ok) {
        const session = await fetch('/api/auth/session').then((res) => res.json());
        if (session?.requiresTwoFactor) {
          ShowTwoFactorModal(async (code) => {
            const twoFactorRes = await SignInTwoFactor.call(code);
            if (twoFactorRes?.ok) {
              RootStore.Get(DialogStore).close();
              userStorage.setValue(user);
              passwordStorage.setValue(password);
              router.push('/');
            } else {
              RootStore.Get(ToastPlugin).error(twoFactorRes?.error ?? t('user-or-password-error'));
            }
          }, SignInTwoFactor.loading.value);
        } else {
          userStorage.setValue(user);
          passwordStorage.setValue(password);
          router.push('/');
        }
      } else {
        RootStore.Get(ToastPlugin).error(res?.error ?? t('user-or-password-error'));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleOAuthLogin = async (providerId: string) => {
    try {
      setLoadingProvider(providerId);
      await signIn(providerId, {
        callbackUrl: '/oauth-callback',
        redirect: true,
      });
    } catch (error) {
      console.error('login failed:', error);
      RootStore.Get(ToastPlugin).error(t('login-failed'));
    } finally {
      setLoadingProvider('');
    }
  };

  return (
    <div className="relative min-h-screen w-screen">
      {/* Plus background pattern (non-interactive and behind everything) */}
      <div className="absolute inset-0 z-0 bg-[url('/pattern-plus.svg')] bg-repeat opacity-30 dark:opacity-10 pointer-events-none"></div>

      {/* Login Form container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="relative w-full max-w-sm flex flex-col gap-4 rounded-2xl glass-effect px-6 sm:px-8 pb-10 pt-6 shadow-2xl bg-white/30 dark:bg-black/30 backdrop-blur-md">
          {/* Back Arrow */}
          <Icon icon="solar:arrow-left-bold" className="absolute top-4 left-4 text-default-400 cursor-pointer hover:text-violet-500 transition" onClick={() => router.push('/your-target-url')} />

          {/* Title */}
          <p className="text-xl font-medium text-center flex gap-2 items-center justify-center pb-2">
            Login With <span className="text-violet-400">BRAINWAVE</span>
            <Image ></Image>
          </p>

          {/* OAuth Buttons */}
          {providers.length > 0 && (
            <>
              <div className="flex flex-col gap-4">
                {providers.map((provider) => (
                  <Button
                    key={provider.id}
                    className="w-full text-primary"
                    color="primary"
                    variant="bordered"
                    startContent={provider.icon && <Icon icon={provider.icon} className="text-xl" />}
                    isLoading={loadingProvider === provider.id}
                    onPress={() => handleOAuthLogin(provider.id)}
                  >
                    {t('sign-in-with-provider', { provider: provider.name })}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2 my-4">
                <Divider className="flex-1" />
                <span className="text-sm text-default-400">{t('or')}</span>
                <Divider className="flex-1" />
              </div>
            </>
          )}

          {/* Login Form */}
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <Input label={t('username')} name="username" placeholder={t('enter-your-name')} type="text" variant="bordered" value={user} onChange={(e) => setUser(e.target.value?.trim())} />
            <Input
              label={t('password')}
              name="password"
              placeholder={t('enter-your-password')}
              type={isVisible ? 'text' : 'password'}
              variant="bordered"
              value={password}
              onKeyDown={(e) => e.key === 'Enter' && login()}
              onChange={(e) => setPassword(e.target.value?.trim())}
              endContent={
                <button type="button" onClick={() => setIsVisible(!isVisible)}>
                  <Icon className="pointer-events-none text-2xl text-default-400" icon={isVisible ? 'solar:eye-closed-linear' : 'solar:eye-bold'} />
                </button>
              }
            />

            <div className="flex items-center justify-between px-1">
              <Checkbox defaultSelected name="remember" size="sm">
                {t('keep-sign-in')}
              </Checkbox>
            </div>

            <Button color="primary" isLoading={SignIn.loading.value} onPress={login}>
              {t('sign-in')}
            </Button>
          </form>

          {/* Register Link */}
          {/* {canRegister && (
            <p className="text-center text-sm text-gray-500">
              {t('need-to-create-an-account')}&nbsp;
              <Link href="/signup" className="text-primary font-medium">
                {t('sign-up')}
              </Link>
            </p>
          )} */}
          <p className="text-center text-sm text-default-500">
            Don't have an account?&nbsp;
            <Link href="/signup" className="text-primary font-semibold hover:underline transition">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
