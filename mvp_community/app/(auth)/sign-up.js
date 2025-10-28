import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { router, Link } from 'expo-router';
import Txt from '@components/Txt';
import TextField from '@components/TextField';
import PrimaryButton from '@components/PrimaryButton';
import { t } from '@ui/theme';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [err, setErr] = useState('');

  const onSubmit = async () => {
    setErr('');
    // UI MVP 검증만 간단히
    if (!name || !email || !pw || !pw2) return setErr('필수 항목을 입력하세요.');
    if (pw !== pw2) return setErr('비밀번호가 일치하지 않습니다.');
    // TODO 서버 연동
    router.replace('/(main)/index');
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

        <PrimaryButton title="회원가입" onPress={onSubmit} style={{ marginTop: t.space.md }} />

        <View style={{ alignItems: 'center', marginTop: t.space.sm }}>
          <Txt type="small">
            이미 계정이 있나요?{' '}
            <Link href="/(auth)/sign-in" style={{ color: t.colors.primary }}>로그인</Link>
          </Txt>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
