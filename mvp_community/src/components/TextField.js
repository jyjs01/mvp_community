import { TextInput } from 'react-native';
import { t } from '@ui/theme';

export default function TextField(props) {

  return (
    <TextInput
      placeholderTextColor={t.colors.subtext}
      style={{
        height: 48,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderRadius: t.radius.md,
        borderColor: t.colors.border,
        color: t.colors.text,
        backgroundColor: t.colors.bg
      }}
      {...props}
    />
  );
}
