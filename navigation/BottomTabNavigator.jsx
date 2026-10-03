import React from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/tabs/HomeScreen';
import GroupsScreen from '../screens/tabs/GroupsScreen';
import DocumentsScreen from '../screens/tabs/DocumentsScreen';
import ProfileScreen from '../screens/tabs/ProfileScreen';

import { colors } from '../utils/theme';

const Tab = createBottomTabNavigator();

const icons = {
  Home: 'home',
  Groups: 'users',
  Documents: 'folder-open',
  Profile: 'user',
};

export default function BottomTabNavigator({
  logout,
  openAbout,
}) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#9AA4B5',

        tabBarStyle: {
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopColor: colors.border,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },

        tabBarIcon: ({ color }) => (
          <FontAwesome5
            name={icons[route.name]}
            size={18}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        options={{
          title: 'Trang chủ',
        }}
      >
        {({ navigation }) => (
          <HomeScreen
            openGroup={(id) =>
              navigation.navigate(
                'GroupDetail',
                { id }
              )
            }
            openDocument={(id) =>
              navigation.navigate(
                'DocumentDetail',
                { id }
              )
            }
            goDocuments={() =>
              navigation.navigate('Documents')
            }
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Groups"
        options={{
          title: 'Nhóm',
        }}
      >
        {({ navigation, route }) => (
          <GroupsScreen
            openGroup={(id) =>
              navigation.navigate(
                'GroupDetail',
                { id }
              )
            }
            create={() =>
              navigation.navigate('CreateGroup')
            }
            join={() =>
              navigation.navigate('JoinGroup')
            }
            successNotice={
              route.params?.successNotice
            }
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Documents"
        options={{
          title: 'Tài liệu',
        }}
      >
        {({ navigation }) => (
          <DocumentsScreen
            openDocument={(id) =>
              navigation.navigate(
                'DocumentDetail',
                { id }
              )
            }
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Profile"
        options={{
          title: 'Tôi',
        }}
      >
        {({ navigation }) => (
          <ProfileScreen
            logout={logout}
            goDocuments={() =>
              navigation.navigate('Documents')
            }
            goGroups={() =>
              navigation.navigate('Groups')
            }
            goAbout={openAbout}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}