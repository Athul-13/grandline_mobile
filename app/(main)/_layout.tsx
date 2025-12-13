import { Ionicons } from '@expo/vector-icons';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProtectedRoute } from '../../src/components/routes/protected_route';
import { NotificationBadge } from '../../src/components/notifications/notification_badge';
import { useNotifications } from '../../src/contexts/notification_context';
import { useChat } from '../../src/contexts/chat_context';

// Define the colors for easier maintenance
const PRIMARY_COLOR = '#C5630C'; // Active tab background color
const INACTIVE_COLOR = '#666';
const ACTIVE_ICON_LABEL_COLOR = 'white';

export default function MainLayout() {
  return (
    <ProtectedRoute>
      <View style={{ flex: 1, backgroundColor: '#F4F1DE' }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' }, // Hide default tab bar
          }}
        >
          <Tabs.Screen
            name="(dashboard)"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="(map)"
            options={{
              title: 'Map',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="map" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              title: 'Chat',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="chatbubbles" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="(settings)"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
        
        {/* Custom Tab Bar */}
        <CustomTabBar />
        
        <StatusBar style="dark" backgroundColor="#F4F1DE" />
      </View>
    </ProtectedRoute>
  );
}

// Custom Tab Bar Component
function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const { unreadCount } = useNotifications();
  const { totalUnreadCount } = useChat();
  
  // Debug: Track pathname changes
  React.useEffect(() => {
    console.log('🔄 Pathname changed to:', pathname);
    
    // Update active tab based on pathname
    if (pathname === '/(main)/(dashboard)' || pathname === '/(main)/(dashboard)/') {
      setActiveTab('dashboard');
    } else if (pathname === '/(main)/(map)' || pathname === '/(main)/(map)/') {
      setActiveTab('map');
    } else if (pathname?.startsWith('/(main)/chat')) {
      setActiveTab('chat');
    } else if (pathname === '/(main)/(settings)' || pathname === '/(main)/(settings)/' || pathname?.startsWith('/(main)/(settings)/')) {
      setActiveTab('settings');
    }
  }, [pathname]);
  
  const tabs = [
    { key: 'dashboard', title: 'Dashboard', icon: 'home', route: '/(main)/(dashboard)' },
    { key: 'map', title: 'Map', icon: 'map', route: '/(main)/(map)' },
    { key: 'chat', title: 'Chat', icon: 'chatbubbles', route: '/(main)/chat/chat-list', badgeCount: totalUnreadCount },
    { key: 'settings', title: 'Settings', icon: 'settings', route: '/(main)/(settings)', badgeCount: unreadCount },
  ];

  const handleTabPress = (route: string) => {
    router.replace(route as any);
  };

  const isActive = (tabKey: string) => {
    console.log('🔍 Checking tab key:', tabKey, 'against activeTab:', activeTab);
    const isActiveResult = activeTab === tabKey;
    console.log('✅ Is active:', isActiveResult);
    return isActiveResult;
  };

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            isActive(tab.key) && styles.activeTab
          ]}
          onPress={() => {
            console.log('🎯 Tab pressed:', tab.title, 'Route:', tab.route);
            setActiveTab(tab.key); // Update state immediately
            handleTabPress(tab.route);
          }}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name={tab.icon as any}
              size={24}
              color={isActive(tab.key) ? ACTIVE_ICON_LABEL_COLOR : INACTIVE_COLOR}
            />
            {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
              <View style={styles.badgeContainer}>
                <NotificationBadge count={tab.badgeCount} maxCount={99} />
              </View>
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              { color: isActive(tab.key) ? ACTIVE_ICON_LABEL_COLOR : INACTIVE_COLOR }
            ]}
          >
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(197, 99, 12, 0.2)',
    height: 70,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 50,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: PRIMARY_COLOR,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  iconContainer: {
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -8,
  },
});