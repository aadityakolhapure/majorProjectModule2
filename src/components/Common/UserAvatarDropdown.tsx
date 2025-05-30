import { Icon } from '@/components/Common/Iconify/icons';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Image } from '@heroui/react';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import { RootStore } from '@/store';
import { BaseStore } from '@/store/baseStore';
import { UserStore } from '@/store/user';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { signOut } from 'next-auth/react';

interface UserAvatarDropdownProps {
  onItemClick?: () => void;
  collapsed?: boolean;
}

export const UserAvatarDropdown = observer(({ onItemClick, collapsed = false }: UserAvatarDropdownProps) => {
  const router = useRouter();
  const base = RootStore.Get(BaseStore);
  const user = RootStore.Get(UserStore);
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <Dropdown
      classNames={{
        content: 'bg-sencondbackground',
      }}
    >
      <DropdownTrigger>
        <div className={`cursor-pointer hover:opacity-80 transition-opacity ${collapsed ? 'flex justify-center' : 'flex items-center gap-2'}`}>
          {user.userInfo.value?.image ? (
            <img src={user.userInfo.value.image} alt="avatar" className={`${collapsed ? 'w-10 h-10' : 'w-8 h-8'} rounded-full object-cover`} />
          ) : (
            <>
              {/* Light theme logo */}
              <Image src="/logo-light copy.png" alt="Logo" width={collapsed ? 40 : 30} height={collapsed ? 40 : 30} className="dark:hidden" />
              {/* Dark theme logo */}
              <Image src="/logo-dark copy.png" alt="Logo" width={collapsed ? 40 : 30} height={collapsed ? 40 : 30} className="hidden dark:block" />
            </>
          )}

          {!collapsed && <span className="font-bold">{user.nickname || user.name}</span>}
        </div>
      </DropdownTrigger>
      <DropdownMenu aria-label="User Actions">
        <>
          {base.routerList
            .filter((i) => i.hiddenSidebar)
            .map((i) => (
              <DropdownItem
                key={i.title}
                className="font-bold"
                startContent={<Icon icon={i.icon} width="20" height="20" />}
                onPress={() => {
                  router.push(i.href);
                  base.currentRouter = i;
                  onItemClick?.();
                }}
              >
                {t(i.title)}
              </DropdownItem>
            ))}

          <DropdownItem
            key="logout"
            className="font-bold text-danger"
            startContent={<Icon icon="hugeicons:logout-05" width="20" height="20" />}
            onPress={() => {
              signOut({ callbackUrl: '/' });
              onItemClick?.();
            }}
          >
            {t('logout')}
          </DropdownItem>
        </>
      </DropdownMenu>
    </Dropdown>
  );
});
