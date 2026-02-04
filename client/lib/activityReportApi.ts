import { SUBMIT_REPORT_API_URL } from "./APIConstants";
import { getStoredAuthToken } from "./http";
import type { SubmitActivityReportRequest, SubmitActivityReportResponse, ActivityReportType } from "@shared/api";

/**
 * Submit an activity report
 */
export async function submitActivityReport(reportData: SubmitActivityReportRequest): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Get the user's authentication token
    const token = getStoredAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please log in to submit a report.');
    }

    // Create FormData for multipart/form-data request
    const formData = new FormData();
    
    // Add report information
    formData.append('reportType', reportData.reportType);
    formData.append('comment', reportData.comment);
    formData.append('latitude', reportData.latitude.toString());
    formData.append('longitude', reportData.longitude.toString());
    formData.append('location', reportData.location);
    
    if (reportData.hideName !== undefined) {
      formData.append('hideName', reportData.hideName.toString());
    }
    
    // Add report image if provided
    if (reportData.reportPicture) {
      formData.append('reportPicture', reportData.reportPicture);
    }
    
    const response = await fetch(SUBMIT_REPORT_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type header - let browser set it with boundary for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle authentication errors specifically
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: SubmitActivityReportResponse = await response.json();
    
    return {
      success: true,
      message: data.message || 'Report submitted successfully'
    };
  } catch (error) {
    console.error('Error submitting activity report:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit report'
    };
  }
}

/**
 * Convert activity type from UI format to API format
 */
export function convertActivityTypeToAPI(activityType: string): ActivityReportType {
  const typeMap: Record<string, ActivityReportType> = {
    'traffic': 'TRAFFIC',
    'accident': 'ACCIDENT',
    'closure': 'ROAD_CLOSURE',
    'event': 'EVENT',
    'other': 'OTHER'
  };
  
  return typeMap[activityType] || 'OTHER';
}

/**
 * Convert base64 image to File object for activity reports
 */
export function base64ToFileForReport(base64String: string, filename: string): File {
  const arr = base64String.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}