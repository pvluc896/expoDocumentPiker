import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { FontAwesome5 } from '@expo/vector-icons';

import { useApp } from '../../context/AppContext';
import { Page } from '../Shared';
import { EmptyState, FloatingButton } from '../../components/UI';
import DocumentCard from '../../components/DocumentCard';
import MemberItem from '../../components/MemberItem';
import { colors } from '../../utils/theme';

export default function GroupDetailScreen({
  id,
  back,
  upload,
  openDocument,
}) {
  const {
    groups,
    documents,
    currentUser,
    removeMember,
    deleteGroup,
  } = useApp();

  const [tab, setTab] = useState('docs');
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState(null);

  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removingMember, setRemovingMember] = useState(false);

  const group = groups.find((item) => item.id === id);

  if (!group) return null;

  const groupDocuments = documents.filter(
    (document) => document.groupId === id
  );

  const isLeader = group.owner_id === currentUser.id;

  const showNotice = (type, text) => {
    setNotice({ type, text });

    setTimeout(() => {
      setNotice(null);
    }, 2500);
  };

  const copyGroupCode = async () => {
    try {
      await Clipboard.setStringAsync(group.code);

      setCopied(true);
      setShowMenu(false);

      setTimeout(() => {
        setCopied(false);
      }, 2200);
    } catch {
      showNotice('error', 'Không thể sao chép mã nhóm.');
    }
  };
  const confirmRemoveMember = (member) => {
    setMemberToRemove(member);
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    setRemovingMember(true);

    const memberName = memberToRemove.name;
    const result = await removeMember(id, memberToRemove.id);

    setRemovingMember(false);

    if (result.ok) {
      setMemberToRemove(null);

      showNotice(
        'success',
        `Đã xóa ${memberName} khỏi nhóm ${group.name}.`
      );
    } else {
      setMemberToRemove(null);

      showNotice(
        'error',
        result.error || 'Không thể xóa thành viên.'
      );
    }
  };

  const handleDeleteGroup = async () => {
    setDeleting(true);

    const result = await deleteGroup(id);

    setDeleting(false);

    if (result.ok) {
      back();
    } else {
      setConfirmingDelete(false);

      showNotice(
        'error',
        result.error || 'Không thể xóa nhóm.'
      );
    }
  };

  return (
    <Page title="Chi tiết nhóm" back={back}>
      <View style={s.page}>
        <ScrollView contentContainerStyle={s.content}>
          <View style={s.groupHero}>
            {isLeader && (
              <>
                <Pressable
                  style={s.moreButton}
                  onPress={() => setShowMenu(!showMenu)}
                  accessibilityRole="button"
                  accessibilityLabel="Tùy chọn nhóm"
                >
                  <FontAwesome5
                    name="ellipsis-v"
                    size={20}
                    color={colors.text}
                  />
                </Pressable>

                {showMenu && (
                  <View style={s.menu}>
                    <Pressable
                      style={s.menuItem}
                      onPress={() => {
                        setShowMenu(false);
                        setConfirmingDelete(true);
                      }}
                    >
                      <FontAwesome5
                        name="trash-alt"
                        size={14}
                        color={colors.danger}
                      />

                      <Text style={s.deleteMenuText}>
                        Xóa nhóm
                      </Text>
                    </Pressable>
                  </View>
                )}
              </>
            )}

            <View
              style={[
                s.groupLogo,
                { backgroundColor: group.color },
              ]}
            >
              <FontAwesome5
                name="users"
                color="#fff"
                size={24}
              />
            </View>

            <Text style={s.groupName}>
              {group.name}
            </Text>

            <Text style={s.groupDesc}>
              {group.description}
            </Text>

            <Pressable
              onPress={copyGroupCode}
              style={s.codePill}
              accessibilityRole="button"
              accessibilityLabel="Sao chép mã nhóm"
            >
              <Text style={s.codeLabel}>
                Mã nhóm{' '}
              </Text>

              <Text style={s.codeText}>
                {group.code}
              </Text>

              <FontAwesome5
                name="copy"
                size={12}
                color={colors.primary}
              />
            </Pressable>

            {copied && (
              <View style={s.copyNotice}>
                <FontAwesome5
                  name="check-circle"
                  size={14}
                  color="#047857"
                />

                <Text style={s.copyNoticeText}>
                  Đã sao chép mã nhóm
                </Text>
              </View>
            )}
          </View>

          {notice && (
            <View
              style={[
                s.notice,
                notice.type === 'success'
                  ? s.noticeSuccess
                  : s.noticeError,
              ]}
            >
              <FontAwesome5
                name={
                  notice.type === 'success'
                    ? 'check-circle'
                    : 'exclamation-circle'
                }
                size={14}
                color={
                  notice.type === 'success'
                    ? '#047857'
                    : '#B91C1C'
                }
              />

              <Text
                style={[
                  s.noticeText,
                  {
                    color:
                      notice.type === 'success'
                        ? '#047857'
                        : '#B91C1C',
                  },
                ]}
              >
                {notice.text}
              </Text>
            </View>
          )}

          <View style={s.tabs}>
            <Pressable
              style={[
                s.tab,
                tab === 'docs' && s.tabActive,
              ]}
              onPress={() => {
                setTab('docs');
                setShowMenu(false);
              }}
            >
              <Text
                style={[
                  s.tabText,
                  tab === 'docs' && s.tabTextActive,
                ]}
              >
                Tài liệu ({groupDocuments.length})
              </Text>
            </Pressable>

            <Pressable
              style={[
                s.tab,
                tab === 'members' && s.tabActive,
              ]}
              onPress={() => {
                setTab('members');
                setShowMenu(false);
              }}
            >
              <Text
                style={[
                  s.tabText,
                  tab === 'members' && s.tabTextActive,
                ]}
              >
                Thành viên ({group.members.length})
              </Text>
            </Pressable>
          </View>

          {tab === 'docs' ? (
            groupDocuments.length ? (
              groupDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  group={group}
                  onPress={() =>
                    openDocument(document.id)
                  }
                />
              ))
            ) : (
              <EmptyState text="Nhóm chưa có tài liệu." />
            )
          ) : (
            <View style={s.members}>
              {group.members.map((member) => (
                <MemberItem
                  key={member.id}
                  member={member}
                  leader={member.id === group.owner_id}
                  canRemove={
                    isLeader &&
                    member.id !== currentUser.id
                  }
                  onRemove={() =>
                    confirmRemoveMember(member)
                  }
                />
              ))}
            </View>
          )}
        </ScrollView>

        {tab === 'docs' && (
          <FloatingButton
            label="Thêm tài liệu"
            onPress={() => upload(id)}
          />
        )}
        {memberToRemove && (
          <View style={s.modalOverlay}>
            <View style={s.confirmCard}>
              <View style={s.warningIcon}>
                <FontAwesome5
                  name="user-times"
                  size={20}
                  color={colors.danger}
                />
              </View>

              <Text style={s.confirmTitle}>
                Xóa thành viên?
              </Text>

              <Text style={s.confirmText}>
                Bạn có chắc chắn muốn xóa{' '}
                <Text style={{ fontWeight: '800', color: colors.text }}>
                  {memberToRemove.name}
                </Text>{' '}
                khỏi nhóm "{group.name}"?
              </Text>

              <View style={s.confirmActions}>
                <Pressable
                  style={s.cancelButton}
                  onPress={() => setMemberToRemove(null)}
                  disabled={removingMember}
                >
                  <Text style={s.cancelText}>
                    Hủy
                  </Text>
                </Pressable>

                <Pressable
                  style={s.deleteButton}
                  onPress={handleRemoveMember}
                  disabled={removingMember}
                >
                  <Text style={s.deleteButtonText}>
                    {removingMember
                      ? 'Đang xóa...'
                      : 'Xóa thành viên'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {confirmingDelete && (
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
                Xóa nhóm?
              </Text>

              <Text style={s.confirmText}>
                Bạn có chắc muốn xóa nhóm "{group.name}"?
                Tất cả tài liệu và thành viên trong nhóm
                sẽ bị xóa.
              </Text>

              <View style={s.confirmActions}>
                <Pressable
                  style={s.cancelButton}
                  onPress={() =>
                    setConfirmingDelete(false)
                  }
                  disabled={deleting}
                >
                  <Text style={s.cancelText}>
                    Hủy
                  </Text>
                </Pressable>

                <Pressable
                  style={s.deleteButton}
                  onPress={handleDeleteGroup}
                  disabled={deleting}
                >
                  <Text style={s.deleteButtonText}>
                    {deleting
                      ? 'Đang xóa...'
                      : 'Xóa nhóm'}
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

  content: {
    paddingBottom: 92,
  },

  groupHero: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
    zIndex: 20,
  },

  moreButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    zIndex: 30,
  },

  menu: {
    position: 'absolute',
    top: 54,
    right: 14,
    width: 150,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 5,
    zIndex: 100,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  deleteMenuText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },

  groupLogo: {
    height: 52,
    width: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  groupName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
  },

  groupDesc: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 5,
  },

  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.lavender,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 15,
  },

  codeLabel: {
    color: colors.muted,
    fontSize: 12,
  },

  codeText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },

  copyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 9,
  },

  copyNoticeText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '700',
  },

  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },

  noticeSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },

  noticeError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },

  noticeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },

  tabs: {
    flexDirection: 'row',
    marginVertical: 18,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 11,
  },

  tabActive: {
    borderBottomWidth: 2,
    borderColor: colors.primary,
  },

  tabText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },

  tabTextActive: {
    color: colors.primary,
  },

  members: {
    gap: 10,
  },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 999,
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