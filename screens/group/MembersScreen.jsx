import React from 'react';
import { Alert, ScrollView } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Page } from '../Shared';
import MemberItem from '../../components/MemberItem';

export default function MembersScreen({ groupId, back }) {
  const { groups, currentUser, removeMember } = useApp();
  const group = groups.find((item) => item.id === groupId);
  if (!group) return null;
  const canManage = group.role === 'Trưởng nhóm';
  const remove = (member) => Alert.alert('Xóa thành viên?', `Bạn có chắc muốn xóa ${member.name} khỏi nhóm?`, [
    { text: 'Hủy', style: 'cancel' },
    { text: 'Xóa', style: 'destructive', onPress: () => removeMember(groupId, member.id) },
  ]);
  return <Page title="Thành viên" back={back}><ScrollView>{group.members.map((member, index) => <MemberItem key={member.id} member={member} leader={index === 0} canRemove={canManage && member.id !== currentUser.id} onRemove={() => remove(member)} />)}</ScrollView></Page>;
}
