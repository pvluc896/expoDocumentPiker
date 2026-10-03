import React, { useState } from 'react';
import {
    Alert,
    Linking,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { FontAwesome5 } from '@expo/vector-icons';

import { useApp } from '../../context/AppContext';
import { Page } from '../Shared';
import { PrimaryButton } from '../../components/UI';

import {
    filePresentation,
    formatBytes,
    getFileType,
} from '../../utils/fileUtils';

import { formatDate } from '../../utils/formatDate';
import { colors } from '../../utils/theme';


/* =========================
   UPLOAD DOCUMENT SCREEN
========================= */

export function UploadDocumentScreen({
    groupId,
    back,
}) {
    const {
        groups,
        addDocument,
    } = useApp();

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const group = groups.find(
        (item) => item.id === groupId
    );

    const select = async () => {
        try {
            const result =
                await DocumentPicker.getDocumentAsync({
                    type: '*/*',
                    copyToCacheDirectory: true,
                    multiple: false,
                });

            if (result.canceled) {
                return;
            }

            const asset = result.assets?.[0];

            if (!asset?.name) {
                return Alert.alert(
                    'File không hợp lệ',
                    'Không thể đọc file đã chọn.'
                );
            }

            setFile(asset);
        } catch {
            Alert.alert(
                'Không thể chọn tài liệu',
                'Vui lòng thử lại.'
            );
        }
    };

    const upload = () => {
        if (!file) {
            return Alert.alert(
                'Chưa chọn tài liệu',
                'Hãy chọn file trước khi upload.'
            );
        }

        setLoading(true);

        setTimeout(async () => {
            const result = await addDocument({
                name: file.name,
                uri: file.uri,
                size: file.size,
                type: getFileType(
                    file.name,
                    file.mimeType
                ),
                mimeType: file.mimeType,
                groupId,
            });

            setLoading(false);

            if (!result?.ok) {
                return Alert.alert(
                    'Upload thất bại',
                    result?.error ||
                    'Không thể thêm tài liệu.'
                );
            }

            Alert.alert(
                'Upload thành công',
                `${file.name} đã được thêm vào nhóm.`,
                [
                    {
                        text: 'Xong',
                        onPress: back,
                    },
                ]
            );
        }, 650);
    };

    const type =
        file &&
        getFileType(
            file.name,
            file.mimeType
        );

    const presentation =
        file &&
        filePresentation(type);

    return (
        <Page
            title="Thêm tài liệu"
            back={back}
        >
            <ScrollView>
                <Text style={s.for}>
                    Thêm vào nhóm{' '}
                    <Text style={s.group}>
                        {group?.name}
                    </Text>
                </Text>

                <Pressable
                    style={s.drop}
                    onPress={select}
                >
                    <View style={s.dropIcon}>
                        <FontAwesome5
                            name="folder-open"
                            color={colors.primary}
                            size={27}
                        />
                    </View>

                    <Text style={s.dropTitle}>
                        Chọn tài liệu
                    </Text>

                    <Text style={s.dropSub}>
                        PDF, Word, PowerPoint, Excel, TXT
                        và các file khác
                    </Text>
                </Pressable>

                {file && (
                    <View style={s.preview}>
                        <View
                            style={[
                                s.fileIcon,
                                {
                                    backgroundColor:
                                        presentation[1] + '18',
                                },
                            ]}
                        >
                            <FontAwesome5
                                name={presentation[0]}
                                color={presentation[1]}
                                size={28}
                            />
                        </View>

                        <View style={s.previewInfo}>
                            <Text
                                style={s.fileName}
                                numberOfLines={2}
                            >
                                {file.name}
                            </Text>

                            <Text style={s.fileMeta}>
                                {type}
                                {' · '}
                                {formatBytes(file.size)}
                            </Text>
                        </View>
                    </View>
                )}

                {file && (
                    <PrimaryButton
                        title="Chọn lại"
                        variant="light"
                        icon="redo"
                        onPress={select}
                        style={s.selectAgain}
                    />
                )}

                <PrimaryButton
                    title="Upload tài liệu"
                    icon="cloud-upload-alt"
                    loading={loading}
                    onPress={upload}
                    style={s.uploadButton}
                />
            </ScrollView>
        </Page>
    );
}


/* =========================
   DOCUMENT DETAIL SCREEN
========================= */

export function DocumentDetailScreen({
    id,
    back,
}) {
    const {
        documents,
        groups,
        currentUser,
        deleteDocument,
    } = useApp();

    const doc = documents.find(
        (item) => item.id === id
    );

    if (!doc) {
        return null;
    }

    const group = groups.find(
        (item) => item.id === doc.groupId
    );

    const [icon, color] =
        filePresentation(doc.type);

    const permitted =
        doc.uploaderId === currentUser.id ||
        group?.owner_id === currentUser.id;

    const share = async () => {
        try {
            if (
                doc.uri &&
                await Sharing.isAvailableAsync()
            ) {
                await Sharing.shareAsync(doc.uri);
            } else {
                await Share.share({
                    title: doc.name,
                    message:
                        `${doc.name}\n` +
                        `Nhóm: ${group?.name || 'GroupDocs'}\n` +
                        `Đăng bởi: ${doc.uploader}`,
                });
            }
        } catch {
            Alert.alert(
                'Không thể chia sẻ',
                'File có thể không còn tồn tại trên thiết bị.'
            );
        }
    };

    const open = async () => {
        if (!doc.uri) {
            return Alert.alert(
                'Không thể mở',
                'Tài liệu chưa có file vật lý.'
            );
        }

        try {
            await Linking.openURL(doc.uri);
        } catch {
            Alert.alert(
                'Không thể mở file',
                'Thiết bị chưa có ứng dụng hỗ trợ loại tài liệu này.'
            );
        }
    };

    const remove = () => {
        Alert.alert(
            'Xóa tài liệu?',
            `Bạn có chắc muốn xóa ${doc.name}?`,
            [
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteDocument(doc.id);
                        back();
                    },
                },
            ]
        );
    };

    const information = [
        ['Loại file', doc.type],
        ['Dung lượng', formatBytes(doc.size)],
        ['Người đăng', doc.uploader],
        ['Nhóm', group?.name || '—'],
        ['Ngày upload', formatDate(doc.date)],
    ];

    return (
        <Page
            title="Chi tiết tài liệu"
            back={back}
        >
            <ScrollView>
                <View style={s.detailHero}>
                    <View
                        style={[
                            s.bigIcon,
                            {
                                backgroundColor:
                                    color + '18',
                            },
                        ]}
                    >
                        <FontAwesome5
                            name={icon}
                            size={45}
                            color={color}
                        />
                    </View>

                    <Text style={s.detailName}>
                        {doc.name}
                    </Text>

                    <Text style={s.type}>
                        {doc.type}
                    </Text>
                </View>

                <View style={s.infoCard}>
                    {information.map(
                        ([label, value]) => (
                            <View
                                key={label}
                                style={s.infoRow}
                            >
                                <Text style={s.infoLabel}>
                                    {label}
                                </Text>

                                <Text style={s.infoValue}>
                                    {value}
                                </Text>
                            </View>
                        )
                    )}
                </View>

                <PrimaryButton
                    title="Xem / Mở tài liệu"
                    icon="external-link-alt"
                    onPress={open}
                />

                <PrimaryButton
                    title="Chia sẻ"
                    icon="share-alt"
                    variant="light"
                    onPress={share}
                    style={s.shareButton}
                />

                {permitted && (
                    <Pressable
                        onPress={remove}
                        style={s.delete}
                    >
                        <FontAwesome5
                            name="trash-alt"
                            size={14}
                            color={colors.danger}
                        />

                        <Text style={s.deleteText}>
                            Xóa tài liệu
                        </Text>
                    </Pressable>
                )}
            </ScrollView>
        </Page>
    );
}


/* =========================
   STYLES
========================= */

const s = StyleSheet.create({
    for: {
        color: colors.muted,
        fontSize: 13,
        marginTop: 13,
    },

    group: {
        fontWeight: '800',
        color: colors.primary,
    },

    drop: {
        height: 228,
        borderRadius: 20,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: '#AEB7FF',
        backgroundColor: '#F8F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: 19,
    },

    dropIcon: {
        width: 62,
        height: 62,
        borderRadius: 20,
        backgroundColor: colors.lavender,
        alignItems: 'center',
        justifyContent: 'center',
    },

    dropTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: colors.text,
        marginTop: 13,
    },

    dropSub: {
        fontSize: 12,
        color: colors.muted,
        textAlign: 'center',
        lineHeight: 18,
        marginTop: 6,
    },

    preview: {
        backgroundColor: '#fff',
        borderRadius: 17,
        padding: 15,
        borderWidth: 1,
        borderColor: colors.border,
        marginTop: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
    },

    previewInfo: {
        flex: 1,
    },

    fileIcon: {
        height: 55,
        width: 55,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },

    fileName: {
        fontSize: 15,
        fontWeight: '800',
        color: colors.text,
    },

    fileMeta: {
        fontSize: 12,
        color: colors.muted,
        marginTop: 5,
    },

    selectAgain: {
        marginTop: 14,
    },

    uploadButton: {
        marginTop: 12,
    },

    detailHero: {
        alignItems: 'center',
        paddingTop: 23,
        paddingBottom: 22,
    },

    bigIcon: {
        height: 100,
        width: 100,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },

    detailName: {
        fontWeight: '800',
        fontSize: 20,
        color: colors.text,
        marginTop: 14,
        textAlign: 'center',
    },

    type: {
        color: colors.muted,
        fontSize: 13,
        marginTop: 5,
    },

    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 16,
        marginBottom: 18,
    },

    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: '#F0F1F5',
    },

    infoLabel: {
        fontSize: 13,
        color: colors.muted,
    },

    infoValue: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.text,
        maxWidth: '55%',
        textAlign: 'right',
    },

    shareButton: {
        marginTop: 12,
    },

    delete: {
        marginTop: 24,
        flexDirection: 'row',
        alignSelf: 'center',
        gap: 8,
        alignItems: 'center',
        padding: 10,
    },

    deleteText: {
        color: colors.danger,
        fontSize: 14,
        fontWeight: '700',
    },
});