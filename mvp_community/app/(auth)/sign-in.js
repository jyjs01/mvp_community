import { useState } from 'react';
import { View, Pressable, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { router, Link } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import Txt from '@components/Txt';
import TextField from '@components/TextField';
import PrimaryButton from '@components/PrimaryButton';
import { t } from '@ui/theme';
import api, { extractMessage } from '@lib/api';

export default function SignIn() {

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);


  // 로그인 요청
  const onSubmit = async () => {
    setErr('');
    if (!email || !pw) return setErr('이메일과 비밀번호를 입력하세요.');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password: pw });

      // { accessToken, refreshToken?, user? } 형태 가정
      if (data?.accessToken) await SecureStore.setItemAsync('accessToken', data.accessToken);
      if (data?.refreshToken) await SecureStore.setItemAsync('refreshToken', data.refreshToken);

      router.replace('/(main)/home');
    } catch (e) {
      setErr(extractMessage(e) || '로그인에 실패했어요.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1, backgroundColor: t.colors.bg }}
    >
      <View style={{ flex: 1, padding: t.space.lg, gap: t.space.md, justifyContent: 'center' }}>
        <Txt type="title">간단 커뮤니티 앱</Txt>
        <Txt type="small" style={{ marginTop: -8 }}>이메일로 로그인하세요</Txt>

        <TextField
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt type="body" style={{ fontWeight: '700' }}>비밀번호</Txt>
            <Pressable onPress={() => setShow(s => !s)}>
              <Txt type="body" style={{ color: t.colors.primary }}>{show ? 'Hide' : 'Show'}</Txt>
            </Pressable>
          </View>
          <TextField
            secureTextEntry={!show}
            value={pw}
            onChangeText={setPw}
          />
        </View>

        {!!err && <Txt type="small" style={{ color: t.colors.error }}>{err}</Txt>}

        <PrimaryButton
          title={loading ? '로그인 중...' : '로그인'}
          onPress={onSubmit}
          disabled={loading}
          style={{ marginTop: t.space.md }}
        />

        <View style={{ alignItems: 'center', marginTop: t.space.sm }}>
          <Txt type="small">
            처음이신가요?{' '}
            <Link href="/(auth)/sign-up" asChild>
              <Text style={{ color: t.colors.primary }}>회원가입</Text>
            </Link>
          </Txt>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
