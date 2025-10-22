import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ImageBackground, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleBack = () => {
    router.back();
  };

  const handleLogout = () => {
    router.replace('/(auth)/login');
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/login-bg.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            User Profile
          </Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.profileCard}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Email:
            </Text>
            <Text style={[styles.value, { color: Colors[colorScheme ?? 'light'].text }]}>
              user@example.com
            </Text>
            
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Status:
            </Text>
            <Text style={[styles.value, { color: Colors[colorScheme ?? 'light'].text }]}>
              Active
            </Text>
            
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Member Since:
            </Text>
            <Text style={[styles.value, { color: Colors[colorScheme ?? 'light'].text }]}>
              January 2024
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 60,
    padding: 10,
  },
  backButtonText: {
    color: '#C5630C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    transform: [{ translateX: -10 }],
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#C5630C',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
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
