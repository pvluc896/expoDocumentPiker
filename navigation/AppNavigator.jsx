import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useApp } from '../context/AppContext';
import BottomTabNavigator from './BottomTabNavigator';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

import CreateGroupScreen from '../screens/group/CreateGroupScreen';
import JoinGroupScreen from '../screens/group/JoinGroupScreen';
import GroupDetailScreen from '../screens/group/GroupDetailScreen';
import MembersScreen from '../screens/group/MembersScreen';

import UploadDocumentScreen from '../screens/document/UploadDocumentScreen';
import DocumentDetailScreen from '../screens/document/DocumentDetailScreen';

import AboutScreen from '../screens/AboutScreen';

const Stack = createNativeStackNavigator();
const NAVIGATION_KEY = '@groupdocs_navigation';

export default function AppNavigator() {
  const { user, logout, login, register } = useApp();

  const [initialState, setInitialState] = useState();
  const [navigationReady, setNavigationReady] = useState(false);

  useEffect(() => {
    const restoreNavigation = async () => {
      try {
        if (user) {
          const savedState = await AsyncStorage.getItem(NAVIGATION_KEY);

          if (savedState) {
            setInitialState(JSON.parse(savedState));
          }
        }
      } catch (error) {
        console.log('Lỗi khôi phục màn hình:', error);
      } finally {
        setNavigationReady(true);
      }
    };

    restoreNavigation();
  }, [user]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem(NAVIGATION_KEY);
    await logout();
  };

  if (!navigationReady) {
    return null;
  }

  return (
    <NavigationContainer
      initialState={user ? initialState : undefined}
      onStateChange={async (state) => {
        if (user) {
          await AsyncStorage.setItem(
            NAVIGATION_KEY,
            JSON.stringify(state)
          );
        }
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login">
              {({ navigation }) => (
                <LoginScreen
                  onLogin={login}
                  onRegister={() => navigation.navigate('Register')}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Register">
              {({ navigation }) => (
                <RegisterScreen
                  back={() => navigation.goBack()}
                  onRegister={register}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              options={{ animation: 'fade' }}
            >
              {({ navigation }) => (
                <BottomTabNavigator
                  logout={handleLogout}
                  openAbout={() => navigation.navigate('About')}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="CreateGroup">
              {({ navigation }) => (
                <CreateGroupScreen
                  back={() => navigation.goBack()}
                  onCreated={(groupId) =>
                    navigation.replace('GroupDetail', {
                      id: groupId,
                    })
                  }
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="JoinGroup">
              {({ navigation }) => (
                <JoinGroupScreen
                  back={() => navigation.goBack()}
                  openGroup={(id) =>
                    navigation.replace('GroupDetail', { id })
                  }
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="GroupDetail">
              {({ route, navigation }) => (
                <GroupDetailScreen
                  id={route.params.id}
                  back={() => navigation.goBack()}
                  upload={(groupId) =>
                    navigation.navigate('UploadDocument', {
                      groupId,
                    })
                  }
                  openDocument={(id) =>
                    navigation.navigate('DocumentDetail', {
                      id,
                    })
                  }
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Members">
              {({ route, navigation }) => (
                <MembersScreen
                  groupId={route.params.groupId}
                  back={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="UploadDocument">
              {({ route, navigation }) => (
                <UploadDocumentScreen
                  groupId={route.params.groupId}
                  back={() =>
                    navigation.replace('GroupDetail', {
                      id: route.params.groupId,
                    })
                  }
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="DocumentDetail">
              {({ route, navigation }) => (
                <DocumentDetailScreen
                  id={route.params.id}
                  back={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="About">
              {({ navigation }) => (
                <AboutScreen
                  back={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}