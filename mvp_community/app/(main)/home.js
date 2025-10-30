import { useState } from 'react';
import { View, FlatList } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import Txt from '@components/Txt';
import { Card, Divider } from '@components/Card';
import PrimaryButton from '@components/PrimaryButton';
import { t } from '@ui/theme';

const mockPosts = [
  { id: '1', title: '첫 글이에요', subtitle: '간단 커뮤니티 시작!' },
  { id: '2', title: '공지', subtitle: '내일부터 UI 리팩토링' },
  { id: '3', title: '잡담', subtitle: '오늘 점심 뭐 먹지?' },
];

export default function Home() {
  const [items] = useState(mockPosts);

  const onSignOut = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    router.replace('/(auth)/sign-in');
  };

  return (
    <View style={{ flex: 1, padding: t.space.lg, backgroundColor: t.colors.bg, gap: t.space.md, justifyContent: 'center' }}>
      {/* 헤더 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt type="title">홈</Txt>
        <PrimaryButton title="로그아웃" onPress={onSignOut} style={{ height: 40, paddingHorizontal: 14 }} />
      </View>

      {/* 리스트 카드 */}
      <Card>
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item }) => (
            <View style={{ paddingVertical: t.space.sm }}>
              <Txt type="h1">{item.title}</Txt>
              <Txt type="small" style={{ marginTop: 4 }}>{item.subtitle}</Txt>
            </View>
          )}
        />
      </Card>

      {/* 예시 버튼들 */}
      <View style={{ flexDirection: 'row', gap: t.space.sm }}>
        <PrimaryButton
          title="새 글 작성"
          onPress={() => router.push('/(main)/post-new')}
          style={{ flex: 1 }}
        />
        <PrimaryButton
          title="프로필"
          onPress={() => {}}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}
