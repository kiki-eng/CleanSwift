import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BookingDetailsScreen } from '../screens/customer/BookingDetailsScreen';
import { CleanerDetailsScreen } from '../screens/customer/CleanerDetailsScreen';
import { CreateRequestScreen } from '../screens/customer/CreateRequestScreen';
import { ChangePasswordScreen } from '../screens/shared/ChangePasswordScreen';
import { EditProfileScreen } from '../screens/shared/EditProfileScreen';
import { NotificationsScreen } from '../screens/shared/NotificationsScreen';
import { SettingsScreen } from '../screens/shared/SettingsScreen';
import { VerifyEmailScreen } from '../screens/shared/VerifyEmailScreen';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import { AuthNavigator } from './AuthNavigator';
import { CleanerTabs } from './CleanerTabs';
import { CustomerTabs } from './CustomerTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  const status = useAuthStore(state => state.status);
  const role = useAuthStore(state => state.user?.role);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}>
        {status === 'loading' ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : status === 'guest' ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            {role === 'CLEANER' ? (
              <Stack.Screen name="CleanerTabs" component={CleanerTabs} />
            ) : (
              <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
            )}
            <Stack.Screen
              name="CreateRequest"
              component={CreateRequestScreen}
              options={{ headerShown: true, title: 'New Cleaning Request' }}
            />
            <Stack.Screen
              name="CleanerDetails"
              component={CleanerDetailsScreen}
              options={{ headerShown: true, title: 'Cleaner' }}
            />
            <Stack.Screen
              name="BookingDetails"
              component={BookingDetailsScreen}
              options={{ headerShown: true, title: 'Booking' }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ headerShown: true, title: 'Notifications' }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ headerShown: true, title: 'Edit Profile' }}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{ headerShown: true, title: 'Change Password' }}
            />
            <Stack.Screen
              name="VerifyEmail"
              component={VerifyEmailScreen}
              options={{ headerShown: true, title: 'Verify Email' }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ headerShown: true, title: 'Settings' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
