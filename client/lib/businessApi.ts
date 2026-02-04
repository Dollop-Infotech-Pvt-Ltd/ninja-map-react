import { CREATE_BUSINESS_API_URL } from "./APIConstants";
import { getStoredAuthToken } from "./http";

export interface BusinessHours {
  weekday: string;
  openingTime?: string;
  closingTime?: string;
  isClosed: boolean;
  isOpen24Hours: boolean;
}

export interface CreateBusinessRequest {
  businessName: string;
  subCategoryId: string;
  address: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
  website?: string;
  businessHours: BusinessHours[];
  businessImages?: File[];
}

export interface CreateBusinessResponse {
  success: boolean;
  message: string;
  businessId?: string;
}

/**
 * Create a new business listing
 */
export async function createBusiness(businessData: CreateBusinessRequest): Promise<CreateBusinessResponse> {
  try {
    // Get the user's authentication token
    const token = getStoredAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please log in to create a business.');
    }

    // Create FormData for multipart/form-data request
    const formData = new FormData();
    
    // Add basic business information
    formData.append('businessName', businessData.businessName);
    formData.append('subCategoryId', businessData.subCategoryId);
    formData.append('address', businessData.address);
    formData.append('latitude', businessData.latitude.toString());
    formData.append('longitude', businessData.longitude.toString());
    formData.append('phoneNumber', businessData.phoneNumber);
    
    if (businessData.website) {
      formData.append('website', businessData.website);
    }
    
    // Add business hours
    businessData.businessHours.forEach((hours, index) => {
      formData.append(`businessHours[${index}].weekday`, hours.weekday);
      if (hours.openingTime) {
        formData.append(`businessHours[${index}].openingTime`, hours.openingTime);
      }
      if (hours.closingTime) {
        formData.append(`businessHours[${index}].closingTime`, hours.closingTime);
      }
      formData.append(`businessHours[${index}].isClosed`, hours.isClosed.toString());
      formData.append(`businessHours[${index}].isOpen24Hours`, hours.isOpen24Hours.toString());
    });
    
    // Add business images if provided
    if (businessData.businessImages && businessData.businessImages.length > 0) {
      businessData.businessImages.forEach((file) => {
        formData.append('businessImages', file);
      });
    }
    
    const response = await fetch(CREATE_BUSINESS_API_URL, {
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

    const data = await response.json();
    
    return {
      success: true,
      message: data.message || 'Business created successfully',
      businessId: data.businessId || data.id
    };
  } catch (error) {
    console.error('Error creating business:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create business'
    };
  }
}

/**
 * Convert time from 12-hour format to 24-hour format for API
 */
export function convertTo24Hour(time12h: string): string {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') {
    hours = '00';
  }
  
  if (modifier === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString();
  }
  
  return `${hours}:${minutes}`;
}

/**
 * Convert base64 image to File object
 */
export function base64ToFile(base64String: string, filename: string): File {
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