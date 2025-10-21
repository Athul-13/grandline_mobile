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
