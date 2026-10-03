import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FontAwesome5 } from '@expo/vector-icons';

import {
  filePresentation,
  formatBytes,
} from '../utils/fileUtils';

import { formatDate } from '../utils/formatDate';
import { colors } from '../utils/theme';

export default function DocumentCard({
  document,
  group,
  onPress,
}) {
  const [icon, color] = filePresentation(
    document.type
  );

  const sharedByAnotherMember =
    document.sharedBy &&
    document.sharedBy !== document.uploader;

  return (
    <Pressable
      style={s.card}
      onPress={onPress}
    >
      <View
        style={[
          s.icon,
          {
            backgroundColor: color + '18',
          },
        ]}
      >
        <FontAwesome5
          name={icon}
          size={21}
          color={color}
        />
      </View>

      <View style={s.info}>
        <Text
          style={s.name}
          numberOfLines={1}
        >
          {document.name}
        </Text>

        <Text
          style={s.sub}
          numberOfLines={1}
        >
          {group?.name || 'Nhóm'} · Đăng bởi{' '}
          {document.uploader}
        </Text>

        {sharedByAnotherMember && (
          <Text
            style={s.sharedBy}
            numberOfLines={1}
          >
            Chia sẻ bởi {document.sharedBy}
          </Text>
        )}

        <Text style={s.date}>
          {formatBytes(document.size)}
          {' · '}
          {formatDate(document.date)}
        </Text>
      </View>

      <FontAwesome5
        name="chevron-right"
        size={12}
        color="#A4ADBE"
      />
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  icon: {
    height: 44,
    width: 44,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },

  sub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },

  sharedBy: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 3,
    fontWeight: '600',
  },

  date: {
    fontSize: 11,
    color: '#9AA4B5',
    marginTop: 4,
  },
});