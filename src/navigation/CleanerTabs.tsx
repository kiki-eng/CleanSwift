import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Icon } from '../components';
import { CleanerHomeScreen } from '../screens/cleaner/CleanerHomeScreen';
import { CleanerJobsScreen } from '../screens/cleaner/CleanerJobsScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { colors } from '../theme';
import type { CleanerTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<CleanerTabParamList>();

const icons: Record<keyof CleanerTabParamList, { active: string; inactive: string }> = {
  CleanerHome: { active: 'home', inactive: 'home-outline' },
  CleanerJobs: { active: 'briefcase', inactive: 'briefcase-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
}

const tabIcons = Object.fromEntries(
  (Object.keys(icons) as Array<keyof CleanerTabParamList>).map(name => [
    name,
    ({ focused, color, size }: TabIconProps) => (
      <Icon name={focused ? icons[name].active : icons[name].inactive} size={size} color={color} />
    ),
  ]),
) as Record<keyof CleanerTabParamList, (props: TabIconProps) => React.JSX.Element>;

export function CleanerTabs(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.ink400,
        tabBarIcon: tabIcons[route.name],
      })}>
      <Tab.Screen name="CleanerHome" component={CleanerHomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="CleanerJobs" component={CleanerJobsScreen} options={{ title: 'Jobs' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
