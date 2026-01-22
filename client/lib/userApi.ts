import { get, put, post } from "./http";
import { LoggedInUser, UserProfile, GetProfileResponse, UpdateProfileRequest, UpdateProfileResponse } from "@shared/api";

/**
 * Fetch the currently logged-in user data
 */
export async function getLoggedInUser(): Promise<LoggedInUser> {
  return await get<LoggedInUser>("/api/users/get-loggedIn-user");
}

/**
 * Fetch user profile data (existing endpoint)
 */
export async function getUserProfile(): Promise<GetProfileResponse> {
  return await get<GetProfileResponse>("/api/users/profile");
}

/**
 * Update user profile using the real API endpoint
 */
export async function updateUserProfile(data: {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: File;
  bio?: string;
  gender?: string;
}): Promise<UpdateProfileResponse> {
  const formData = new FormData();
  
  // Add required fields
  formData.append('id', data.id);
  formData.append('firstName', data.firstName);
  formData.append('lastName', data.lastName);
  
  // Add optional fields
  if (data.bio) {
    formData.append('bio', data.bio);
  }
  
  if (data.gender) {
    formData.append('gender', data.gender);
  }
  
  // Add profile picture if provided
  if (data.profilePicture) {
    formData.append('profilePicture', data.profilePicture);
  }

  const response = await put<UpdateProfileResponse>("/api/users/update", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response;
}

/**
 * Change user password using the real API endpoint
 */
export async function changeUserPassword(data: {
  oldPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const response = await post<{ success: boolean; message: string }>("/api/users/change-password", {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    });
    
    console.log("API Response:", response); // Debug log
    return response;
  } catch (error: any) {
    console.error("API Error:", error); // Debug log
    
    // Check if the error response contains success data
    if (error?.data?.success === true) {
      return error.data;
    }
    
    // Re-throw the error to be handled by the mutation
    throw error;
  }
}