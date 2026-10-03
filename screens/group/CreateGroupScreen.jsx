import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useApp } from '../../context/AppContext';
import { Page } from '../Shared';
import { PrimaryButton } from '../../components/UI';
import { colors } from '../../utils/theme';

export default function CreateGroupScreen({ back, onCreated }) {
  const { addGroup } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const create = async () => {
    if (!name.trim()) {
      return setError('Vui lòng nhập tên nhóm.');
    }

    const result = await addGroup(
      name.trim(),
      description.trim()
    );

    if (!result.ok) {
      return setError(
        result.error || 'Không thể tạo nhóm.'
      );
    }

    onCreated(result.group.id);
  };

  return (
    <Page
      title="Tạo nhóm"
      back={back}
    >
      <View style={s.card}>
        <Text style={s.label}>
          Tên nhóm
        </Text>

        <TextInput
          value={name}
          onChangeText={(value) => {
            setName(value);
            setError('');
          }}
          placeholder="Ví dụ: Nhóm bài tập Mobile"
          style={s.input}
        />

        <Text style={s.label}>
          Mô tả
        </Text>

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Mô tả ngắn về nhóm"
          multiline
          style={[s.input, s.textarea]}
        />

        {error ? (
          <View style={s.error}>
            <Text style={s.errorText}>
              {error}
            </Text>
          </View>
        ) : null}

        <PrimaryButton
          title="Tạo nhóm"
          icon="plus"
          onPress={create}
          style={{ marginTop: 22 }}
        />
      </View>
    </Page>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 20,
    marginTop: 26,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 7,
    marginTop: 15,
    color: colors.text,
  },

  input: {
    height: 49,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 13,
    fontSize: 14,
    color: colors.text,
  },

  textarea: {
    height: 92,
    paddingTop: 12,
    textAlignVertical: 'top',
  },

  error: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },

  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
  },
});