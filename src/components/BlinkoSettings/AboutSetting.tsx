// blinko.public.value?.version

import { observer } from 'mobx-react-lite';
import { Link, Image, Chip } from '@heroui/react';
import { RootStore } from '@/store';
import { BlinkoStore } from '@/store/blinkoStore';
import { PromiseState } from '@/store/standard/PromiseState';
import { Icon } from '@/components/Common/Iconify/icons';
import { api } from '@/lib/trpc';
import { AiStore } from '@/store/aiStore';
import { useTranslation } from 'react-i18next';
import { Item } from './Item';
import { useEffect } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { CollapsibleCard } from '@/components/Common/CollapsibleCard';

export const AboutSetting = observer(() => {
  const blinko = RootStore.Get(BlinkoStore);
  const ai = RootStore.Get(AiStore);
  const { t } = useTranslation();
  const isPc = useMediaQuery('(min-width: 768px)');
  const store = RootStore.Local(() => ({
    version: new PromiseState({
      function: async () => {
        return await api.public.version.query();
      },
    }),
    latestVersion: new PromiseState({
      function: async () => {
        return await api.public.latestVersion.query();
      },
    }),
  }));

  useEffect(() => {
    store.version.call();
    store.latestVersion.call();
  }, []);

  return (
    <CollapsibleCard icon="tabler:info-circle" title={t('about')}>
      <div className="flex items-start space-x-4 mb-6">
        <Image src="/logo-light copy.png" alt="brainwave" className="w-16 h-16 rounded-xl dark:hidden" width={64} height={64} />

        {/* Dark Theme Logo */}
        <Image src="/logo-dark copy.png" alt="brainwave" className="w-16 h-16 rounded-xl hidden dark:block" width={64} height={64} />
        <div>
          <h2 className="text-xl font-semibold">Brainwave</h2>
          <div className="flex items-center gap-2 mt-1">
            {/* <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs">
              v{store.version.value}
            </span> */}
            <Chip color="warning" variant="flat" size="sm" className="text-xs" startContent={<Icon icon="mingcute:version-fill" width="16" height="16" />}>
              v{store.version.value}
            </Chip>
            {store.latestVersion.value != '' && store.latestVersion.value != store.version.value && (
              <Chip
                classNames={{
                  base: 'bg-gradient-to-br from-indigo-500 to-pink-500 border-small border-white/50 shadow-pink-500/30',
                  content: 'drop-shadow shadow-black text-white',
                }}
                size="sm"
                className="cursor-pointer"
                onClick={() => {
                  window.open(`https://github.com/aadityakolhapure`, '_blank');
                }}
              >
                {t('new-version-available')}: v{store.latestVersion.value}
              </Chip>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-gray-500 mb-2">{t('community')}</h3>
        <Item
          leftContent={<>GitHub</>}
          rightContent={
            <Link href="https://github.com/aadityakolhapure" target="_blank" className="text-primary flex items-center gap-1">
              <Icon icon="mdi:github" width="20" />
              brainwave/project
            </Link>
          }
        />
        <Item
          leftContent={<>Discord</>}
          rightContent={
            <Link href="https://discord.com" target="_blank" className="text-primary flex items-center gap-1">
              <Icon icon="mdi:discord" width="20" />
              brainwave Community
            </Link>
          }
        />
        {/* <Item
          leftContent={<>Telegram</>}
          rightContent={
            <Link
              href="https://t.me/blinkoEnglish"
              target="_blank"
              className="text-primary flex items-center gap-1"
            >
              <Icon icon="mdi:telegram" width="20" />
              @blinko
            </Link>
          }
        /> */}
      </div>
    </CollapsibleCard>
  );
});
