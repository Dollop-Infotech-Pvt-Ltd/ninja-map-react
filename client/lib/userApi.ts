import { get, put, post, generateGrid, GridBounds, GridGenerationResponse } from "./http";
import type { LoggedInUser, GetProfileResponse, UpdateProfileResponse } from "../../shared/api";

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

/**
 * Generate grid cells for a geographic area
 * @param bounds - The geographic bounds for grid generation
 * @returns Promise<GridGenerationResponse>
 */
export async function generateMapGrid(bounds: GridBounds): Promise<GridGenerationResponse> {
  console.log('🔄 generateMapGrid called with bounds:', bounds);
  try {
    const result = await generateGrid(bounds);
    console.log('✅ generateMapGrid successful:', result);
    return result;
  } catch (error) {
    console.error('❌ generateMapGrid failed:', error);
    throw error;
  }
}

/**
 * Helper function to create grid bounds from coordinates
 * @param southWest - Bottom-left coordinate
 * @param northEast - Top-right coordinate
 * @returns GridBounds object
 */
export function createGridBounds(
  southWest: { latitude: number; longitude: number },
  northEast: { latitude: number; longitude: number }
): GridBounds {
  return {
    leftBottomLat: southWest.latitude,
    leftBottomLon: southWest.longitude,
    leftTopLat: northEast.latitude,
    leftTopLon: southWest.longitude,
    rightTopLat: northEast.latitude,
    rightTopLon: northEast.longitude,
    rightBottomLat: southWest.latitude,
    rightBottomLon: northEast.longitude,
  };
}