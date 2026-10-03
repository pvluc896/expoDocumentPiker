import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, Pressable } from 'react-native';
import { useApp } from '../../context/AppContext';
import DocCard from '../../components/DocumentCard';
import { EmptyState, SearchBar } from '../../components/UI';
import { colors } from '../../utils/theme';

const filters = ['Tất cả', 'PDF', 'Word', 'PowerPoint', 'Excel', 'Nén'];

export default function DocumentsScreen({ openDocument }) {
  const { documents, groups } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Tất cả');
  const normalizedQuery = query.toLowerCase();
  const documentsToShow = documents.filter((document) => (
    (filter === 'Tất cả' || document.type === filter)
    && document.name.toLowerCase().includes(normalizedQuery)
  ));

  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <Text style={s.title}>Tài liệu</Text>
      <Text style={s.sub}>Tất cả tệp bạn có quyền truy cập</Text>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Tìm kiếm tài liệu..." />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filters}>
        {filters.map((item) => (
          <Pressable key={item} style={[s.chip, filter === item && s.active]} onPress={() => setFilter(item)}>
            <Text style={[s.chipText, filter === item && s.activeText]}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {documentsToShow.length ? documentsToShow.map((document) => (
        <DocCard
          key={document.id}
          document={document}
          group={groups.find((group) => group.id === document.groupId)}
          onPress={() => openDocument(document.id)}
        />
      )) : <EmptyState icon="search" text="Không tìm thấy tài liệu." />}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  sub: { fontSize: 13, color: colors.muted, marginTop: 5, marginBottom: 20 },
  filters: { marginVertical: 17 },
  chip: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, marginRight: 8 },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  activeText: { color: '#fff' },
});
