import { Request, Response } from "express";
import { UpdateProfileResponse, UpdatePasswordResponse, LoggedInUser } from "@shared/api";

/**
 * Mock user profile update endpoint
 * In a real application, this would:
 * 1. Validate the user's authentication token
 * 2. Validate the input data
 * 3. Update the user profile in the database
 * 4. Handle file upload for profile picture
 * 5. Return the updated user data
 */
export async function handleUpdateProfile(req: Request, res: Response) {
  try {
    // Mock delay to simulate API processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, you would:
    // - Validate auth token from headers
    // - Extract user ID from token
    // - Validate input data with schema validation
    // - Handle file upload if profile picture is provided
    // - Update database record
    // - Return updated user data

    const { firstName, lastName, email, mobileNumber, bio, gender } = req.body;

    // Mock validation
    if (!firstName || !lastName || !email || !mobileNumber) {
      const response: UpdateProfileResponse = {
        success: false,
        message: "All required fields must be provided"
      };
      return res.status(400).json(response);
    }

    // Mock successful response
    const response: UpdateProfileResponse = {
      success: true,
      message: "Profile updated successfully!",
      user: {
        id: "58162d0f-297f-496e-b253-9709b3c9a14e",
        firstName,
        lastName,
        email,
        mobileNumber,
        bio: bio || undefined,
        gender: gender || undefined,
        profilePicture: req.file ? `/uploads/profiles/${req.file.filename}` : undefined
      }
    };

    res.json(response);
  } catch (error) {
    console.error("Profile update error:", error);
    const response: UpdateProfileResponse = {
      success: false,
      message: "Internal server error. Please try again later."
    };
    res.status(500).json(response);
  }
}

/**
 * Mock change password endpoint matching the real API
 * POST /api/users/change-password
 * In a real application, this would:
 * 1. Validate the user's authentication token
 * 2. Verify the old password
 * 3. Hash the new password
 * 4. Update the password in the database
 * 5. Optionally invalidate existing sessions
 */
export async function handleChangePassword(req: Request, res: Response) {
  try {
    // Mock delay to simulate API processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const { oldPassword, newPassword } = req.body;

    // Mock validation
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required"
      });
    }

    // Mock current password verification (in real app, compare with hashed password)
    if (oldPassword === "wrongpassword") {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Mock password strength validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long"
      });
    }

    // Mock successful response
    res.json({
      success: true,
      message: "Password updated successfully! Please use your new password for future logins."
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later."
    });
  }
}

// Simple in-memory storage for mock images (in real app, this would be in database)
let mockProfilePicture: string | null = null;
let mockHeaderImage: string | null = null;

/**
 * Mock user update endpoint matching the real API
 * PUT /api/users/update
 * In a real application, this would:
 * 1. Validate the user's authentication token
 * 2. Validate the input data
 * 3. Update the user profile in the database
 * 4. Handle file upload for profile picture
 * 5. Return the updated user data
 */
export async function handleUpdateUser(req: Request, res: Response) {
  try {
    // Mock delay to simulate API processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { id, firstName, lastName, bio, gender } = req.body;

    // Mock validation
    if (!id || !firstName || !lastName) {
      const response: UpdateProfileResponse = {
        success: false,
        message: "ID, first name, and last name are required"
      };
      return res.status(400).json(response);
    }

    // Mock profile picture handling
    if (req.file) {
      if (req.file.fieldname === 'profilePicture') {
        mockProfilePicture = `/uploads/profiles/${req.file.filename}`;
      } else if (req.file.fieldname === 'headerImage') {
        mockHeaderImage = `/uploads/headers/${req.file.filename}`;
      }
    }

    // Handle multiple files if both profile and header images are uploaded
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file: any) => {
        if (file.fieldname === 'profilePicture') {
          mockProfilePicture = `/uploads/profiles/${file.filename}`;
        } else if (file.fieldname === 'headerImage') {
          mockHeaderImage = `/uploads/headers/${file.filename}`;
        }
      });
    }

    // Mock successful response
    const response: UpdateProfileResponse = {
      success: true,
      message: "Profile updated successfully!",
      user: {
        id,
        firstName,
        lastName,
        email: "test@gmail.com", // This would come from database
        mobileNumber: "08123456787", // This would come from database
        bio: bio || undefined,
        gender: gender || undefined,
        profilePicture: mockProfilePicture || undefined,
        headerImage: mockHeaderImage || undefined
      }
    };

    res.json(response);
  } catch (error) {
    console.error("User update error:", error);
    const response: UpdateProfileResponse = {
      success: false,
      message: "Internal server error. Please try again later."
    };
    res.status(500).json(response);
  }
}

/**
 * Mock get logged-in user endpoint
 * In a real application, this would:
 * 1. Validate the user's authentication token
 * 2. Extract user ID from token
 * 3. Fetch user data from database
 * 4. Return logged-in user data
 */
export async function handleGetLoggedInUser(req: Request, res: Response) {
  try {
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock logged-in user data based on your API response format
    const loggedInUser: LoggedInUser = {
      id: "58162d0f-297f-496e-b253-9709b3c9a14e",
      email: "test@gmail.com",
      firstName: "test",
      lastName: "user",
      fullName: "test user",
      mobileNumber: "08123456787",
      profilePicture: mockProfilePicture, // Use the updated profile picture
      isActive: true,
      bio: "I'm a passionate navigator and technology enthusiast who loves exploring new places and helping others find their way.",
      gender: "PREFER_NOT_TO_SAY",
      joiningDate: "2026-01-15 11:52:29",
      role: "USER"
    };

    res.json(loggedInUser);
  } catch (error) {
    console.error("Get logged-in user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later."
    });
  }
}