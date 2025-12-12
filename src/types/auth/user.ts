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

