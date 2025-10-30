import { useState } from 'react';
import { View, TextInput, Image, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import api, { extractMessage } from '@lib/api';
import { Card, Divider } from '@components/Card';
import PrimaryButton from '@components/PrimaryButton';
import Txt from '@components/Txt';
import { t } from '@ui/theme';


export default function PostNewScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [images, setImages] = useState([]); // [{ uri, fileName, mime }]
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);     // 0~1, total 불명이면 null
  const [showProgress, setShowProgress] = useState(false); // 너무 빨리 끝나면 아예 안 보이게


  // 이미지 첨부
  const pickImage = async () => {
    
    // 권한
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('권한 필요', '사진 보관함 접근 권한이 필요합니다.');
      return;
    }

    // 갤러리 오픈 및 이미지 선택
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,         // 여러 장 선택 가능
      quality: 0.8,
      selectionLimit: 4,            // 최대 4장까지
    });

    // 사용자가 창을 닫으면 종료
    if (res.canceled) return;


    // 이미지를 업로드 하기 좋은 형태로 변환
    const picked = (res.assets ?? []).map((a) => ({
      uri: a.uri,
      fileName: a.fileName ?? a.uri.split('/').pop() ?? `image_${Date.now()}.jpg`,       // 이미지 이름
      mime:              // 확장자
        a.mimeType ??
        (a.uri.endsWith('.png') ? 'image/png' : a.uri.endsWith('.heic') ? 'image/heic' : 'image/jpeg'),
    }));

    setImages((prev) => [...prev, ...picked].slice(0, 4));
  };


  // 이미지 삭제
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };


  // 글 등록
  const submit = async () => {
  if (!title.trim()) return Alert.alert('확인', '제목을 입력해 주세요.');
  if (!body.trim()) return Alert.alert('확인', '내용을 입력해 주세요.');

  // 업로드 중 진행률 최솟값(되돌림 방지용)
  let last = 0;

  // progress 노출 타이머 핸들
  let timer;

  try {
    setSubmitting(true);
    setProgress(null);

    // 300ms 이상 길어지면 그때부터 progress UI 노출
    timer = setTimeout(() => setShowProgress(true), 300);

    const fd = new FormData();
    fd.append('title', title.trim());
    fd.append('content', body.trim());
    images.forEach((img, idx) => {
      fd.append('images', {
        uri: img.uri,
        name: img.fileName || `photo_${idx}.jpg`,
        type: img.mime || 'image/jpeg',
      });
    });


    await api.post('/posts', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (typeof e.total === 'number' && e.total > 0) {
          // 0~0.99로 클램프 + 후퇴 금지
          let ratio = e.loaded / e.total;
          ratio = Math.max(0, Math.min(ratio, 0.99));
          if (ratio < last) ratio = last;
          last = ratio;
          setProgress(ratio);
        } else {
          setProgress(null); // total을 못 받는 경우
        }
      },
      timeout: 60000,
    });


    // 성공했을 때만 100% 표시
    setProgress(1);

    await new Promise(r => setTimeout(r, 150));

    router.replace('/(main)/home');
    
  } catch (error) {
    Alert.alert('오류', extractMessage(error) || '업로드 실패');
  } finally {
    if (timer) clearTimeout(timer);
    setShowProgress(false);
    setSubmitting(false);
    setProgress(null);
  }
};




  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.colors.bg }}
      contentContainerStyle={{ 
        padding: t.space.lg, 
        gap: t.space.md, 
        flexGrow: 1, 
        justifyContent: 'center'}}
      keyboardShouldPersistTaps="handled"
    >
      {/* 헤더 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt type="title">새 글 작성</Txt>

        <PrimaryButton
          title={submitting ? '등록 중...' : '등록'}
          disabled={submitting}
          onPress={submit}
          style={{ height: 40, paddingHorizontal: 16 }}
        />
      </View>

      {/* 진행 표시: 300ms 이상 걸릴 때만 노출 */}
      {submitting && showProgress && (
        <View style={{ gap: 8, marginTop: 8 }}>
            <Txt type="small" style={{ color: t.colors.muted }}>
              {progress == null ? '업로드 중...' : `업로드 ${Math.round(progress * 100)}%`}
            </Txt>
            <View style={{ height: 8, borderRadius: 999, backgroundColor: t.colors.border, overflow: 'hidden' }}>
              <View
                  style={{
                  height: '100%',
                  width: `${Math.round((progress || 0) * 100)}%`,
                  backgroundColor: t.colors.primary,
                  }}
              />
            </View>
        </View>
      )}

      <Card>
        <View style={{ gap: t.space.md }}>
          {/* 제목 */}
          <View>
            <Txt type="small" style={{ marginBottom: 6, color: t.colors.muted }}>제목</Txt>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="제목을 입력하세요"
              placeholderTextColor={t.colors.muted}
              style={{
                backgroundColor: t.colors.card,
                borderRadius: t.radius.lg,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 16,
                color: t.colors.text,
                borderWidth: 1,
                borderColor: t.colors.border,
              }}
            />
          </View>

          <Divider />

          {/* 내용 */}
          <View>
            <Txt type="small" style={{ marginBottom: 6, color: t.colors.muted }}>내용</Txt>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="내용을 입력하세요"
              placeholderTextColor={t.colors.muted}
              multiline
              textAlignVertical="top"
              style={{
                minHeight: 160,
                backgroundColor: t.colors.card,
                borderRadius: t.radius.lg,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 16,
                color: t.colors.text,
                borderWidth: 1,
                borderColor: t.colors.border,
              }}
            />
          </View>

          <Divider />

          {/* 이미지 첨부 */}
          <View style={{ gap: 8 }}>
            <Txt type="small" style={{ color: t.colors.muted }}>이미지 첨부 (최대 4장)</Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {images.map((img, idx) => (
                <View key={img.uri} style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden' }}>
                  <Image source={{ uri: img.uri }} style={{ width: '100%', height: '100%' }} />
                  <Pressable
                    onPress={() => removeImage(idx)}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'rgba(0,0,0,0.55)',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 8,
                    }}
                  >
                    <Txt type="small" style={{ color: 'white' }}>삭제</Txt>
                  </Pressable>
                </View>
              ))}

              {images.length < 4 && (
                <Pressable
                  onPress={pickImage}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: t.colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: t.colors.card,
                  }}
                >
                  {submitting ? <ActivityIndicator /> : <Txt type="small">+ 추가</Txt>}
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}
