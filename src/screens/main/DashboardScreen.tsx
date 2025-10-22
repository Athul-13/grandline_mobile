import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleLogout = () => {
    // Navigate back to login
    router.replace('/(auth)/login');
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/login-bg.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Image 
            source={require('../../assets/images/mainpage-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            Welcome to GrandLine!
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            You have successfully logged in.
          </Text>
        </View>
        
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/(main)/profile')}
          >
            <Text style={styles.buttonText}>View Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F4F1DE',
    opacity: 0.8,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  content: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#C5630C',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderColor: '#C5630C',
    borderWidth: 2,
  },
  logoutButtonText: {
    color: '#C5630C',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
