import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

interface GradientButtonProps extends TouchableOpacityProps {
  title: string;
  colors?: string[];
  textColor?: string;
}

export function GradientButton({ 
  title, 
  onPress, 
  colors, 
  textColor = '#ffffff', 
  style, 
  ...props 
}: GradientButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const defaultColors = [
    Colors[colorScheme].primary,
    Colors[colorScheme].secondary,
  ];

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.8} 
      style={[styles.container, style]} 
      {...props}
    >
      <LinearGradient
        colors={(colors || defaultColors) as unknown as readonly [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
