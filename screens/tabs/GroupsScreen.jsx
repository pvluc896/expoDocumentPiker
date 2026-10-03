import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { EmptyState, FloatingButton, PrimaryButton, SearchBar } from '../../components/UI';
import GroupCard from '../../components/GroupCard';
import { colors } from '../../utils/theme';

export default function GroupsScreen({ openGroup, create, join, successNotice }) {
  const { groups, documents } = useApp();
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState(successNotice?.text || '');
  useEffect(() => {
    if (!successNotice?.text) return undefined;
    setNotice(successNotice.text);
    const timeout = setTimeout(() => setNotice(''), 2000);
    return () => clearTimeout(timeout);
  }, [successNotice?.id]);
  const list = groups.filter((group) => group.name.toLowerCase().includes(query.toLowerCase()));
  return <View style={s.page}><ScrollView contentContainerStyle={s.content}><Text style={s.title}>Nhóm của tôi</Text><Text style={s.sub}>Quản lý và cộng tác với các nhóm</Text>{notice ? <View style={s.notice}><FontAwesome5 name="check-circle" color="#047857" size={16} /><Text style={s.noticeText}>{notice}</Text></View> : null}<View style={s.search}><SearchBar value={query} onChangeText={setQuery} placeholder="Tìm kiếm nhóm..." /><PrimaryButton title="Tham gia" icon="sign-in-alt" variant="light" onPress={join} style={s.join} /></View><View style={s.count}><Text style={s.countText}>{list.length} nhóm</Text></View>{list.length ? list.map((group) => <GroupCard key={group.id} group={group} documentCount={documents.filter((document) => document.groupId === group.id).length} onPress={() => openGroup(group.id)} />) : <EmptyState text="Chưa có nhóm nào." />}</ScrollView><FloatingButton label="Tạo nhóm" onPress={create} /></View>;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg }, content: { padding: 20, paddingBottom: 94 }, title: { fontSize: 24, fontWeight: '800', color: colors.text }, sub: { fontSize: 13, color: colors.muted, marginTop: 5, marginBottom: 20 }, notice: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 13, borderRadius: 12, borderWidth: 1, borderColor: '#A7F3D0', backgroundColor: '#ECFDF5', marginBottom: 16 }, noticeText: { flex: 1, color: '#047857', fontSize: 13, fontWeight: '700' }, search: { flexDirection: 'row', gap: 9 }, join: { height: 48, paddingHorizontal: 12 }, count: { marginTop: 22, marginBottom: 10 }, countText: { color: colors.muted, fontWeight: '700', fontSize: 13 },
});
