export interface UserProfile {
    id: string;
    username: string;
    fullName: string | null;
    phoneNumber: string | null;
    profilePicture: string | null;
}

export interface UpdateProfileRequest {
    fullName?: string;
    phoneNumber?: string;
    profilePicture?: string;
}