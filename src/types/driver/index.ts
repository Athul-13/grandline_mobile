// Driver status enum (matches server)
export enum DriverStatus {
  AVAILABLE = 'available',
  ON_TRIP = 'ontrip',
  SUSPENDED = 'suspended',
  BLOCKED = 'blocked',
}

// Driver interface (matches server LoginDriverResponse)
export interface Driver {
  readonly driverId: string;
  readonly fullName: string;
  readonly email: string;
  readonly phoneNumber?: string;
  readonly licenseNumber: string;
  readonly profilePictureUrl: string;
  readonly licenseCardPhotoUrl: string;
  readonly status: DriverStatus;
  readonly salary: number;
  readonly isOnboarded: boolean;
  readonly createdAt: string;
}

// Driver info response
export interface DriverInfo {
  readonly hasLicense: boolean;
  readonly hasProfilePicture: boolean;
}

