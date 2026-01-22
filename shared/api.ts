/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * FAQ API types
 */
export interface FAQQuestion {
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: string;
  category: string;
  categoryImageUrl: string;
  questions: FAQQuestion[];
}

export interface FAQResponse {
  content: FAQCategory[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  firstPage: boolean;
  lastPage: boolean;
}

/**
 * Contact API types
 */
export type InquiryType = 
  | "GENERAL_SUPPORT" 
  | "TECHNICAL_SUPPORT" 
  | "BUSINESS_PARTNERSHIP" 
  | "PRIVACY_DATA" 
  | "FEEDBACK";

export interface ContactFormData {
  fullName: string;
  emailAddress: string;
  inquiryType: InquiryType;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success?: boolean;
  message?: string;
}

/**
 * Terms and Conditions / Privacy Policy API types
 */
export type DocumentType = "TERMS_AND_CONDITIONS" | "PRIVACY_POLICY";

export interface PolicyDocument {
  id: string;
  title: string;
  description: string;
  image: string;
  documentType: DocumentType;
}

export interface PolicyResponse {
  content: PolicyDocument[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  firstPage: boolean;
  lastPage: boolean;
}

/**
 * Blog API types
 */
export type BlogCategory = "NAVIGATION" | "TECHNOLOGY" | "COMMUNITY" | "UPDATES";

export interface BlogAuthor {
  name: string;
  designation: string;
  profilePicture: string | null;
  bio: string | null;
}

export interface BlogArticle {
  id: string;
  category: BlogCategory;
  title: string;
  previewContent: string;
  detailedContent: string;
  thumbnailUrl: string | null;
  featuredImgUrl: string | null;
  tags: string[];
  isFeaturedArticle: boolean;
  readTimeMinutes: number;
  postDate: string;
  views: number;
  likes: number;
  author: BlogAuthor;
}

export interface BlogData {
  featuredArticles: BlogArticle[];
  latestArticles: BlogArticle[];
  totalFeatured: number;
  totalLatest: number;
}

export interface BlogResponse {
  success: boolean;
  message: string;
  http: string;
  data: BlogData;
  statusCode: number;
}

/**
 * Delete Account API types
 */
export interface DeleteAccountOtpRequest {
  mobileNumber: string;
}

export interface DeleteAccountOtpResponse {
  success: boolean;
  message: string;
  http?: string;
  statusCode: number;
}

export interface DeleteAccountVerifyRequest {
  otp: string;
}

export interface DeleteAccountVerifyResponse {
  success: boolean;
  message: string;
  http?: string;
  statusCode: number;
}

export interface DeleteAccountConfirmRequest {
  otp: string;
}

export interface DeleteAccountConfirmResponse {
  success: boolean;
  message: string;
  http?: string;
  statusCode: number;
}

/**
 * Customer Stories API types
 */
export type CustomerStoryCategory = 
  | "BUSINESS" 
  | "TRANSPORT" 
  | "HEALTHCARE" 
  | "PERSONAL"
  | "OTHER";

export interface CustomerStoryRequest {
  title: string;
  description: string;
  category: CustomerStoryCategory;
  location: string;
  authorBio: string;
  authorProfilePic?: File;
  authorEmail: string;
  authorName: string;
  organisationName: string;
}

export interface CustomerStoryResponse {
  success: boolean;
  message: string;
  http?: string;
  statusCode: number;
}

export interface CustomerStoryAuthor {
  name: string;
  email: string;
  designation: string | null;
  organisationName: string | null;
  profilePicture: string | null;
  bio: string;
}

export interface CustomerStoryStats {
  views: number | null;
  likes: number;
  comments: number | null;
  shares: number | null;
}

export interface CustomerStory {
  id: string;
  title: string;
  description: string;
  category: CustomerStoryCategory;
  rating: number;
  location: string;
  author: CustomerStoryAuthor;
  stats: CustomerStoryStats;
  createdDate: string;
  updatedDate: string;
  isActive: boolean;
}

export interface CustomerStoriesResponse {
  content: CustomerStory[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  firstPage: boolean;
  lastPage: boolean;
}
/**
 * User Profile API types
 */
export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  bio?: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  profilePicture?: File;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    bio?: string;
    gender?: string;
    profilePicture?: string;
  };
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePasswordResponse {
  success: boolean;
  message: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface LoggedInUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  mobileNumber: string;
  profilePicture: string | null;
  isActive: boolean;
  bio: string | null;
  gender: string | null;
  joiningDate: string;
  role: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio?: string;
  profilePicture?: string;
  joinDate: string;
  isActive: boolean;
  lastLoginDate?: string;
}

export interface GetProfileResponse {
  success: boolean;
  message: string;
  user?: UserProfile;
}