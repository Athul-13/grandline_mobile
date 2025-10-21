import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { validateEmail, validatePassword, trimCredentials } from '../../../utils/validation';
import { LoginFormProps, LoginFormData } from '../../../types/auth';

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const handleEmailChange = (email: string) => {
    const emailError = validateEmail(email);
    setFormData(prev => ({
      ...prev,
      email,
      emailError,
    }));
  };

  const handlePasswordChange = (password: string) => {
    const passwordError = validatePassword(password);
    setFormData(prev => ({
      ...prev,
      password,
      passwordError,
    }));
  };

  const handleSubmit = () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setFormData(prev => ({
        ...prev,
        emailError,
        passwordError,
      }));
      return;
    }

    // Trim credentials before sending
    const trimmedCredentials = trimCredentials(formData.email, formData.password);
    onSubmit(trimmedCredentials);
  };

  const isFormValid = !formData.emailError && !formData.passwordError && 
                     formData.email.trim() && formData.password.trim();

  return (
    <View style={styles.container}>
      <Input
        label="Email"
        value={formData.email}
        onChangeText={handleEmailChange}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        error={formData.emailError}
      />
      
      <Input
        label="Password"
        value={formData.password}
        onChangeText={handlePasswordChange}
        placeholder="Enter your password"
        secureTextEntry
        error={formData.passwordError}
      />
      
      <Button
        title="Login"
        onPress={handleSubmit}
        disabled={!isFormValid}
        loading={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});
