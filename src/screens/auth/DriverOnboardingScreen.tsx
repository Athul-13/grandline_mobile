import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector, completeDriverOnboarding, clearError } from '../../store';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Button } from '../../components/common/Button';

export const DriverOnboardingScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const colorScheme = useColorScheme();
  
  // Get auth state from Redux
  const { isLoading, error } = useAppSelector((state) => state.auth);
  
  const [driverLicense, setDriverLicense] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Show error alert when onboarding fails
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Onboarding Failed',
        error,
        [{ text: 'OK', onPress: () => dispatch(clearError()) }]
      );
    }
  }, [error, dispatch]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need camera roll permissions to upload images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickDriverLicense = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 10], // Driver's license aspect ratio
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDriverLicense(result.assets[0].uri);
    }
  };

  const takeDriverLicense = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need camera permissions to take photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDriverLicense(result.assets[0].uri);
    }
  };


  const takeProfilePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need camera permissions to take photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const handleContinue = async () => {
    if (!driverLicense || !profilePicture) {
      Alert.alert(
        'Required Information',
        'Please upload both your driver&apos;s license and profile picture to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Dispatch onboarding completion action
      await dispatch(completeDriverOnboarding({
        driverLicense,
        profilePicture,
      })).unwrap();
      
      Alert.alert(
        'Onboarding Complete!',
        'Your driver information has been submitted successfully. Welcome to GrandLine!',
        [{ 
          text: 'Continue',
          onPress: () => router.replace('/(main)')
        }]
      );
    } catch (error) {
      // Error is handled by useEffect above
      console.error('Onboarding error:', error);
    }
  };


  const isComplete = driverLicense && profilePicture;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
              Complete Your Profile
            </Text>
             <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].text }]}>
               Please upload your driver&apos;s license and profile picture to get started.
             </Text>
          </View>
          
          <View style={styles.content}>
            {/* Driver's License Section */}
            <View style={styles.section}>
               <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                 Driver&apos;s License
               </Text>
              
              {driverLicense ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: driverLicense }} style={styles.licenseImage} />
                  <TouchableOpacity 
                    style={styles.changeButton}
                    onPress={() => setDriverLicense(null)}
                  >
                    <Text style={styles.changeButtonText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.uploadContainer}>
                  <View style={styles.uploadIcon}>
                    <Text style={styles.uploadIconText}>📄</Text>
                  </View>
                   <Text style={[styles.uploadText, { color: Colors[colorScheme ?? 'light'].text }]}>
                     Upload your driver&apos;s license
                   </Text>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.uploadButton} onPress={pickDriverLicense}>
                      <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.uploadButton} onPress={takeDriverLicense}>
                      <Text style={styles.uploadButtonText}>Take Photo</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Profile Picture Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Profile Picture
              </Text>
              
              {profilePicture ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: profilePicture }} style={styles.profileImage} />
                  <TouchableOpacity 
                    style={styles.changeButton}
                    onPress={() => setProfilePicture(null)}
                  >
                    <Text style={styles.changeButtonText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.uploadContainer}>
                  <View style={styles.uploadIcon}>
                    <Text style={styles.uploadIconText}>📷</Text>
                  </View>
                   <Text style={[styles.uploadText, { color: Colors[colorScheme ?? 'light'].text }]}>
                     Take your profile picture
                   </Text>
                   <TouchableOpacity style={styles.singleUploadButton} onPress={takeProfilePicture}>
                     <Text style={styles.uploadButtonText}>Take Photo</Text>
                   </TouchableOpacity>
                </View>
              )}
            </View>

             {/* Action Buttons */}
             <View style={styles.actionButtons}>
               <Button
                 title="Complete Setup"
                 onPress={handleContinue}
                 disabled={!isComplete}
                 loading={isLoading}
                 style={styles.continueButton}
               />
             </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F1DE',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    transform: [{ translateX: -5 }],
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  imageContainer: {
    alignItems: 'center',
  },
  licenseImage: {
    width: 200,
    height: 125,
    borderRadius: 8,
    marginBottom: 10,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  changeButton: {
    backgroundColor: '#C5630C',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  changeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  uploadContainer: {
    alignItems: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: '#C5630C',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: 'rgba(197, 99, 12, 0.05)',
  },
  uploadIcon: {
    marginBottom: 10,
  },
  uploadIconText: {
    fontSize: 40,
  },
  uploadText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadButton: {
    backgroundColor: '#C5630C',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
  },
  singleUploadButton: {
    backgroundColor: '#C5630C',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 6,
    alignSelf: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    marginTop: 20,
    gap: 12,
  },
  continueButton: {
    backgroundColor: '#C5630C',
  },
});
