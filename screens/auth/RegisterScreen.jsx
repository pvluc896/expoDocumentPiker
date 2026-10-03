import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Page } from '../Shared';
import { PrimaryButton } from '../../components/UI';
import { colors } from '../../utils/theme';

export default function RegisterScreen({
  back,
  onRegister,
}) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });

  const [notice, setNotice] = useState(null);

  const update = (key) => (value) => {
    setForm({
      ...form,
      [key]: value,
    });

    setNotice(null);
  };

  const register = async () => {
    const hasEmptyField = Object.values(form).some(
      (value) => !value.trim()
    );

    if (hasEmptyField) {
      return setNotice({
        type: 'error',
        text: 'Vui lòng điền đầy đủ các trường.',
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      return setNotice({
        type: 'error',
        text: 'Vui lòng kiểm tra lại email.',
      });
    }

    if (form.password.length < 6) {
      return setNotice({
        type: 'error',
        text: 'Mật khẩu cần ít nhất 6 ký tự.',
      });
    }

    if (form.password !== form.confirm) {
      return setNotice({
        type: 'error',
        text: 'Xác nhận mật khẩu chưa đúng.',
      });
    }

    const result = await onRegister(form);

    if (result.ok) {
      setNotice({
        type: 'success',
        text: 'Đăng ký thành công. Bạn có thể đăng nhập ngay bây giờ.',
      });
    } else {
      setNotice({
        type: 'error',
        text: result.error,
      });
    }
  };

  return (
    <Page
      title="Đăng ký"
      back={back}
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <View style={s.card}>
          <Text style={s.heading}>
            Tạo tài khoản mới
          </Text>

          <Text style={s.sub}>
            Bắt đầu chia sẻ tài liệu cùng nhóm
          </Text>

          <View>
            <Text style={s.label}>
              Họ và tên
            </Text>

            <TextInput
              style={s.input}
              value={form.name}
              onChangeText={update('name')}
              placeholder="Nhập họ và tên"
            />
          </View>

          <View>
            <Text style={s.label}>
              Email
            </Text>

            <TextInput
              style={s.input}
              value={form.email}
              onChangeText={update('email')}
              placeholder="email@gmail.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View>
            <Text style={s.label}>
              Mật khẩu
            </Text>

            <TextInput
              style={s.input}
              value={form.password}
              onChangeText={update('password')}
              placeholder="Nhập mật khẩu"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text style={s.label}>
              Xác nhận mật khẩu
            </Text>

            <TextInput
              style={s.input}
              value={form.confirm}
              onChangeText={update('confirm')}
              placeholder="Nhập lại mật khẩu"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {notice && (
            <View
              style={[
                s.notice,
                notice.type === 'success'
                  ? s.success
                  : s.error,
              ]}
            >
              <Text
                style={[
                  s.noticeText,
                  notice.type === 'success'
                    ? s.successText
                    : s.errorText,
                ]}
              >
                {notice.text}
              </Text>
            </View>
          )}

          <PrimaryButton
            title={
              notice?.type === 'success'
                ? 'Đăng nhập'
                : 'Tạo tài khoản'
            }
            onPress={
              notice?.type === 'success'
                ? back
                : register
            }
            style={{
              marginTop: 26,
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Page>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 28,
  },

  heading: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.text,
  },

  sub: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 5,
  },

  label: {
    fontWeight: '700',
    fontSize: 13,
    color: colors.text,
    marginTop: 18,
    marginBottom: 7,
  },

  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 13,
    fontSize: 14,
    color: colors.text,
  },

  notice: {
    marginTop: 18,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },

  error: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },

  success: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },

  noticeText: {
    fontSize: 13,
    fontWeight: '600',
  },

  errorText: {
    color: '#B91C1C',
  },

  successText: {
    color: '#047857',
  },
});