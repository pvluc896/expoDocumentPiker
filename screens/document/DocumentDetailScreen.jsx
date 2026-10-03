import React, { useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import { FontAwesome5 } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { Page } from '../Shared';
import { PrimaryButton } from '../../components/UI';
import { filePresentation, formatBytes } from '../../utils/fileUtils';
import { formatDate } from '../../utils/formatDate';
import { colors } from '../../utils/theme';

export default function DocumentDetailScreen({ id, back }) {
  const {
    documents,
    groups,
    currentUser,
    deleteDocument,
    shareDocumentToGroup,
  } = useApp();

  const [notice, setNotice] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [choosingGroup, setChoosingGroup] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [sharingGroups, setSharingGroups] = useState(false);

  const document = documents.find((item) => item.id === id);

  if (!document) return null;

  const group = groups.find(
    (item) => item.id === document.groupId
  );

  const [icon, color] = filePresentation(document.type);

  const canDelete =
    document.uploaderId === currentUser.id ||
    group?.owner_id === currentUser.id;

  const openDocument = async () => {
    if (!document.uri) {
      setNotice(
        'Tài liệu chưa có file vật lý để mở.'
      );
      return;
    }

    if (Platform.OS === 'web') {
      if (document.uri.startsWith('http')) {
        const downloadLink =
          window.document.createElement('a');

        downloadLink.href = document.uri;
        downloadLink.download = document.name;
        downloadLink.target = '_blank';
        downloadLink.rel = 'noreferrer';

        window.document.body.appendChild(
          downloadLink
        );

        downloadLink.click();

        window.document.body.removeChild(
          downloadLink
        );

        setNotice(
          `Đang tải ${document.name}. Hãy mở file trong thư mục Tải xuống bằng ứng dụng phù hợp.`
        );

        return;
      }

      const isBrowserFile =
        typeof window !== 'undefined' &&
        typeof window.Blob !== 'undefined' &&
        document.webFile instanceof window.Blob;

      if (isBrowserFile) {
        const downloadUri =
          window.URL.createObjectURL(
            document.webFile
          );

        const downloadLink =
          window.document.createElement('a');

        downloadLink.href = downloadUri;
        downloadLink.download = document.name;
        downloadLink.style.display = 'none';

        window.document.body.appendChild(
          downloadLink
        );

        downloadLink.click();

        window.document.body.removeChild(
          downloadLink
        );

        setTimeout(() => {
          window.URL.revokeObjectURL(
            downloadUri
          );
        }, 60000);

        setNotice(
          `Đã tải ${document.name}. Hãy mở file trong thư mục Tải xuống bằng ứng dụng phù hợp.`
        );

        return;
      }

      setNotice(
        'File này được upload từ phiên trước nên không còn dữ liệu để tải. Hãy chọn và upload lại file.'
      );

      return;
    }

    try {
      await Linking.openURL(document.uri);
    } catch {
      setNotice(
        'Thiết bị chưa có ứng dụng hỗ trợ loại tài liệu này.'
      );
    }
  };

  const shareDocument = async () => {
    const shareText =
      `${document.name}\n` +
      `Nhóm: ${group?.name || 'GroupDocs'}\n` +
      `Đăng bởi: ${document.uploader}` +
      (
        document.uri?.startsWith('http')
          ? `\n${document.uri}`
          : ''
      );

    if (
      Platform.OS === 'web' &&
      typeof window !== 'undefined'
    ) {
      try {
        const shareData = {
          title: document.name,
          text: shareText,
        };

        const canShareFile =
          document.webFile &&
          typeof window.File !== 'undefined' &&
          document.webFile instanceof window.File &&
          window.navigator.canShare?.({
            files: [document.webFile],
          });

        if (canShareFile) {
          shareData.files = [
            document.webFile,
          ];
        }

        if (window.navigator.share) {
          await window.navigator.share(
            shareData
          );
          return;
        }

        await window.navigator.clipboard?.writeText(
          shareText
        );

        setNotice(
          'Trình duyệt không có Share Sheet. Đã sao chép thông tin tài liệu để bạn gửi.'
        );
      } catch (error) {
        if (error?.name !== 'AbortError') {
          setNotice(
            'Không thể chia sẻ. Vui lòng thử lại.'
          );
        }
      }

      return;
    }

    try {
      if (
        document.uri &&
        !document.uri.startsWith('http') &&
        await Sharing.isAvailableAsync()
      ) {
        await Sharing.shareAsync(
          document.uri
        );
      } else {
        await Share.share({
          title: document.name,
          message: shareText,
        });
      }
    } catch {
      setNotice(
        'Không thể chia sẻ. File có thể không còn tồn tại trên thiết bị.'
      );
    }
  };

  const confirmDelete = () => {
    setConfirmingDelete(true);
  };

  const deleteSelectedDocument = async () => {
    const result = await deleteDocument(
      document.id
    );

    if (result?.ok) {
      back();
    } else {
      setConfirmingDelete(false);

      setNotice(
        result?.error ||
        'Không thể xóa tài liệu.'
      );
    }
  };

  const targetGroups = groups.filter(
    (item) =>
      item.id !== document.groupId
  );

  const toggleTargetGroup = (
    targetGroupId
  ) => {
    setSelectedGroupIds((ids) =>
      ids.includes(targetGroupId)
        ? ids.filter(
          (id) =>
            id !== targetGroupId
        )
        : [
          ...ids,
          targetGroupId,
        ]
    );
  };

  const shareIntoSelectedGroups = async () => {
    const selectedGroups =
      targetGroups.filter(
        (targetGroup) =>
          selectedGroupIds.includes(
            targetGroup.id
          )
      );

    if (!selectedGroups.length) {
      setNotice(
        'Vui lòng chọn ít nhất một nhóm.'
      );
      return;
    }

    setSharingGroups(true);

    try {
      const results = await Promise.all(
        selectedGroups.map(
          async (targetGroup) => {
            const result =
              await shareDocumentToGroup(
                document,
                targetGroup.id
              );

            return {
              ...result,
              groupName:
                targetGroup.name,
            };
          }
        )
      );

      setChoosingGroup(false);
      setSelectedGroupIds([]);

      const successfulResults =
        results.filter(
          (result) => result.ok
        );

      const failedResults =
        results.filter(
          (result) => !result.ok
        );

      if (
        successfulResults.length > 0 &&
        failedResults.length === 0
      ) {
        const renamedResults =
          successfulResults.filter(
            (result) =>
              result.renamed
          );

        if (
          renamedResults.length > 0
        ) {
          if (
            successfulResults.length === 1
          ) {
            const result =
              successfulResults[0];

            setNotice(
              result.renamed
                ? `File đã tồn tại trong nhóm. Đã lưu với tên ${result.finalName}.`
                : `Đã chia sẻ ${document.name} vào nhóm ${result.groupName}.`
            );
          } else {
            const renamedText =
              renamedResults
                .map(
                  (result) =>
                    `${result.groupName}: ${result.finalName}`
                )
                .join(', ');

            setNotice(
              `Đã chia sẻ vào ${successfulResults.length} nhóm. File trùng tên được đổi thành: ${renamedText}.`
            );
          }
        } else {
          if (
            successfulResults.length === 1
          ) {
            setNotice(
              `Đã chia sẻ ${document.name} vào nhóm ${successfulResults[0].groupName}.`
            );
          } else {
            setNotice(
              `Đã chia sẻ ${document.name} vào ${successfulResults.length} nhóm.`
            );
          }
        }

        return;
      }

      if (
        successfulResults.length > 0 &&
        failedResults.length > 0
      ) {
        const failedText =
          failedResults
            .map(
              (result) =>
                `${result.groupName}: ${result.error ||
                'Không thể chia sẻ'
                }`
            )
            .join(' | ');

        setNotice(
          `Đã chia sẻ vào ${successfulResults.length} nhóm. Không thể chia sẻ vào ${failedResults.length} nhóm: ${failedText}`
        );

        return;
      }

      if (
        failedResults.length > 0
      ) {
        const errorText =
          failedResults
            .map(
              (result) =>
                `${result.groupName}: ${result.error ||
                'Không thể chia sẻ'
                }`
            )
            .join(' | ');

        setNotice(errorText);
      }
    } catch (error) {
      console.log(
        'LỖI CHIA SẺ VÀO NHÓM:',
        error
      );

      setNotice(
        error?.message ||
        'Không thể chia sẻ tài liệu.'
      );
    } finally {
      setSharingGroups(false);
    }
  };

  const rows = [
    [
      'Loại file',
      document.type,
    ],
    [
      'Dung lượng',
      formatBytes(document.size),
    ],
    [
      'Người đăng',
      document.uploader,
    ],

    ...(
      document.sharedBy &&
        document.sharedBy !==
        document.uploader
        ? [
          [
            'Chia sẻ bởi',
            document.sharedBy,
          ],
        ]
        : []
    ),

    [
      'Nhóm',
      group?.name || '—',
    ],
    [
      'Ngày upload',
      formatDate(document.date),
    ],
  ];

  return (
    <Page
      title="Chi tiết tài liệu"
      back={back}
    >
      <View style={s.page}>
        <ScrollView
          contentContainerStyle={
            s.scrollContent
          }
        >
          <View style={s.hero}>
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

            <Text style={s.name}>
              {document.name}
            </Text>

            <Text style={s.type}>
              {document.type}
            </Text>
          </View>

          <View style={s.infoCard}>
            {rows.map(
              ([label, value]) => (
                <View
                  key={label}
                  style={s.infoRow}
                >
                  <Text
                    style={s.infoLabel}
                  >
                    {label}
                  </Text>

                  <Text
                    style={s.infoValue}
                  >
                    {value}
                  </Text>
                </View>
              )
            )}
          </View>

          {notice ? (
            <View style={s.notice}>
              <FontAwesome5
                name="info-circle"
                color="#1D4ED8"
                size={15}
              />

              <Text
                style={s.noticeText}
              >
                {notice}
              </Text>
            </View>
          ) : null}

          <PrimaryButton
            title="Xem / Mở tài liệu"
            icon="external-link-alt"
            onPress={openDocument}
          />

          <PrimaryButton
            title="Chia sẻ"
            icon="share-alt"
            variant="light"
            onPress={shareDocument}
            style={{
              marginTop: 12,
            }}
          />

          <PrimaryButton
            title="Chia sẻ vào nhóm"
            icon="users"
            variant="light"
            onPress={() => {
              if (
                !targetGroups.length
              ) {
                setNotice(
                  'Bạn cần tham gia hoặc tạo thêm nhóm để chia sẻ tài liệu.'
                );
                return;
              }

              setSelectedGroupIds(
                []
              );

              setChoosingGroup(
                true
              );
            }}
            style={{
              marginTop: 12,
            }}
          />

          {canDelete && (
            <Pressable
              onPress={confirmDelete}
              style={s.delete}
            >
              <FontAwesome5
                name="trash-alt"
                size={14}
                color={
                  colors.danger
                }
              />

              <Text
                style={
                  s.deleteText
                }
              >
                Xóa tài liệu
              </Text>
            </Pressable>
          )}
        </ScrollView>

        {confirmingDelete && (
          <View
            style={s.modalOverlay}
          >
            <View
              style={s.confirmCard}
            >
              <Text
                style={s.confirmTitle}
              >
                Xóa tài liệu?
              </Text>

              <Text
                style={s.confirmText}
              >
                Bạn có chắc muốn xóa{' '}
                {document.name}?
              </Text>

              <View
                style={
                  s.confirmActions
                }
              >
                <Pressable
                  onPress={() =>
                    setConfirmingDelete(
                      false
                    )
                  }
                  style={
                    s.cancelButton
                  }
                >
                  <Text
                    style={
                      s.cancelText
                    }
                  >
                    Hủy
                  </Text>
                </Pressable>

                <Pressable
                  onPress={
                    deleteSelectedDocument
                  }
                  style={
                    s.confirmDeleteButton
                  }
                >
                  <Text
                    style={
                      s.confirmDeleteText
                    }
                  >
                    Xóa
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {choosingGroup && (
          <View
            style={s.modalOverlay}
          >
            <View
              style={s.confirmCard}
            >
              <Text
                style={s.confirmTitle}
              >
                Chia sẻ vào nhóm
              </Text>

              <Text
                style={s.confirmText}
              >
                Chọn một hoặc nhiều
                nhóm muốn nhận tài
                liệu này.
              </Text>

              <View
                style={s.groupChoices}
              >
                {targetGroups.map(
                  (targetGroup) => {
                    const selected =
                      selectedGroupIds.includes(
                        targetGroup.id
                      );

                    return (
                      <Pressable
                        key={
                          targetGroup.id
                        }
                        onPress={() =>
                          toggleTargetGroup(
                            targetGroup.id
                          )
                        }
                        disabled={
                          sharingGroups
                        }
                        style={[
                          s.groupChoice,
                          selected &&
                          s.groupChoiceSelected,
                        ]}
                      >
                        <View
                          style={[
                            s.choiceIcon,
                            {
                              backgroundColor:
                                targetGroup.color,
                            },
                          ]}
                        >
                          <FontAwesome5
                            name="users"
                            color="#fff"
                            size={13}
                          />
                        </View>

                        <Text
                          style={
                            s.groupChoiceText
                          }
                        >
                          {
                            targetGroup.name
                          }
                        </Text>

                        <FontAwesome5
                          name={
                            selected
                              ? 'check-circle'
                              : 'circle'
                          }
                          color={
                            selected
                              ? colors.primary
                              : colors.muted
                          }
                          size={17}
                        />
                      </Pressable>
                    );
                  }
                )}
              </View>

              <View
                style={
                  s.groupShareActions
                }
              >
                <Pressable
                  onPress={() => {
                    if (
                      sharingGroups
                    ) {
                      return;
                    }

                    setChoosingGroup(
                      false
                    );

                    setSelectedGroupIds(
                      []
                    );
                  }}
                  style={
                    s.closeModalButton
                  }
                  disabled={
                    sharingGroups
                  }
                >
                  <Text
                    style={
                      s.cancelText
                    }
                  >
                    Hủy
                  </Text>
                </Pressable>

                <Pressable
                  disabled={
                    !selectedGroupIds.length ||
                    sharingGroups
                  }
                  onPress={
                    shareIntoSelectedGroups
                  }
                  style={[
                    s.shareGroupsButton,
                    (
                      !selectedGroupIds.length ||
                      sharingGroups
                    ) &&
                    s.shareGroupsButtonDisabled,
                  ]}
                >
                  <Text
                    style={
                      s.shareGroupsText
                    }
                  >
                    {sharingGroups
                      ? 'Đang chia sẻ...'
                      : `Chia sẻ (${selectedGroupIds.length})`}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </Page>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 28,
  },

  hero: {
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

  name: {
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
    justifyContent:
      'space-between',
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

  notice: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 9,
    marginBottom: 12,
  },

  noticeText: {
    flex: 1,
    color: '#1D4ED8',
    fontSize: 12,
    lineHeight: 18,
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

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      'rgba(15, 23, 42, 0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  confirmCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },

  confirmTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },

  confirmText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },

  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 9,
    marginTop: 16,
  },

  cancelButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor:
      colors.lavender,
  },

  cancelText: {
    color: colors.primary,
    fontWeight: '700',
  },

  confirmDeleteButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor:
      colors.danger,
  },

  confirmDeleteText: {
    color: '#fff',
    fontWeight: '700',
  },

  groupChoices: {
    marginTop: 14,
    gap: 8,
  },

  groupChoice: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 11,
    borderRadius: 12,
    backgroundColor: '#F8F9FF',
    borderWidth: 1,
    borderColor: colors.border,
  },

  groupChoiceSelected: {
    backgroundColor:
      colors.lavender,
    borderColor: colors.primary,
  },

  choiceIcon: {
    height: 29,
    width: 29,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  groupChoiceText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },

  groupShareActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },

  closeModalButton: {
    padding: 12,
  },

  shareGroupsButton: {
    backgroundColor:
      colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  shareGroupsButtonDisabled: {
    opacity: 0.45,
  },

  shareGroupsText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});