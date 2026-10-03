import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/UI';
import GroupCard from '../../components/GroupCard';
import DocumentCard from '../../components/DocumentCard';
import { colors } from '../../utils/theme';

function QuickAction({ icon, label, color, onPress }) {
  return <Pressable style={s.quickAction} onPress={onPress}>
    <View style={[s.quickIcon, { backgroundColor: color + '18' }]}><FontAwesome5 name={icon} size={17} color={color} /></View>
    <Text style={s.quickLabel}>{label}</Text>
  </Pressable>;
}

export default function HomeScreen({ openGroup, openDocument, goDocuments }) {
  const { user, groups, documents, currentUser } = useApp();
  const navigation = useNavigation();
  const displayName = user?.name || currentUser.name.split(' ').slice(-1);

  return <ScrollView style={s.page} contentContainerStyle={s.content}>
    <View style={s.head}>
      <View><Text style={s.hi}>Xin chào, {displayName} 👋</Text><Text style={s.sub}>Chúc bạn một ngày làm việc hiệu quả</Text></View>
      <View style={s.avatar}><Text style={s.avatarText}>{currentUser.initials || 'GD'}</Text></View>
    </View>

    <View style={s.quickPanel}>
      <View><Text style={s.quickTitle}>Thao tác nhanh</Text><Text style={s.quickSub}>Bắt đầu cộng tác cùng nhóm</Text></View>
      <View style={s.quickList}>
        <QuickAction icon="plus" label="Tạo nhóm" color={colors.primary} onPress={() => navigation.navigate('CreateGroup')} />
        <QuickAction icon="sign-in-alt" label="Tham gia" color="#16A34A" onPress={() => navigation.navigate('JoinGroup')} />
        <QuickAction icon="folder-open" label="Tài liệu" color="#D97706" onPress={goDocuments} />
      </View>
    </View>

    <View style={s.stats}>
      <Pressable style={s.statButton} onPress={() => navigation.navigate('Groups')} accessibilityRole="button">
        <StatCard icon="users" value={groups.length} label="Nhóm tham gia" />
      </Pressable>
      <Pressable style={s.statButton} onPress={goDocuments} accessibilityRole="button">
        <StatCard icon="file-alt" value={documents.length} label="Tài liệu có thể xem" color="#24A876" />
      </Pressable>
    </View>

    <View style={s.sectionHead}><Text style={s.section}>Nhóm gần đây</Text><Pressable onPress={() => navigation.navigate('Groups')}><Text style={s.all}>Xem tất cả</Text></Pressable></View>
    {groups.slice(0, 3).map((group) => <GroupCard key={group.id} group={group} documentCount={documents.filter((document) => document.groupId === group.id).length} onPress={() => openGroup(group.id)} />)}

    <View style={s.sectionHead}><Text style={s.section}>Tài liệu gần đây</Text><Pressable onPress={goDocuments}><Text style={s.all}>Xem tất cả</Text></Pressable></View>
    {documents.slice(0, 4).map((document) => <DocumentCard key={document.id} document={document} group={groups.find((group) => group.id === document.groupId)} onPress={() => openDocument(document.id)} />)}
  </ScrollView>;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg }, content: { padding: 20, paddingBottom: 100 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 21 }, hi: { fontSize: 20, fontWeight: '800', color: colors.text }, sub: { fontSize: 12, color: colors.muted, marginTop: 4 },
  avatar: { height: 43, width: 43, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#fff', fontWeight: '800' },
  quickPanel: { borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, padding: 15 }, quickTitle: { fontSize: 15, fontWeight: '800', color: colors.text }, quickSub: { fontSize: 12, color: colors.muted, marginTop: 3 },
  quickList: { flexDirection: 'row', gap: 9, marginTop: 14 }, quickAction: { flex: 1, alignItems: 'center', borderRadius: 13, backgroundColor: '#F8F9FF', paddingVertical: 10 }, quickIcon: { height: 33, width: 33, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, quickLabel: { fontSize: 11, color: colors.text, fontWeight: '700', marginTop: 6 },
  stats: { flexDirection: 'row', gap: 12, marginTop: 17 }, statButton: { flex: 1 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 26, marginBottom: 11 }, section: { fontSize: 17, fontWeight: '800', color: colors.text }, all: { fontSize: 13, fontWeight: '700', color: colors.primary },
});
