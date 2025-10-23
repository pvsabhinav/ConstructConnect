import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import screens
import MessagingScreen from './src/screens/MessagingScreen';
import PhotoReportingScreen from './src/screens/PhotoReportingScreen';

// Import theme
import { theme } from './src/styles/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={theme.colors.background} />
        <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Messages') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Reports') {
              iconName = focused ? 'camera' : 'camera-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            height: 80,
            paddingBottom: 20,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
            borderBottomWidth: 1,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        })}
      >
        <Tab.Screen 
          name="Messages" 
          component={MessagingScreen}
                options={{ title: 'Project Chat' }}
        />
        <Tab.Screen 
          name="Reports" 
          component={PhotoReportingScreen}
          options={{ title: 'Photo Reports' }}
        />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

