import { Pressable, Text } from 'react-native';
import { t } from '@ui/theme';

export default function PrimaryButton({ title, onPress, disabled, style }) {
    
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          height: 52,
          borderRadius: t.radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: t.colors.primary,
          opacity: disabled ? 0.6 : 1
        },
        style
      ]}
    >
      <Text style={{ color: t.colors.primaryText, fontWeight: '700', fontSize: t.font.md }}>
        {title}
      </Text>
    </Pressable>
  );
}
