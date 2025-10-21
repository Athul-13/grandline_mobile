export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    return 'Email is required';
  }
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password.trim()) {
    return 'Password is required';
  }
  if (password.trim().length < 6) {
    return 'Password must be at least 6 characters';
  }
  return null;
};

export const trimCredentials = (email: string, password: string) => ({
  email: email.trim(),
  password: password.trim(),
});
