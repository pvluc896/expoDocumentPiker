import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../utils/theme';

export function PrimaryButton({
    title,
    onPress,
    icon,
    loading,
    style,
    variant = 'primary',
}) {
    return (
        <Pressable
            onPress={onPress}
            disabled={loading}
            style={[
                s.button,
                variant === 'light' && s.light,
                style,
                loading && s.disabled,
            ]}
        >
            {icon && (
                <FontAwesome5
                    name={icon}
                    size={15}
                    color={
                        variant === 'light'
                            ? colors.primary
                            : '#fff'
                    }
                />
            )}

            <Text
                style={[
                    s.buttonText,
                    variant === 'light' && s.lightText,
                ]}
            >
                {loading ? 'Đang xử lý...' : title}
            </Text>
        </Pressable>
    );
}

export function SearchBar({
    value,
    onChangeText,
    placeholder = 'Tìm kiếm...',
}) {
    return (
        <View style={s.search}>
            <FontAwesome5
                name="search"
                size={15}
                color={colors.muted}
            />

            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.muted}
                style={s.searchInput}
            />
        </View>
    );
}

export function StatCard({
    icon,
    label,
    value,
    color = colors.primary,
}) {
    return (
        <View style={s.stat}>
            <View
                style={[
                    s.statIcon,
                    {
                        backgroundColor: color + '18',
                    },
                ]}
            >
                <FontAwesome5
                    name={icon}
                    color={color}
                    size={18}
                />
            </View>

            <Text style={s.statValue}>
                {value}
            </Text>

            <Text style={s.statLabel}>
                {label}
            </Text>
        </View>
    );
}

export function FloatingButton({
    onPress,
    label,
    icon = 'plus',
}) {
    return (
        <Pressable
            style={s.fab}
            onPress={onPress}
        >
            <FontAwesome5
                name={icon}
                size={15}
                color="#fff"
            />

            {label && (
                <Text style={s.fabText}>
                    {label}
                </Text>
            )}
        </Pressable>
    );
}

export function EmptyState({
    icon = 'folder-open',
    text,
}) {
    return (
        <View style={s.empty}>
            <FontAwesome5
                name={icon}
                size={34}
                color="#BAC2D1"
            />

            <Text style={s.emptyText}>
                {text}
            </Text>
        </View>
    );
}

const s = StyleSheet.create({
    button: {
        height: 52,
        borderRadius: 14,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 20,
    },

    buttonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },

    light: {
        backgroundColor: colors.lavender,
    },

    lightText: {
        color: colors.primary,
    },

    disabled: {
        opacity: 0.65,
    },

    search: {
        height: 48,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        gap: 11,
    },

    searchInput: {
        flex: 1,
        color: colors.text,
        fontSize: 14,
    },

    stat: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 15,
        borderWidth: 1,
        borderColor: colors.border,
    },

    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 11,
    },

    statValue: {
        fontSize: 21,
        fontWeight: '800',
        color: colors.text,
    },

    statLabel: {
        fontSize: 12,
        color: colors.muted,
        marginTop: 3,
    },

    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: colors.primary,
        borderRadius: 28,
        height: 54,
        paddingHorizontal: 19,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
        elevation: 5,
        shadowColor: '#27379C',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 4,
        },
    },

    fabText: {
        color: '#fff',
        fontWeight: '700',
    },

    empty: {
        alignItems: 'center',
        paddingVertical: 52,
        gap: 13,
    },

    emptyText: {
        color: colors.muted,
        fontSize: 14,
    },
});