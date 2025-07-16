import { TextStyle } from 'react-native';

type FontStyle = Pick<TextStyle, 'fontSize' | 'fontWeight' | 'color'>;

export const theme = {
  COLORS: {
    primary: '#FFF3DC',
    accent: '#482E1D',
    background: '#FFF3DC',
    text: '#482E1D',
    white: '#FFFFFF',
    gray: '#E0E0E0',
    overlay: '#00000099',
    border: '#ccc',
  },
  FONTS: {
    heading: {
      fontSize: 24,
      fontWeight: '700' as TextStyle['fontWeight'],
      color: '#482E1D',
    } satisfies FontStyle,

    label: {
      fontSize: 14,
      fontWeight: '400' as TextStyle['fontWeight'],
      color: '#482E1D',
    } satisfies FontStyle,
  },
};