import { Text } from 'react-native';
import { t } from '@ui/theme';

export default function Txt({ type='body', color, style, ...rest }) {

  const map = {
    title: { fontSize: t.font.xl, fontWeight: '700' },
    h1:    { fontSize: t.font.lg, fontWeight: '700' },
    body:  { fontSize: t.font.md },
    small: { fontSize: t.font.sm, color: t.colors.subtext }
  };
  
  return <Text style={[{ color: color || t.colors.text }, map[type], style]} {...rest} />;
}
