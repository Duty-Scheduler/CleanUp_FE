import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function AuthHeader({
  title = 'Get Started now',
  subtitle = 'Create an account or log in to explore about our app',
}: AuthHeaderProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/Logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 150,
    height: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
