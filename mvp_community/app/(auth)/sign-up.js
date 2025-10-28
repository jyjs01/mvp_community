import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, Pressable, Text } from 'react-native';
import { router, Link } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import Txt from '@components/Txt';
import TextField from '@components/TextField';
import PrimaryButton from '@components/PrimaryButton';
import { t } from '@ui/theme';
import api, { extractMessage } from '@lib/api';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);


  // 회원가입 요청
  const onSubmit = async () => {
    setErr('');
    if (!name || !email || !pw || !pw2) return setErr('필수 항목을 입력하세요.');
    if (pw !== pw2) return setErr('비밀번호가 일치하지 않습니다.');

    setLoading(true);

    try {

      const { data } = await api.post('/auth/register', { name, email, password: pw });
      
      // 서버가 토큰을 내려주면 바로 저장 후 메인으로 이동
      if (data?.accessToken) {
        await SecureStore.setItemAsync('accessToken', data.accessToken);
        if (data?.refreshToken) await SecureStore.setItemAsync('refreshToken', data.refreshToken);
        router.replace('/(main)/index');
      } else {

        // 토큰 안 주는 정책이면 로그인 화면으로 전환
        router.replace('/(auth)/sign-in');
      }

    } catch (e) {
      setErr(extractMessage(e) || '회원가입에 실패했어요.');      
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: t.colors.bg }}
    >
      <View style={{ flex: 1, padding: t.space.lg, gap: t.space.md, justifyContent: 'center' }}>
        <Txt type="title">회원가입</Txt>
        <Txt type="small" style={{ marginTop: -8 }}>간단한 정보만 입력하면 가입 완료</Txt>

        <View style={{ gap: 8 }}>
          <Txt type="body" style={{ fontWeight: '700' }}>이름</Txt>
          <TextField placeholder="홍길동" value={name} onChangeText={setName} />
        </View>

        <View style={{ gap: 8 }}>
          <Txt type="body" style={{ fontWeight: '700' }}>이메일</Txt>
          <TextField
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt type="body" style={{ fontWeight: '700' }}>비밀번호</Txt>
            <Pressable onPress={() => setShowPw(s => !s)}>
              <Txt type="body" style={{ color: t.colors.primary }}>{showPw ? 'Hide' : 'Show'}</Txt>
            </Pressable>
          </View>
          <TextField placeholder="••••••••" secureTextEntry={!showPw} value={pw} onChangeText={setPw} />
        </View>

        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt type="body" style={{ fontWeight: '700' }}>비밀번호 확인</Txt>
            <Pressable onPress={() => setShowPw2(s => !s)}>
              <Txt type="body" style={{ color: t.colors.primary }}>{showPw2 ? 'Hide' : 'Show'}</Txt>
            </Pressable>
          </View>
          <TextField placeholder="••••••••" secureTextEntry={!showPw2} value={pw2} onChangeText={setPw2} />
        </View>

        {!!err && <Txt type="small" style={{ color: t.colors.error }}>{err}</Txt>}

        <PrimaryButton
          title={loading ? '가입 중...' : '회원가입'}
          onPress={onSubmit}
          disabled={loading}
          style={{ marginTop: t.space.md }}
        />

        <View style={{ alignItems: 'center', marginTop: t.space.sm }}>
          <Txt type="small">
            이미 계정이 있나요?{' '}
            <Link href="/(auth)/sign-in" asChild>
              <Text style={{ color: t.colors.primary }}>로그인</Text>
            </Link>
          </Txt>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
