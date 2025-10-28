import { View } from 'react-native';
import { t } from '@ui/theme';

export function Card({ style, ...rest }) {
  return (
    <View
      style={[{
        backgroundColor: t.colors.card,
        borderRadius: t.radius.lg,
        borderWidth: 1,
        borderColor: t.colors.border,
        padding: t.space.md
      }, style]}
      {...rest}
    />
  );
}

export function Divider({ style }) {
  return <View style={[{ height: 1, backgroundColor: t.colors.border }, style]} />;
}
