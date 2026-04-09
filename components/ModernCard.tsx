import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { View, ViewProps } from './Themed';

interface ModernCardProps extends ViewProps {
  elevation?: number;
}

export function ModernCard({ style, elevation = 4, ...props }: ModernCardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          elevation,
          shadowOpacity: 0.1,
          shadowRadius: elevation * 2,
          shadowOffset: { width: 0, height: elevation / 2 },
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#ffffff', // This will be overridden by Themed View if not specified
    shadowColor: '#000',
  },
});
