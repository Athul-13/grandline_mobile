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
import { useTheme } from '../../hooks/use-theme';
import { spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { Button } from '../../components/common/Button';

export const DriverOnboardingScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { theme } = useTheme();
  
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
          onPress: () => router.replace('/(main)/(dashboard)')
        }]
      );
    } catch (error) {
      // Error is handled by useEffect above
      console.error('Onboarding error:', error);
    }
  };


  const isComplete = driverLicense && profilePicture;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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
            <Text style={[styles.title, { color: theme.text }]}>
              Complete Your Profile
            </Text>
             <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
               Please upload your driver&apos;s license and profile picture to get started.
             </Text>
          </View>
          
          <View style={styles.content}>
            {/* Driver's License Section */}
            <View style={styles.section}>
               <Text style={[styles.sectionTitle, { color: theme.text }]}>
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
                <View style={[styles.uploadContainer, { borderColor: theme.primary, backgroundColor: `${theme.primary}0D` }]}>
                  <View style={styles.uploadIcon}>
                    <Text style={styles.uploadIconText}>📄</Text>
                  </View>
                   <Text style={[styles.uploadText, { color: theme.text }]}>
                     Upload your driver&apos;s license
                   </Text>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={[styles.uploadButton, { backgroundColor: theme.primary }]} onPress={pickDriverLicense}>
                      <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.uploadButton, { backgroundColor: theme.primary }]} onPress={takeDriverLicense}>
                      <Text style={styles.uploadButtonText}>Take Photo</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Profile Picture Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
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
                <View style={[styles.uploadContainer, { borderColor: theme.primary, backgroundColor: `${theme.primary}0D` }]}>
                  <View style={styles.uploadIcon}>
                    <Text style={styles.uploadIconText}>📷</Text>
                  </View>
                   <Text style={[styles.uploadText, { color: theme.text }]}>
                     Take your profile picture
                   </Text>
                   <TouchableOpacity style={[styles.singleUploadButton, { backgroundColor: theme.primary }]} onPress={takeProfilePicture}>
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
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: spacing.md + 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md + 4,
    marginTop: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.md + 4,
    transform: [{ translateX: -5 }],
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    opacity: 0.8,
  },
  content: {
    paddingHorizontal: spacing.md,
  },
  section: {
    marginBottom: spacing.lg + 6,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md - 1,
  },
  imageContainer: {
    alignItems: 'center',
  },
  licenseImage: {
    width: 200,
    height: 125,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm + 2,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm + 2,
  },
  changeButton: {
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  changeButtonText: {
    color: 'white',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  uploadContainer: {
    alignItems: 'center',
    padding: spacing.md + 4,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
  },
  uploadIcon: {
    marginBottom: spacing.sm + 2,
  },
  uploadIconText: {
    fontSize: 40,
  },
  uploadText: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    marginBottom: spacing.md - 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
  },
  uploadButton: {
    paddingHorizontal: spacing.md - 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.sm,
  },
  singleUploadButton: {
    paddingHorizontal: spacing.lg + 6,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  actionButtons: {
    marginTop: spacing.md + 4,
    gap: spacing.sm + 4,
  },
  continueButton: {
    borderRadius: borderRadius.md,
  },
});
