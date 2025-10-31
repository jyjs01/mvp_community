import { useCallback, useState } from 'react';
import { View, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import Txt from '@components/Txt';
import { Card, Divider } from '@components/Card';
import PrimaryButton from '@components/PrimaryButton';
import { t } from '@ui/theme';
import api, { extractMessage } from '@lib/api';



function formatDate(v) {
  try {
    const d = typeof v === 'number' ? new Date(v) : new Date(String(v));
    if (isNaN(d)) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch { return ''; }
}


export default function Home() {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const getId = (it) => String(it?.id ?? it?._id);

  const onSignOut = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    router.replace('/(auth)/sign-in');
  };

  // 최신 글 3개 로드
  const loadLatest = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setErr('');
    try {
      const { data } = await api.get('/posts', {
        params: { page: 1, limit: 3, sort: 'new' },
      });
      const rows = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      setItems(rows.slice(0, 3));
    } catch (error) {
      setErr(extractMessage(error) || '최신 글을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [loading]);


  // 화면 포커스마다 갱신 (글 작성 후 돌아올 때도 최신화)
  useFocusEffect(useCallback(() => { loadLatest(); }, [loadLatest]));

  
  const renderItem = ({ item }) => {
    const author = item.authorName || item.author?.name || '작성자 미상';
    const date = item.createdAt ? formatDate(item.createdAt) : '';
    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: '/(main)/posts/[id]',
            params: { id: getId(item) },
          })
        }
      >
        <View style={{ paddingVertical: t.space.sm }}>
          {/* 제목(좌) · 메타(우) */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Txt type="h1" numberOfLines={1}>{item.title}</Txt>
            </View>
            <View style={{ alignItems: 'flex-end', minWidth: 110 }}>
              <Txt type="small" style={{ color: t.colors.muted }} numberOfLines={1}>
                {author}
              </Txt>
              {!!date && (
                <Txt type="small" style={{ color: t.colors.muted, marginTop: 2 }} numberOfLines={1}>
                  {date}
                </Txt>
              )}
            </View>
          </View>

          {/* 내용 미리보기 */}
          {!!item.content && (
            <Txt type="small" style={{ marginTop: 6, color: t.colors.muted }} numberOfLines={2}>
              {item.content}
            </Txt>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, padding: t.space.lg, backgroundColor: t.colors.bg, gap: t.space.md, justifyContent: 'center' }}>
      {/* 헤더 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt type="title">홈</Txt>
        <PrimaryButton title="로그아웃" onPress={onSignOut} style={{ height: 40, paddingHorizontal: 14 }} />
      </View>

      {/* 최신 글 3개 카드 */}
      <Card>
        {err ? (
          <View style={{ padding: t.space.md }}>
            <Txt type="small" style={{ color: t.colors.error }}>{err}</Txt>
            <PrimaryButton title="다시 불러오기" onPress={loadLatest} style={{ marginTop: 8 }} />
          </View>
        ) : loading && items.length === 0 ? (
          <View style={{ padding: t.space.lg, alignItems: 'center' }}>
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(it) => getId(it)}
            ItemSeparatorComponent={() => <Divider />}
            renderItem={renderItem}
            ListEmptyComponent={
              <View style={{ padding: t.space.lg, alignItems: 'center' }}>
                <Txt type="small" style={{ color: t.colors.muted }}>아직 등록된 글이 없습니다.</Txt>
              </View>
            }
          />
        )}
      </Card>

      {/* 이동 버튼들 */}
      <View style={{ flexDirection: 'row', gap: t.space.sm }}>
        <PrimaryButton
          title="새 글 작성"
          onPress={() => router.push('/(main)/post-new')}
          style={{ flex: 1 }}
        />
        <PrimaryButton
          title="글 목록"
          onPress={() => router.push('/(main)/post-list')}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}
