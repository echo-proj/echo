import { ReactNode, useState } from 'react';
import { useRouter } from 'next/router';
import { useProfile } from '@/hooks/useUsers';
import { ProfileDialog } from '@/pages/profile/ProfileDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Search, FileText } from 'lucide-react';
import { authStorage } from '@/lib/auth';
import styles from './AuthenticatedLayout.module.scss';

interface AuthenticatedLayoutProps {
  children: ReactNode;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
}

export function AuthenticatedLayout({
  children,
  onSearch,
  searchPlaceholder = "Search documents...",
  showSearch = true,
}: AuthenticatedLayoutProps) {
  const router = useRouter();
  const { data: profile } = useProfile();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    authStorage.clearAuth();
    router.push('/login');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.leftSection}>
            <div className={styles.logo}>
              <FileText className={styles.logoIcon} />
              <span className={styles.logoText}>Echo</span>
            </div>

            {showSearch && (
              <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} />
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className={styles.searchInput}
                />
              </div>
            )}
          </div>

          <div className={styles.rightSection}>
            <button
              className={styles.profileButton}
              onClick={() => setProfileDialogOpen(true)}
            >
              <Avatar className={styles.avatar}>
                <AvatarImage src={profile?.profilePicture || undefined} />
                <AvatarFallback>
                  {getInitials(profile?.fullName || profile?.username)}
                </AvatarFallback>
              </Avatar>
              <div className={styles.userInfo}>
                <span className={styles.userName}>
                  {profile?.fullName || profile?.username}
                </span>
                <span className={styles.userRole}>View Profile</span>
              </div>
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {children}
      </main>

      <ProfileDialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen} />
    </div>
  );
}
