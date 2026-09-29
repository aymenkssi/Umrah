import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { Palette } from '../constants/theme';
import { useTheme, useThemedStyles } from '../contexts/ThemeContext';

interface IslamicPatternProps {
  width?: number;
  height?: number;
  opacity?: number;
  color?: string;
}

export const IslamicPattern: React.FC<IslamicPatternProps> = ({
  width = 200,
  height = 200,
  opacity = 0.1,
  color,
}) => {
  const { colors } = useTheme();
  const fill = color ?? colors.gold;
  return (
    <Svg width={width} height={height} viewBox="0 0 100 100" style={{ opacity }}>
      <G>
        {/* Islamic geometric pattern - 8-pointed star */}
        <Path
          d="M50 10 L55 30 L75 25 L60 40 L75 55 L55 50 L50 70 L45 50 L25 55 L40 40 L25 25 L45 30 Z"
          fill={fill}
          stroke={fill}
          strokeWidth="0.5"
        />
        
        {/* Outer decorative circle */}
        <Path
          d="M50 5 A45 45 0 1 0 50 95 A45 45 0 1 0 50 5"
          fill="none"
          stroke={fill}
          strokeWidth="0.5"
        />
        
        {/* Inner decorative elements */}
        <Path
          d="M50 20 L53 35 L65 32 L58 42 L65 52 L53 49 L50 64 L47 49 L35 52 L42 42 L35 32 L47 35 Z"
          fill="none"
          stroke={fill}
          strokeWidth="0.5"
        />
      </G>
    </Svg>
  );
};

interface IslamicBorderProps {
  style?: StyleProp<ViewStyle>;
}

export const IslamicBorder: React.FC<IslamicBorderProps> = ({ style }) => {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.borderContainer, style]}>
      <View style={styles.topBorder} />
      <View style={styles.bottomBorder} />
    </View>
  );
};

const makeStyles = (c: Palette) =>
  StyleSheet.create({
  borderContainer: {
    width: '100%',
    height: 2,
    position: 'relative',
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: c.gold,
  },
  bottomBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: c.primary,
  },
});