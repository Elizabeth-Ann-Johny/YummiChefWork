import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../lib/theme';

export default function Loading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.COLORS.accent} />
      <Text style={styles.text}>Loading delicious dishes...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.background,
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: theme.COLORS.text,
  },
});