import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { FontAwesome5 } from '@expo/vector-icons';
import { Page } from './Shared';
import { colors } from '../utils/theme';

export default function AboutScreen({ back }) {
    return (
        <Page
            title="Giới thiệu GroupDocs"
            back={back}
        >
            <ScrollView
                contentContainerStyle={s.content}
            >
                <View style={s.logo}>
                    <FontAwesome5
                        name="folder-open"
                        size={34}
                        color="#fff"
                    />
                </View>

                <Text style={s.appName}>
                    GroupDocs
                </Text>

                <Text style={s.slogan}>
                    Chia sẻ tài liệu - Làm việc nhóm dễ dàng
                </Text>

                <View style={s.card}>
                    <Text style={s.title}>
                        Về GroupDocs
                    </Text>

                    <Text style={s.text}>
                        GroupDocs là ứng dụng hỗ trợ người dùng
                        tạo nhóm, tham gia nhóm và chia sẻ tài
                        liệu phục vụ học tập và làm việc nhóm.
                    </Text>
                </View>

                <View style={s.card}>
                    <Text style={s.title}>
                        Chức năng chính
                    </Text>

                    <View style={s.feature}>
                        <FontAwesome5
                            name="users"
                            size={15}
                            color={colors.primary}
                        />
                        <Text style={s.featureText}>
                            Tạo và tham gia nhóm
                        </Text>
                    </View>

                    <View style={s.feature}>
                        <FontAwesome5
                            name="user-friends"
                            size={15}
                            color={colors.primary}
                        />
                        <Text style={s.featureText}>
                            Quản lý thành viên
                        </Text>
                    </View>

                    <View style={s.feature}>
                        <FontAwesome5
                            name="file-upload"
                            size={15}
                            color={colors.primary}
                        />
                        <Text style={s.featureText}>
                            Tải tài liệu từ thiết bị
                        </Text>
                    </View>

                    <View style={s.feature}>
                        <FontAwesome5
                            name="share-alt"
                            size={15}
                            color={colors.primary}
                        />
                        <Text style={s.featureText}>
                            Chia sẻ tài liệu giữa các nhóm
                        </Text>
                    </View>

                    <View style={s.feature}>
                        <FontAwesome5
                            name="search"
                            size={15}
                            color={colors.primary}
                        />
                        <Text style={s.featureText}>
                            Tìm kiếm và quản lý tài liệu
                        </Text>
                    </View>

                    <View style={s.feature}>
                        <FontAwesome5
                            name="user-shield"
                            size={15}
                            color={colors.primary}
                        />
                        <Text style={s.featureText}>
                            Phân quyền trưởng nhóm và thành viên
                        </Text>
                    </View>
                </View>

                <View style={s.card}>
                    <Text style={s.title}>
                        Công nghệ sử dụng
                    </Text>

                    <Text style={s.tech}>
                        React Native
                    </Text>

                    <Text style={s.tech}>
                        Expo
                    </Text>

                    <Text style={s.tech}>
                        Expo DocumentPicker
                    </Text>

                    <Text style={s.tech}>
                        Supabase
                    </Text>
                </View>

                <Text style={s.version}>
                    GroupDocs • Phiên bản 1.0.0
                </Text>
            </ScrollView>
        </Page>
    );
}

const s = StyleSheet.create({
    content: {
        padding: 20,
        paddingBottom: 50,
        alignItems: 'center',
    },

    logo: {
        width: 76,
        height: 76,
        borderRadius: 22,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
    },

    appName: {
        fontSize: 25,
        fontWeight: '800',
        color: colors.text,
        marginTop: 12,
    },

    slogan: {
        fontSize: 13,
        color: colors.muted,
        marginTop: 5,
        marginBottom: 22,
        textAlign: 'center',
    },

    card: {
        width: '100%',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 18,
        padding: 18,
        marginBottom: 14,
    },

    title: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 12,
    },

    text: {
        fontSize: 14,
        lineHeight: 22,
        color: colors.muted,
    },

    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 13,
    },

    featureText: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
    },

    tech: {
        fontSize: 14,
        color: colors.text,
        paddingVertical: 5,
    },

    version: {
        marginTop: 8,
        fontSize: 12,
        color: colors.muted,
    },
});