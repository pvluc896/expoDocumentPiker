import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

import { FontAwesome5 } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/UI';
import { colors } from '../../utils/theme';

export default function ProfileScreen({
  logout,
  goDocuments,
  goGroups,
  goAbout,
}) {
  const {
    currentUser,
    groups,
    documents,
  } = useApp();

  const myDocuments = documents.filter(
    (document) => document.uploaderId === currentUser.id
  );

  const rows = [
    ['file-alt', 'Tài liệu của tôi', goDocuments],
    ['users', 'Nhóm của tôi', goGroups],
    ['info-circle', 'Giới thiệu GroupDocs', goAbout],
    ['sign-out-alt', 'Đăng xuất', logout],
  ];

  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={s.content}
    >
      <View style={s.profile}>
        <View style={s.avatar}>
          <Text style={s.initial}>
            {currentUser.initials ||
              currentUser.name
                .slice(0, 2)
                .toUpperCase()}
          </Text>
        </View>

        <Text style={s.name}>
          {currentUser.name}
        </Text>

        <Text style={s.email}>
          {currentUser.email}
        </Text>
      </View>

      <View style={s.stats}>
        <StatCard
          icon="users"
          value={groups.length}
          label="Nhóm tham gia"
        />

        <StatCard
          icon="cloud-upload-alt"
          value={myDocuments.length}
          label="Đã đăng"
          color="#24A876"
        />
      </View>

      <Text style={s.heading}>
        Tài khoản
      </Text>

      <View style={s.menu}>
        {rows.map(([icon, title, onPress]) => {
          const isLogout = title === 'Đăng xuất';

          return (
            <Pressable
              key={title}
              onPress={onPress}
              style={s.row}
            >
              <View style={s.rowIcon}>
                <FontAwesome5
                  name={icon}
                  size={16}
                  color={
                    isLogout
                      ? colors.danger
                      : colors.primary
                  }
                />
              </View>

              <Text
                style={[
                  s.rowText,
                  isLogout && s.logoutText,
                ]}
              >
                {title}
              </Text>

              <FontAwesome5
                name="chevron-right"
                size={12}
                color="#A4ADBE"
              />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  content: {
    padding: 20,
    paddingBottom: 100,
  },

  profile: {
    alignItems: 'center',
    paddingVertical: 22,
  },

  avatar: {
    height: 80,
    width: 80,
    borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  initial: {
    fontSize: 25,
    fontWeight: '800',
    color: '#fff',
  },

  name: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.text,
    marginTop: 13,
  },

  email: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },

  stats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },

  heading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginTop: 28,
    marginBottom: 11,
  },

  menu: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 14,
  },

  row: {
    height: 59,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#F1F2F5',
    gap: 12,
  },

  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowText: {
    flex: 1,
    fontWeight: '700',
    fontSize: 14,
    color: colors.text,
  },

  logoutText: {
    color: colors.danger,
  },
});