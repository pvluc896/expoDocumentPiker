import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import { FontAwesome5 } from '@expo/vector-icons';

import { useApp } from '../../context/AppContext';
import { Page } from '../Shared';
import { PrimaryButton } from '../../components/UI';

import {
  filePresentation,
  formatBytes,
  getFileType,
} from '../../utils/fileUtils';

import { uploadDocumentFile } from '../../utils/supabase';
import { colors } from '../../utils/theme';

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/vnd.rar',
];

const ACCEPTED_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'txt',
  'zip',
  'rar',
];

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_UPLOAD_FILES = 5;

const isAcceptedFile = (name = '') => {
  const extension = name
    .split('.')
    .pop()
    ?.toLowerCase();

  return ACCEPTED_EXTENSIONS.includes(extension);
};

export default function UploadDocumentScreen({
  groupId,
  back,
}) {
  const {
    groups,
    addDocument,
  } = useApp();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [confirmingClear, setConfirmingClear] = useState(false);

  const group = groups.find(
    (item) => item.id === groupId
  );

  const select = async () => {
    if (files.length >= MAX_UPLOAD_FILES) {
      return setNotice({
        type: 'error',
        text: `Chỉ được chọn tối đa ${MAX_UPLOAD_FILES} tài liệu cho mỗi lần upload.`,
      });
    }

    try {
      const result =
        await DocumentPicker.getDocumentAsync({
          type: ACCEPTED_FILE_TYPES,
          copyToCacheDirectory: true,
          multiple: true,
          base64: false,
        });

      if (result.canceled) {
        return;
      }

      const selectedFiles = result.assets || [];
      const validFiles = selectedFiles.filter(
        (selectedFile) =>
          selectedFile?.name &&
          isAcceptedFile(selectedFile.name) &&
          (
            typeof selectedFile.size !== 'number' ||
            selectedFile.size <= MAX_FILE_SIZE
          )
      );

      if (!validFiles.length) {
        return setNotice({
          type: 'error',
          text: `Đã bỏ qua ${selectedFiles.length} file không đúng định dạng hoặc vượt quá 100 MB.`,
        });
      }

      const currentUris = new Set(files.map((file) => file.uri));
      const newFiles = validFiles.filter(
        (selectedFile) => !currentUris.has(selectedFile.uri)
      );
      const availableSlots = MAX_UPLOAD_FILES - files.length;
      const filesToAdd = newFiles.slice(0, availableSlots);
      const invalidCount = selectedFiles.length - validFiles.length;
      const duplicateCount = validFiles.length - newFiles.length;
      const limitCount = newFiles.length - filesToAdd.length;
      const skippedReasons = [
        invalidCount > 0 && `${invalidCount} file không đúng định dạng hoặc vượt quá 100 MB`,
        duplicateCount > 0 && `${duplicateCount} file đã có trong danh sách`,
        limitCount > 0 && `${limitCount} file vượt giới hạn ${MAX_UPLOAD_FILES} file`,
      ].filter(Boolean);

      if (!filesToAdd.length) {
        return setNotice({
          type: 'error',
          text: `Đã bỏ qua ${skippedReasons.join(', ')}.`,
        });
      }

      // Giữ những file đã chọn trước đó để người dùng có thể chọn thêm
      // thay vì phải chọn lại toàn bộ danh sách.
      setFiles((currentFiles) => [
        ...currentFiles,
        ...filesToAdd,
      ]);

      setNotice(
        skippedReasons.length
          ? {
            type: 'error',
            text: `Đã bỏ qua ${skippedReasons.join(', ')}.`,
          }
          : null
      );
    } catch {
      setNotice({
        type: 'error',
        text: 'Không thể chọn tài liệu. Vui lòng thử lại.',
      });
    }
  };

  const removeFile = (uri) => {
    setFiles((currentFiles) =>
      currentFiles.filter((file) => file.uri !== uri)
    );
    setNotice(null);
  };

  const clearFiles = () => {
    setConfirmingClear(true);
  };

  const confirmClearFiles = () => {
    setFiles([]);
    setNotice(null);
    setConfirmingClear(false);
  };

  const upload = async () => {
    if (!files.length) {
      return setNotice({
        type: 'error',
        text: 'Hãy chọn ít nhất một file trước khi upload.',
      });
    }

    setLoading(true);

    const results = [];

    for (const file of files) {
      try {
        const publicUrl = await uploadDocumentFile(file);
        const saved = await addDocument({
          name: file.name,
          uri: publicUrl,
          size: file.size,
          type: getFileType(file.name, file.mimeType),
          mimeType: file.mimeType,
          groupId,
        });

        if (!saved.ok) {
          throw new Error(saved.error || 'Không thể lưu thông tin tài liệu.');
        }

        results.push({ ok: true, saved, file });
      } catch (error) {
        results.push({
          ok: false,
          file,
          error: error?.message || 'Không thể upload file.',
        });
      }
    }

    setLoading(false);

    const successfulResults = results.filter((result) => result.ok);
    const failedResults = results.filter((result) => !result.ok);

    if (!successfulResults.length) {
      return setNotice({
        type: 'error',
        text: failedResults.map((result) => result.file.name).join(', ') + ' không thể upload.',
      });
    }

    const renamedCount = successfulResults.filter(
      (result) => result.saved.renamed
    ).length;
    const failureText = failedResults.length
      ? ` ${failedResults.length} file không thể upload.`
      : '';
    const renamedText = renamedCount
      ? ` ${renamedCount} file đã được đổi tên do trùng.`
      : '';

    setNotice({
      type: 'success',
      text: `Đã upload ${successfulResults.length}/${files.length} file.${renamedText}${failureText}`,
    });
  };

  const uploaded =
    notice?.type === 'success';

  return (
    <Page
      title="Thêm tài liệu"
      back={back}
    >
      <View style={s.page}>
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
            PDF, Word, PowerPoint, Excel,
            TXT, ZIP hoặc RAR · Tối đa 5 file, 100 MB/file
          </Text>
        </Pressable>

        {files.length > 0 && !uploaded && (
          <View style={s.selectedHeader}>
            <Text style={s.selectedCount}>
              Đã chọn {files.length}/{MAX_UPLOAD_FILES} tài liệu
            </Text>

            <Pressable
              onPress={clearFiles}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Xóa tất cả tài liệu đã chọn"
            >
              <Text style={s.clearAllText}>
                Xóa tất cả
              </Text>
            </Pressable>
          </View>
        )}

        {files.map((file) => {
          const type = getFileType(file.name, file.mimeType);
          const presentation = filePresentation(type);

          return (
            <View key={file.uri} style={s.preview}>
              <View
                style={[
                  s.fileIcon,
                  { backgroundColor: presentation[1] + '18' },
                ]}
              >
                <FontAwesome5
                  name={presentation[0]}
                  color={presentation[1]}
                  size={28}
                />
              </View>

              <View style={s.fileInfo}>
                <Text style={s.fileName} numberOfLines={2}>
                  {file.name}
                </Text>

                <Text style={s.fileMeta}>
                  {type}
                  {' · '}
                  {formatBytes(file.size)}
                </Text>
              </View>

              {!uploaded && (
                <Pressable
                  style={s.removeFileButton}
                  onPress={() => removeFile(file.uri)}
                  disabled={loading}
                  accessibilityRole="button"
                  accessibilityLabel={`Xóa ${file.name} khỏi danh sách upload`}
                >
                  <FontAwesome5
                    name="times"
                    color={colors.danger}
                    size={15}
                  />
                </Pressable>
              )}
            </View>
          );
        })}

        {notice && (
          <View
            style={[
              s.notice,
              uploaded
                ? s.success
                : s.error,
            ]}
          >
            <FontAwesome5
              name={
                uploaded
                  ? 'check-circle'
                  : 'exclamation-circle'
              }
              size={16}
              color={
                uploaded
                  ? '#047857'
                  : '#B91C1C'
              }
            />

            <Text
              style={[
                s.noticeText,
                uploaded
                  ? s.successText
                  : s.errorText,
              ]}
            >
              {notice.text}
            </Text>
          </View>
        )}

        {files.length > 0 && !uploaded && (
          <PrimaryButton
            title="Thêm tài liệu"
            variant="light"
            icon="plus"
            onPress={select}
            style={s.selectAgain}
          />
        )}

        <PrimaryButton
          title={
            uploaded
              ? 'Xong'
              : files.length
                ? `Upload ${files.length} tài liệu`
                : 'Upload tài liệu'
          }
          icon={
            uploaded
              ? 'check'
              : 'cloud-upload-alt'
          }
          loading={loading}
          onPress={
            uploaded
              ? back
              : upload
          }
          style={s.uploadButton}
        />
      </ScrollView>

        {confirmingClear && (
          <View style={s.modalOverlay}>
            <View style={s.confirmCard}>
              <View style={s.warningIcon}>
                <FontAwesome5
                  name="trash-alt"
                  size={20}
                  color={colors.danger}
                />
              </View>

              <Text style={s.confirmTitle}>
                Xóa tất cả tài liệu?
              </Text>

              <Text style={s.confirmText}>
                Bạn có muốn bỏ {files.length} tài liệu đã chọn không?
              </Text>

              <View style={s.confirmActions}>
                <Pressable
                  style={s.cancelButton}
                  onPress={() => setConfirmingClear(false)}
                >
                  <Text style={s.cancelText}>Hủy</Text>
                </Pressable>

                <Pressable
                  style={s.deleteButton}
                  onPress={confirmClearFiles}
                >
                  <Text style={s.deleteButtonText}>
                    Xóa tất cả
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

  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  selectedCount: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },

  clearAllText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
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

  fileInfo: {
    flex: 1,
  },

  removeFileButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
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

  notice: {
    marginTop: 16,
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  success: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },

  error: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },

  noticeText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },

  successText: {
    color: '#047857',
  },

  errorText: {
    color: '#B91C1C',
  },

  selectAgain: {
    marginTop: 14,
  },

  uploadButton: {
    marginTop: 12,
  },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  confirmCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
  },

  warningIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  confirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },

  confirmText: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },

  confirmActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    width: '100%',
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 11,
    backgroundColor: colors.lavender,
    alignItems: 'center',
  },

  cancelText: {
    color: colors.primary,
    fontWeight: '700',
  },

  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 11,
    backgroundColor: colors.danger,
    alignItems: 'center',
  },

  deleteButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
