import { Icon } from '@/components/Common/Iconify/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import { Button, ScrollShadow } from '@heroui/react';
import { RootStore } from '@/store';
import { BaseStore } from '@/store/baseStore';
import { UserStore } from '@/store/user';
import { SideBarItem } from './index';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'usehooks-ts';
import { useTheme } from 'next-themes';
import { UserAvatarDropdown } from '../Common/UserAvatarDropdown';
import { TagListPanel } from '../Common/TagListPanel';
import { useEffect } from 'react';
import { BlinkoStore } from '@/store/blinkoStore';

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar = observer(({ onItemClick }: SidebarProps) => {
  const router = useRouter();
  const isPc = useMediaQuery('(min-width: 768px)');
  const { theme } = useTheme();
  const { t } = useTranslation();
  const base = RootStore.Get(BaseStore);
  const blinkoStore = RootStore.Get(BlinkoStore);
  const user = RootStore.Get(UserStore);

  useEffect(() => {
    console.log('router.query', router);
    if (!isPc) {
      base.collapseSidebar();
    }
  }, [isPc]);

  return (
    <div
      style={{ width: isPc ? `${base.sideBarWidth}px` : '100%' }}
      className={`flex h-full flex-col relative bg-background border-r border-border shadow-sm
    transition-[width] duration-300 ease-in-out group/sidebar`}
    >
      {/* Collapse/Expand Button */}
      {isPc && (
        <div className="absolute top-4 right-[-12px] z-50">
          <Button isIconOnly size="sm" variant="bordered" className="rounded-full shadow transition hover:bg-muted" onPress={base.toggleSidebar}>
            <Icon icon={base.isSidebarCollapsed ? 'mdi:chevron-right' : 'mdi:chevron-left'} width="20" height="20" />
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="flex-1 flex justify-center">
          <UserAvatarDropdown onItemClick={onItemClick} collapsed={base.isSidebarCollapsed} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {base.routerList
          .filter((i) => !i.hiddenSidebar)
          .map((i) => (
            <Link
              key={i.title}
              href={i.href}
              shallow={i.shallow}
              onClick={() => {
                base.currentRouter = i;
                onItemClick?.();
              }}
            >
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer 
              transition-colors duration-200
              ${base.isSideBarActive(router, i) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted hover:text-foreground/90'}
              ${base.isSidebarCollapsed ? 'justify-center' : ''}`}
              >
                <Icon icon={i.icon} width="20" height="20" />
                {!base.isSidebarCollapsed && <span>{t(i.title)}</span>}
              </div>
            </Link>
          ))}

        {/* Optional Tag List */}
        {!base.isSidebarCollapsed && blinkoStore.tagList.value?.listTags.length !== 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <TagListPanel />
          </div>
        )}
      </nav>

      {/* Footer or bottom utility space */}
      <div className="px-4 py-3 border-t border-border">{!base.isSidebarCollapsed && <div className="text-xs text-muted-foreground">© 2025 Your Company</div>}</div>

      {/* Background Decoration */}
      <div className="halation absolute inset-0 h-[250px] w-[250px] overflow-hidden blur-3xl z-0 pointer-events-none">
        <div className="w-full h-full bg-[#ffc65c] opacity-20" style={{ clipPath: 'circle(35% at 50% 50%)' }} />
      </div>
    </div>
  );
});
