import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { Page } from '../Shared';
import { PrimaryButton } from '../../components/UI';
import { colors } from '../../utils/theme';

export default function JoinGroupScreen({ back, openGroup }) {
  const { joinGroup } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const join = async () => {
    if (!code.trim()) return setError('Vui lòng nhập mã nhóm gồm 6 ký tự.');
    const result = await joinGroup(code);
    if (!result.ok) return setError(result.error || 'Không tìm thấy nhóm với mã này.');
    openGroup(result.id);
  };
  return <Page title="Tham gia nhóm" back={back}><View style={s.card}><View style={s.icon}><FontAwesome5 name="users" size={25} color={colors.primary} /></View><Text style={s.title}>Tham gia một nhóm</Text><Text style={s.sub}>Nhập mã gồm 6 ký tự mà trưởng nhóm đã chia sẻ với bạn.</Text><TextInput value={code} onChangeText={(value) => { setCode(value.toUpperCase()); setError(''); }} placeholder="ABC123" maxLength={6} autoCapitalize="characters" style={s.input} />{error ? <Text style={s.error}>{error}</Text> : null}<PrimaryButton title="Tham gia nhóm" icon="sign-in-alt" onPress={join} /></View></Page>;
}
const s = StyleSheet.create({ card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 20, marginTop: 26 }, icon: { width: 55, height: 55, borderRadius: 18, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }, title: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center', marginTop: 14 }, sub: { fontSize: 13, lineHeight: 19, color: colors.muted, textAlign: 'center', marginTop: 8 }, input: { height: 56, marginVertical: 24, borderRadius: 14, borderWidth: 1, borderColor: colors.primary, textAlign: 'center', fontSize: 21, letterSpacing: 5, fontWeight: '800', color: colors.primary }, error: { color: colors.danger, fontSize: 13, textAlign: 'center', marginTop: -13, marginBottom: 14 } });
