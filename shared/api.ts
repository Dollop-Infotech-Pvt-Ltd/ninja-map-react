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

// Grid API types
export interface GridCellCoordinates {
  latitude: number;
  longitude: number;
}

export interface GridCellBounds {
  bottomLeft: GridCellCoordinates;
  bottomRight: GridCellCoordinates;
  topRight: GridCellCoordinates;
  topLeft: GridCellCoordinates;
  center: GridCellCoordinates;
}

export interface GridCellInfo {
  rowIndex: number;
  colIndex: number;
}

export interface GridApiResponse {
  gridCell: GridCellInfo & GridCellBounds & {
    cellId: string;
    areaSquareMeters: number;
  };
  blockCode: string;
  center: GridCellCoordinates;
}

// Alternative response format that might come from the API
export interface GridApiArrayResponse {
  cellsWithCodes: GridApiResponse[];
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
  phoneNumber: string;
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

/**
 * Grid Generation API types
 */
export interface GridBounds {
  leftBottom: {
    latitude: number;
    longitude: number;
  };
  leftTop: {
    latitude: number;
    longitude: number;
  };
  rightTop: {
    latitude: number;
    longitude: number;
  };
  rightBottom: {
    latitude: number;
    longitude: number;
  };
}

export interface GridCell {
  row: number;
  col: number;
  bottomLeft: {
    latitude: number;
    longitude: number;
  };
  bottomRight: {
    latitude: number;
    longitude: number;
  };
  topLeft: {
    latitude: number;
    longitude: number;
  };
  topRight: {
    latitude: number;
    longitude: number;
  };
  polyline: Array<{
    latitude: number;
    longitude: number;
  }>;
  center: {
    latitude: number;
    longitude: number;
  };
  blockCode: string;
  cellId: string;
  areaSquareMeters: number;
  polylineAsArray: number[][];
}

export interface GridGenerationResponse {
  gridCells: GridCell[];
  totalRows: number;
  totalColumns: number;
  totalHeightMeters: number;
  totalWidthMeters: number;
  gridDimensions: string;
  totalCells: number;
  summary: string;
  totalAreaSquareMeters: number;
}

/**
 * New Routing API types
 */
export interface RouteLocation {
  type: string;
  lat: number;
  lon: number;
  side_of_street?: string;
  original_index: number;
}

export interface RouteManeuver {
  type: number;
  instruction: string;
  verbal_succinct_transition_instruction?: string;
  verbal_pre_transition_instruction?: string;
  verbal_post_transition_instruction?: string;
  verbal_transition_alert_instruction?: string;
  verbal_multi_cue?: boolean;
  time: number;
  length: number;
  cost: number;
  begin_shape_index: number;
  end_shape_index: number;
  rough?: boolean;
  street_names?: string[];
  travel_mode: string;
  travel_type: string;
}

export interface RouteLegSummary {
  has_time_restrictions: boolean;
  has_toll: boolean;
  has_highway: boolean;
  has_ferry: boolean;
  min_lat: number;
  min_lon: number;
  max_lat: number;
  max_lon: number;
  time: number;
  length: number;
  cost: number;
}

export interface RouteLeg {
  maneuvers: RouteManeuver[];
  summary: RouteLegSummary;
  shape: string;
}

export interface RouteTrip {
  locations: RouteLocation[];
  legs: RouteLeg[];
  summary: RouteLegSummary;
  status_message: string;
  status: number;
  units: string;
  language: string;
}

export interface RouteRequest {
  from: {
    lat: number;
    lon: number;
    search_term: string;
    search_radius: number;
  };
  via?: Array<{
    lat: number;
    lon: number;
    search_term: string;
    search_radius: number;
  }>;
  to: {
    lat: number;
    lon: number;
    search_term: string;
    search_radius: number;
  };
  costing: string;
  use_ferry: number;
  ferry_cost: number;
  alternates?: number;
}

export interface RouteResponse {
  trip: RouteTrip;
  trips?: RouteTrip[];
  alternates?: Array<{
    trip: RouteTrip;
  }>;
}

/**
 * Business Categories API types
 */
export interface BusinessSubCategory {
  id: string;
  subCategoryName: string;
  isActive: boolean;
  createdDate: string;
  updatedDate: string;
}

export interface BusinessCategory {
  id: string;
  categoryName: string;
  categoryPicture: string;
  isActive: boolean;
  createdDate: string;
  updatedDate: string;
  subCategories: BusinessSubCategory[];
  hasSubCategories: boolean;
  subCategoryCount: number;
}

export interface CategoriesApiResponse {
  message: string;
  data: {
    content: BusinessCategory[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    numberOfElements: number;
    firstPage: boolean;
    lastPage: boolean;
  };
  statusCode: number;
}