import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../utils/theme';

export default function GroupCard({
  group,
  documentCount,
  onPress,
}) {
  const isOwner = group.role === 'Trưởng nhóm';

  return (
    <Pressable
      onPress={onPress}
      style={s.card}
    >
      <View
        style={[
          s.logo,
          {
            backgroundColor: group.color,
          },
        ]}
      >
        <FontAwesome5
          name="users"
          size={18}
          color="#fff"
        />
      </View>

      <View style={s.content}>
        <Text
          style={s.name}
          numberOfLines={1}
        >
          {group.name}
        </Text>

        {group.description ? (
          <Text
            style={s.desc}
            numberOfLines={1}
          >
            {group.description}
          </Text>
        ) : null}

        <View style={s.meta}>
          <View style={s.metaItem}>
            <FontAwesome5
              name="user-friends"
              size={11}
              color={colors.muted}
            />

            <Text style={s.metaText}>
              {group.members.length} thành viên
            </Text>
          </View>

          <View style={s.metaItem}>
            <FontAwesome5
              name="file-alt"
              size={11}
              color={colors.muted}
            />

            <Text style={s.metaText}>
              {documentCount} tài liệu
            </Text>
          </View>
        </View>
      </View>

      <View style={s.right}>
        <Text
          style={[
            s.role,
            isOwner && s.owner,
          ]}
        >
          {group.role}
        </Text>

        <FontAwesome5
          name="chevron-right"
          size={12}
          color="#A4ADBE"
        />
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  logo: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },

  desc: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 3,
  },

  meta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 9,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  metaText: {
    color: colors.muted,
    fontSize: 11,
  },

  right: {
    alignItems: 'flex-end',
    gap: 12,
  },

  role: {
    fontSize: 10,
    color: colors.primary,
    backgroundColor: colors.lavender,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
  },

  owner: {
    color: '#7C3AED',
    backgroundColor: '#F2EAFE',
  },
});