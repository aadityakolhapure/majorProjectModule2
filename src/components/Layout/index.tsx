import React, { useEffect, useState } from 'react';
import { Button, Badge } from '@heroui/react';
import { Icon } from '@/components/Common/Iconify/icons';
import { UserStore } from '@/store/user';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import { RootStore } from '@/store';
import { BlinkoStore } from '@/store/blinkoStore';
import { useTranslation } from 'react-i18next';
import { BaseStore } from '@/store/baseStore';
import { ScrollArea } from '../Common/ScrollArea';
import { BlinkoRightClickMenu } from '@/components/BlinkoRightClickMenu';
import { useMediaQuery } from 'usehooks-ts';
import { push as Menu } from 'react-burger-menu';
import { eventBus } from '@/lib/event';
import AiWritePop from '../Common/PopoverFloat/aiWritePop';
import { Sidebar } from './Sidebar';
import { MobileNavBar } from './MobileNavBar';
import FilterPop from '../Common/PopoverFloat/filterPop';
import { api } from '@/lib/trpc';
import { showTipsDialog } from '../Common/TipsDialog';
import { DialogStandaloneStore } from '@/store/module/DialogStandalone';
import { ToastPlugin } from '@/store/module/Toast/Toast';
import { BarSearchInput } from './BarSearchInput';
import { BlinkoNotification } from '@/components/BlinkoNotification';
import { AiStore } from '@/store/aiStore';

export const SideBarItem = 'p-2 flex flex-row items-center cursor-pointer gap-2 hover:bg-hover rounded-xl transition-all';

export const CommonLayout = observer(({ children, header }: { children?: React.ReactNode; header?: React.ReactNode }) => {
  const router = useRouter();
  const [isClient, setClient] = useState(false);
  const [isOpen, setisOpen] = useState(false);

  const isPc = useMediaQuery('(min-width: 768px)');
  const { t } = useTranslation();
  const user = RootStore.Get(UserStore);
  const blinkoStore = RootStore.Get(BlinkoStore);
  const base = RootStore.Get(BaseStore);

  blinkoStore.use();
  user.use();
  base.useInitApp(router);

  useEffect(() => {
    if (isPc) setisOpen(false);
  }, [isPc]);

  useEffect(() => {
    setClient(true);
    eventBus.on('close-sidebar', () => {
      setisOpen(false);
    });
  }, []);

  if (!isClient) return <></>;

  if (
    router.pathname == '/signin' ||
    router.pathname == '/signup' ||
    router.pathname == '/api-doc' ||
    router.pathname.includes('/share') ||
    router.pathname == '/editor' ||
    router.pathname == '/oauth-callback'
  ) {
    return <>{children}</>;
  }

  return (
    <div className="flex w-full h-mobile-full overflow-x-hidden" id="outer-container">
      <AiWritePop />

      <Menu disableAutoFocus onClose={() => setisOpen(false)} onOpen={setisOpen} isOpen={isOpen} pageWrapId={'page-wrap'} outerContainerId={'outer-container'}>
        <Sidebar onItemClick={() => setisOpen(false)} />
      </Menu>

      {isPc && <Sidebar />}

      <main
        id="page-wrap"
        style={{ width: isPc ? `calc(100% - ${base.sideBarWidth}px)` : '100%' }}
        className={`flex transition-all duration-300 overflow-y-hidden w-full flex-col gap-y-1 bg-sencondbackground`}
      >
        {/* nav bar  */}
        <header className="relative flex h-14 md:h-16 items-center justify-between px-4 md:px-6 bg-background/90 backdrop-blur border-b border-border z-10">
          {/* Decorative Glow */}
          <div className="hidden md:block absolute bottom-[10%] right-[5%] h-[300px] w-[300px] overflow-hidden blur-3xl z-0 pointer-events-none">
            <div className="w-full h-full bg-[#9936e6] opacity-20" style={{ clipPath: 'circle(50% at 50% 50%)' }} />
          </div>

          {/* Left Section: Title + Toggle (mobile) */}
          <div className="flex items-center gap-3 z-10 w-full max-w-full">
            {!isPc && (
              <Button isIconOnly size="sm" variant="light" onPress={() => setisOpen(!isOpen)}>
                <Icon className="text-default-500" height={24} icon="solar:hamburger-menu-outline" width={24} />
              </Button>
            )}

            {/* Title */}
            <div className="flex items-center gap-2 truncate">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <div className="flex items-center gap-1 font-semibold text-foreground truncate">
                <span className="truncate">{router.asPath === '/ai' ? RootStore.Get(AiStore).currentConversation.value?.title || t(base.currentTitle) : t(base.currentTitle)}</span>

                {router.query?.path !== 'trash' ? (
                  <Icon
                    className="cursor-pointer hover:rotate-180 transition-transform text-muted-foreground"
                    onClick={() => {
                      blinkoStore.refreshData();
                      blinkoStore.updateTicker++;
                    }}
                    icon="fluent:arrow-sync-12-filled"
                    width="20"
                    height="20"
                  />
                ) : (
                  <Icon
                    className="cursor-pointer text-red-500"
                    onClick={() => {
                      showTipsDialog({
                        size: 'sm',
                        title: t('confirm-to-delete'),
                        content: t('this-operation-removes-the-associated-label-and-cannot-be-restored-please-confirm'),
                        onConfirm: async () => {
                          await RootStore.Get(ToastPlugin).promise(api.notes.clearRecycleBin.mutate(), {
                            loading: t('in-progress'),
                            success: <b>{t('your-changes-have-been-saved')}</b>,
                            error: <b>{t('operation-failed')}</b>,
                          });
                          blinkoStore.refreshData();
                          RootStore.Get(DialogStandaloneStore).close();
                        },
                      });
                    }}
                    icon="mingcute:delete-2-line"
                    width="20"
                    height="20"
                  />
                )}
              </div>

              {!base.isOnline && (
                <Badge color="warning" variant="flat" className="animate-pulse ml-2">
                  <div className="text-xs text-yellow-600">{t('offline-status')}</div>
                </Badge>
              )}
            </div>
          </div>

          {/* Right Section: Controls */}
          <div className="flex items-center gap-2 md:gap-4 z-10">
            <BarSearchInput isPc={isPc} />
            <FilterPop />
            {!blinkoStore.config.value?.isCloseDailyReview && (
              <Badge size="sm" content={blinkoStore.dailyReviewNoteList.value?.length} color="warning">
                <Link href="/review" passHref legacyBehavior>
                  <Button as="a" isIconOnly size="sm" variant="light">
                    <Icon icon="tabler:bulb" width="22" height="22" />
                  </Button>
                </Link>
              </Badge>
            )}
            <BlinkoNotification />
          </div>

          {/* Optional custom header section if provided */}
          {header}
        </header>

        {/* backdrop  pt-6 -mt-6 to fix the editor tooltip position */}

        <ScrollArea onBottom={() => {}} className="h-[calc(100%_-_70px)] !overflow-y-auto overflow-x-hidden mt-[-4px]">
          <div className="relative flex h-full w-full flex-col rounded-medium layout-container">
            <div className="hidden md:block absolute top-[-37%] right-[5%] z-[0] h-[350px] w-[350px] overflow-hidden blur-3xl ">
              <div className="w-full h-[356px] bg-[#9936e6] opacity-20" style={{ clipPath: 'circle(50% at 50% 50%)' }} />
            </div>
            {children}
          </div>
        </ScrollArea>

        <MobileNavBar onItemClick={() => setisOpen(false)} />
        <BlinkoRightClickMenu />
      </main>
    </div>
  );
});
