import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../utils/theme';

export default function MemberItem({
    member,
    leader,
    canRemove,
    onRemove,
}) {
    const initials = member.name
        .split(' ')
        .slice(-2)
        .map((part) => part[0])
        .join('');

    return (
        <View style={s.row}>
            <View style={s.avatar}>
                <Text style={s.initial}>
                    {initials}
                </Text>
            </View>

            <View style={s.info}>
                <Text style={s.name}>
                    {member.name}
                </Text>

                <Text style={s.email}>
                    {member.email}
                </Text>
            </View>

            {leader && (
                <Text style={s.badge}>
                    Trưởng nhóm
                </Text>
            )}

            {canRemove && (
                <Pressable
                    hitSlop={10}
                    onPress={onRemove}
                >
                    <FontAwesome5
                        name="user-times"
                        size={15}
                        color={colors.danger}
                    />
                </Pressable>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    row: {
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 11,
        borderBottomWidth: 1,
        borderColor: '#F0F1F5',
    },

    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.lavender,
        alignItems: 'center',
        justifyContent: 'center',
    },

    initial: {
        fontWeight: '800',
        fontSize: 12,
        color: colors.primary,
    },

    info: {
        flex: 1,
    },

    name: {
        fontWeight: '700',
        fontSize: 14,
        color: colors.text,
    },

    email: {
        fontSize: 12,
        color: colors.muted,
        marginTop: 3,
    },

    badge: {
        fontSize: 10,
        color: '#7C3AED',
        backgroundColor: '#F2EAFE',
        padding: 5,
        borderRadius: 6,
    },
});