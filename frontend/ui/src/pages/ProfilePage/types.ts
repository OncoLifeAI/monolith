export interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  doctor: string;
  clinic: string;
  chemotherapyDay: string;
  reminderTime: string;
  profileImage?: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  doctor: string;
  clinic: string;
  chemotherapyDay: string;
  reminderTime: string;
}

export interface ProfilePageProps {
  // Add any props if needed
} 