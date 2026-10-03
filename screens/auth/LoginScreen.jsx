import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';

import { FontAwesome5 } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/UI';
import { colors } from '../../utils/theme';

export default function LoginScreen({
  onLogin,
  onRegister,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const login = async () => {
    if (!email.trim() || !password) {
      return setError(
        'Vui lòng nhập email và mật khẩu.'
      );
    }

    const result = await onLogin(
      email,
      password
    );

    setError(
      result.ok
        ? ''
        : result.error
    );
  };

  return (
    <KeyboardAvoidingView
      style={s.page}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <View style={s.hero}>
        <View style={s.logo}>
          <FontAwesome5
            name="folder-open"
            color="#fff"
            size={30}
          />
        </View>

        <Text style={s.brand}>
          GroupDocs
        </Text>

        <Text style={s.slogan}>
          Chia sẻ tài liệu – Kết nối nhóm hiệu quả
        </Text>
      </View>

      <View style={s.form}>
        <Text style={s.welcome}>
          Chào mừng trở lại!
        </Text>

        <Text style={s.muted}>
          Đăng nhập để tiếp tục làm việc cùng nhóm
        </Text>

        <Text style={s.label}>
          Email
        </Text>

        <TextInput
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setError('');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="email@gmail.com"
          style={s.input}
        />

        <Text style={s.label}>
          Mật khẩu
        </Text>

        <TextInput
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setError('');
          }}
          secureTextEntry
          placeholder="Nhập mật khẩu"
          style={s.input}
        />

        {error ? (
          <View style={s.error}>
            <Text style={s.errorText}>
              {error}
            </Text>
          </View>
        ) : null}

        <PrimaryButton
          title="Đăng nhập"
          icon="sign-in-alt"
          onPress={login}
          style={{
            marginTop: 10,
          }}
        />

        <Pressable
          onPress={onRegister}
          style={s.link}
        >
          <Text style={s.muted}>
            Chưa có tài khoản?{' '}
          </Text>

          <Text style={s.linkText}>
            Đăng ký
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    padding: 24,
  },

  hero: {
    alignItems: 'center',
    marginBottom: 42,
  },

  logo: {
    height: 70,
    width: 70,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 6,
  },

  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginTop: 15,
  },

  slogan: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 7,
  },

  form: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },

  welcome: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.text,
  },

  muted: {
    color: colors.muted,
    fontSize: 13,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 7,
  },

  input: {
    height: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.text,
  },

  link: {
    alignSelf: 'center',
    flexDirection: 'row',
    marginTop: 22,
  },

  linkText: {
    fontWeight: '800',
    color: colors.primary,
    fontSize: 13,
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