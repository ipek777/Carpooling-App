import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';

type NavItem = {
  label: string;
  path: string;
  match: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  {
    label: 'Home',
    path: '/',
    match: (pathname) => pathname === '/',
  },
  {
    label: 'Find',
    path: '/search',
    match: (pathname) => pathname === '/search',
  },
  {
    label: 'Create',
    path: '/trips/new',
    match: (pathname) => pathname === '/trips/new',
  },
  {
    label: 'Trips',
    path: '/trips',
    match: (pathname) => pathname === '/trips' || pathname.startsWith('/trips/'),
  },
  {
    label: 'Profile',
    path: '/profile',
    match: (pathname) => pathname === '/profile' || pathname.startsWith('/users/'),
  },
];

export function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  if (pathname === '/login') {
    return null;
  }

  const goTo = (path: string) => {
    if (!isAuthenticated && path !== '/' && path !== '/search') {
      router.push('/login' as any);
      return;
    }

    router.push(path as any);
  };

  return (
    <View style={styles.nav}>
      {navItems.map((item) => {
        const active = item.match(pathname);
        return (
          <Pressable
            key={item.path}
            style={[styles.navItem, active && styles.activeNavItem]}
            onPress={() => goTo(item.path)}
          >
            <Text style={[styles.navText, active && styles.activeNavText]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#ffffff',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
  },
  activeNavItem: {
    backgroundColor: '#EFF6FF',
  },
  navText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
  },
  activeNavText: {
    color: '#2563EB',
  },
});
