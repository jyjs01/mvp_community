import { useCallback, useRef, useState } from 'react';
import { View, ScrollView, Image, ActivityIndicator, RefreshControl, Dimensions, TextInput, Pressable } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import api, { extractMessage } from '@lib/api';
import { absUrl } from '@lib/url';
import { Card, Divider } from '@components/Card';
import PrimaryButton from '@components/PrimaryButton';
import Txt from '@components/Txt';
import { t } from '@ui/theme';

const W = Dimensions.get('window').width;

function formatDate(v){
  try{
    const d = typeof v === 'number' ? new Date(v) : new Date(String(v));
    const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0');
    const hh=String(d.getHours()).padStart(2,'0'), mi=String(d.getMinutes()).padStart(2,'0');
    return `${y}-${m}-${dd} ${hh}:${mi}`;
  }catch{ return '';}
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const fetchingRef = useRef(false);

  // 댓글 상태
  const [comments, setComments] = useState([]);
  const [cLoading, setCLoading] = useState(false);
  const [cErr, setCErr] = useState('');
  const [cInput, setCInput] = useState('');
  const [cSending, setCSending] = useState(false);

  // 글 상세
  const fetchDetail = useCallback(async () => {
    if (!id || fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setErr('');
    try {
      const { data } = await api.get(`/posts/${id}`);
      setPost(data);
    } catch (error) {
      setErr(extractMessage(error) || '상세 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [id]);

  // 댓글 목록
  const fetchComments = useCallback(async () => {
    if (!id || cLoading) return;
    setCLoading(true);
    setCErr('');
    try {
      // 기본 방식
      const { data } = await api.get(`/posts/${id}/comments`);
      // 대안(주석 해제해서 사용): const { data } = await api.get('/comments', { params: { postId: id } });
      const rows = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      setComments(rows);
    } catch (e) {
      setCErr(extractMessage(e) || '댓글을 불러오지 못했습니다.');
    } finally {
      setCLoading(false);
    }
  }, [id]);

  // 댓글 작성
  const submitComment = useCallback(async () => {
    const text = cInput.trim();
    if (!text) return;
    setCSending(true);
    try {
      await api.post(`/posts/${id}/comments`, { content: text });
      // 대안: await api.post('/comments', { postId: id, content: text });
      setCInput('');
      fetchComments(); // 방금 쓴 댓글 반영
    } catch (e) {
      alert(extractMessage(e) || '댓글 등록 실패');
    } finally {
      setCSending(false);
    }
  }, [id, cInput, fetchComments]);

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
      fetchComments();        // 상세와 함께 댓글도 로드
      return () => { fetchingRef.current = false; };
    }, [fetchDetail, fetchComments])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try { await Promise.all([fetchDetail(), fetchComments()]); } finally { setRefreshing(false); }
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

      {/* 본문 카드 */}
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
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {post.images.map((src, i) => (
                  <Image
                    key={`${src}-${i}`}
                    source={{ uri: absUrl(src) }}
                    style={{ width: Math.min(W - t.space.lg * 2, 340), height: 220, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </Card>

      {/* ===== 댓글 섹션 ===== */}
      <Card>
        <Txt type="h1">댓글</Txt>


        {/* 목록 */}
        {cErr ? (
          <View style={{ paddingTop: 12 }}>
            <Txt type="small" style={{ color: t.colors.error }}>{cErr}</Txt>
            <PrimaryButton title="다시 시도" onPress={fetchComments} style={{ marginTop: 8 }} />
          </View>
        ) : cLoading && comments.length === 0 ? (
          <View style={{ paddingVertical: 16, alignItems: 'center' }}><ActivityIndicator /></View>
        ) : comments.length === 0 ? (
          <View style={{ paddingVertical: 16, alignItems: 'center' }}>
            <Txt type="small" style={{ color: t.colors.muted }}>첫 댓글을 남겨보세요.</Txt>
          </View>
        ) : (
          <View style={{ gap: 12, paddingTop: 8 }}>
            {comments.map((c) => (
              <View key={String(c.id)} style={{ paddingVertical: 4 }}>
                <Txt type="body">{c.content}</Txt>
                <Txt type="small" style={{ color: t.colors.muted, marginTop: 4 }}>
                  {(c.authorName || c.author?.name || '익명')} · {formatDate(c.createdAt)}
                </Txt>
              </View>
            ))}
          </View>
        )}

        <Divider style={{ marginTop: 8 }} />

        {/* 입력창 */}
        <View style={{ flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <TextInput
            value={cInput}
            onChangeText={setCInput}
            placeholder="댓글을 입력하세요"
            placeholderTextColor={t.colors.muted}
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: t.colors.border, borderRadius: 10, backgroundColor: t.colors.card }}
            editable={!cSending}
          />
          <PrimaryButton title={cSending ? '등록중' : '등록'} onPress={submitComment} disabled={cSending} />
        </View>
      </Card>
    </ScrollView>
  );
}
