export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

export interface LoginFormData {
  readonly email: string;
  readonly password: string;
  readonly emailError?: string | null;
  readonly passwordError?: string | null;
}

export interface LoginFormProps {
  readonly onSubmit: (credentials: LoginCredentials) => void;
  readonly loading?: boolean;
}

// User interface
export interface User {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly avatar?: string;
  readonly phoneNumber?: string;
  readonly isEmailVerified: boolean;
  readonly isOnboardingComplete: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// Authentication response
export interface AuthResponse {
  readonly user: User;
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
}

// Authentication state
export interface AuthState {
  readonly user: User | null;
  readonly accessToken: string | null;
  readonly refreshToken: string | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly error: string | null;
}

// Password change data
export interface PasswordChangeData {
  readonly currentPassword: string;
  readonly newPassword: string;
  readonly confirmPassword: string;
}

// Driver onboarding data
export interface DriverOnboardingData {
  readonly driverLicense: string; // Base64 or file URI
  readonly profilePicture: string; // Base64 or file URI
}