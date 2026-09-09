import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Icon } from '../components';
import { CleanerSearchScreen } from '../screens/customer/CleanerSearchScreen';
import { CustomerBookingsScreen } from '../screens/customer/CustomerBookingsScreen';
import { CustomerHomeScreen } from '../screens/customer/CustomerHomeScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { colors } from '../theme';
import type { CustomerTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

const icons: Record<keyof CustomerTabParamList, { active: string; inactive: string }> = {
  CustomerHome: { active: 'home', inactive: 'home-outline' },
  CleanerSearch: { active: 'search', inactive: 'search-outline' },
  CustomerBookings: { active: 'calendar', inactive: 'calendar-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
}

const tabIcons = Object.fromEntries(
  (Object.keys(icons) as Array<keyof CustomerTabParamList>).map(name => [
    name,
    ({ focused, color, size }: TabIconProps) => (
      <Icon name={focused ? icons[name].active : icons[name].inactive} size={size} color={color} />
    ),
  ]),
) as Record<keyof CustomerTabParamList, (props: TabIconProps) => React.JSX.Element>;

export function CustomerTabs(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.ink400,
        tabBarIcon: tabIcons[route.name],
      })}>
      <Tab.Screen name="CustomerHome" component={CustomerHomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="CleanerSearch" component={CleanerSearchScreen} options={{ title: 'Explore' }} />
      <Tab.Screen
        name="CustomerBookings"
        component={CustomerBookingsScreen}
        options={{ title: 'Bookings' }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
