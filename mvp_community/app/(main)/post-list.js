import { useCallback, useEffect, useState } from 'react';
import { View, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import api, { extractMessage } from '@lib/api';
import { Card, Divider } from '@components/Card';
import Txt from '@components/Txt';
import PrimaryButton from '@components/PrimaryButton';
import { t } from '@ui/theme';

const PAGE_SIZE = 10;

export default function PostListScreen() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState('');


  // 페이지 불러오기
  const fetchPage = useCallback(async (nextPage, isRefresh = false) => {

    if (loading) return;
    setLoading(true);
    setErr('');

    try {

      // 글 정보 불러오기
      const { data } = await api.get('/posts', { params: { page: nextPage, limit: PAGE_SIZE } });

      // 정보 정규화
      const rows = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      const total = data?.total ?? null;

      // 목록 상태 갱신
      setItems((prev) => (isRefresh ? rows : [...prev, ...rows]));
      setPage(nextPage);

      // 더 불러올 정보가 있는지
      if (total != null) {
        // total이 있으면 계산, 없으면 응답 길이 기반 추정
        const loaded = (isRefresh ? rows.length : prevLen(prev => prev + rows.length));
        setHasMore(loaded < total);
      } else {
        setHasMore(rows.length === PAGE_SIZE);
      }

    } catch (e) {
      setErr(extractMessage(e) || '목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
      if (refreshing) setRefreshing(false);
    }
  }, [loading, refreshing]);


  // prev length helper
  const prevLen = (fn) => {
    let v = 0;
    setItems((p) => {
      v = p.length;
      return p;
    });
    return fn ? fn(v) : v;
  };

  useEffect(() => {
    fetchPage(1, true);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPage(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) fetchPage(page + 1);
  };

  const renderItem = ({ item }) => (
    <Pressable onPress={() => router.push(`/(main)/posts/${item.id}`)}>
      <View style={{ paddingVertical: t.space.sm }}>
        <Txt type="h1" numberOfLines={1}>{item.title}</Txt>
        {!!item.content && (
          <Txt type="small" style={{ marginTop: 4, color: t.colors.muted }} numberOfLines={2}>
            {item.content}
          </Txt>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg, padding: t.space.lg, gap: t.space.md }}>
      {/* 헤더 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt type="title">글 목록</Txt>
        <PrimaryButton
          title="새 글"
          onPress={() => router.push('/(main)/post-new')}
          style={{ height: 40, paddingHorizontal: 14 }}
        />
      </View>

      {/* 본문 카드 */}
      <Card style={{ flex: 1 }}>
        {err ? (
          <View style={{ padding: t.space.md }}>
            <Txt type="small" style={{ color: t.colors.error }}>{err}</Txt>
            <PrimaryButton title="다시 시도" onPress={() => fetchPage(1, true)} style={{ marginTop: 8 }}/>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(it) => String(it.id)}
            ItemSeparatorComponent={() => <Divider />}
            renderItem={renderItem}
            onEndReachedThreshold={0.3}
            onEndReached={loadMore}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.primary} />
            }
            ListEmptyComponent={
              loading ? null : (
                <View style={{ padding: t.space.lg, alignItems: 'center' }}>
                  <Txt type="small" style={{ color: t.colors.muted }}>등록된 글이 없습니다.</Txt>
                </View>
              )
            }
            ListFooterComponent={
              loading && items.length > 0 ? (
                <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                  <ActivityIndicator />
                </View>
              ) : null
            }
          />
        )}
      </Card>
    </View>
  );
}
