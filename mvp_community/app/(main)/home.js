import { useState } from 'react';
import { View, FlatList } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import Txt from '@components/Txt';
import { Card, Divider } from '@components/Card';
import PrimaryButton from '@components/PrimaryButton';
import { t } from '@ui/theme';

const mockPosts = [
  
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
          onPress={() => {}}
          style={{ flex: 1 }}
        />
        <PrimaryButton
          title="글 목록"
          onPress={() => {}}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}
