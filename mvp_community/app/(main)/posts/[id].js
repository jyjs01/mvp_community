import { useCallback, useRef, useState } from 'react';
import { View, ScrollView, Image, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import api, { extractMessage } from '@lib/api';
import { absUrl } from '@lib/url';
import { Card, Divider } from '@components/Card';
import PrimaryButton from '@components/PrimaryButton';
import Txt from '@components/Txt';
import { t } from '@ui/theme';

const W = Dimensions.get('window').width;

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const fetchingRef = useRef(false); // 동시 호출/루프 방지

  // 글 상세 정보 불러오기
  const fetchDetail = useCallback(async () => {

    if (!id || fetchingRef.current) return;

    fetchingRef.current = true;
    setLoading(true);
    setErr('');
    try {
      const { data } = await api.get(`/posts/${id}`);
      setPost(data);
      console.log(data);
    } catch (error) {
      setErr(extractMessage(error) || '상세 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchDetail();            // 화면 진입/포커스 시 1회 호출
      return () => { fetchingRef.current = false; };
    }, [fetchDetail])
  );


  const onRefresh = async () => {
    setRefreshing(true);
    try { await fetchDetail(); } finally { setRefreshing(false); }
  };

  const createdAtText = (() => {
    if (!post?.createdAt) return '';
    try {
      const d = new Date(post.createdAt);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    } catch { return ''; }
  })();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.colors.bg }}
      contentContainerStyle={{ padding: t.space.lg, gap: t.space.md }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.primary} />}
    >
      {/* 헤더 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt type="title">글 상세</Txt>
        <View style={{ flexDirection: 'row', gap: t.space.sm }}>
          <PrimaryButton title="목록" onPress={() => router.push('/(main)/post-list')} style={{ height: 40, paddingHorizontal: 14 }} />
          <PrimaryButton title="새 글" onPress={() => router.push('/(main)/post-new')} style={{ height: 40, paddingHorizontal: 14 }} />
        </View>
      </View>

      <Card>
        {loading ? (
          <View style={{ padding: t.space.lg, alignItems: 'center' }}>
            <ActivityIndicator />
            <Txt type="small" style={{ color: t.colors.muted, marginTop: 8 }}>불러오는 중...</Txt>
          </View>
        ) : err ? (
          <View style={{ padding: t.space.lg }}>
            <Txt type="small" style={{ color: t.colors.error }}>{err}</Txt>
            <PrimaryButton title="다시 시도" onPress={fetchDetail} style={{ marginTop: 8 }} />
          </View>
        ) : !post ? (
          <View style={{ padding: t.space.lg }}>
            <Txt type="small" style={{ color: t.colors.muted }}>해당 글을 찾을 수 없습니다.</Txt>
          </View>
        ) : (
          <View style={{ gap: t.space.md }}>
            {/* 제목 + 메타 */}
            <View>
              <Txt type="h1">제목 : {post.title}</Txt>
              <Txt type="small" style={{ marginTop: 10, color: t.colors.muted }}>
                {post?.authorName ? `작성자 : ${post.authorName}` : '작성자 미상'} 
                {createdAtText ? `\n\n작성일자 : ${createdAtText}` : ''}
              </Txt>
            </View>

            <Divider />

            {/* 본문 */}
            {!!post.content && (
              <Txt type="body" style={{ lineHeight: 22 }}>{post.content}</Txt>
            )}

            {/* 이미지 갤러리 */}
            {!!post.images?.length && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10 }}
              >
                {post.images.map((src, i) => (
                  <Image
                    key={`${src}-${i}`}
                    source={{ uri: absUrl(src) }}
                    style={{
                      width: Math.min(W - t.space.lg * 2, 340),
                      height: 220,
                      borderRadius: 12,
                    }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            )}

            {/* 하단 액션 (댓글 페이지는 추후 연결) */}
            <View style={{ flexDirection: 'row', gap: t.space.sm, marginTop: t.space.sm }}>
              <PrimaryButton
                title="댓글 보기"
                onPress={() => router.push(`/(main)/posts/${id}/comments`)}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                title="홈"
                onPress={() => router.replace('/(main)/home')}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </Card>
    </ScrollView>
  );
}
