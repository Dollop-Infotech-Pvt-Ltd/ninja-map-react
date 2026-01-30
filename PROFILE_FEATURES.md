# Profile Management Features

This document describes the newly implemented profile management features for the NINja Map application.

## Features Implemented

### 1. Profile Page (`/profile`)
- **Location**: `client/pages/Profile.tsx`
- **Route**: Protected route accessible at `/profile`
- **Features**:
  - Tabbed interface with Profile, Security, and Settings sections
  - Profile overview card with user information
  - Quick edit functionality
  - Responsive design with mobile support

### 2. Update Profile Form
- **Location**: `client/components/UpdateProfileForm.tsx`
- **Features**:
  - Edit/view mode toggle
  - Profile picture upload with preview
  - Form validation using Zod schema
  - Real-time form validation
  - File upload support (images up to 5MB)
  - Success/error handling with toast notifications

### 3. Update Password Form
- **Location**: `client/components/UpdatePasswordForm.tsx`
- **Features**:
  - Current password verification
  - New password with strength indicator
  - Password confirmation validation
  - Show/hide password toggles
  - Security tips section
  - Success/error handling

### 4. API Endpoints
- **Location**: `server/routes/profile.ts`
- **Endpoints**:
  - `GET /api/users/profile` - Get user profile data
  - `PUT /api/users/profile` - Update profile information
  - `PUT /api/users/password` - Update user password

## UI Components Used

### Existing Components
- `Card`, `CardContent`, `CardHeader`, `CardTitle` - Layout structure
- `Button` - Actions and navigation
- `Input`, `Textarea` - Form inputs
- `Form`, `FormField`, `FormItem`, `FormLabel`, `FormMessage` - Form handling
- `Badge` - Status indicators
- `Separator` - Visual dividers
- `Alert`, `AlertDescription` - Error/success messages

### Custom Components
- `UpdateProfileForm` - Profile information editing
- `UpdatePasswordForm` - Password change functionality
- `AnimatedSection` - Smooth animations
- `Header`, `Footer` - Page layout

## Design Patterns

### Form Handling
- React Hook Form with Zod validation
- Unified error handling and display
- Smart toast notifications
- Loading states and disabled inputs

### UI/UX Patterns
- Glass-morphism design with backdrop blur
- Consistent rounded corners (rounded-xl)
- Brand color scheme integration
- Responsive grid layouts
- Smooth animations with Framer Motion

### State Management
- Local component state for UI interactions
- React Query for API calls and caching
- Form state managed by React Hook Form
- Toast notifications for user feedback

## File Structure

```
client/
├── pages/
│   └── Profile.tsx                 # Main profile page
├── components/
│   ├── UpdateProfileForm.tsx       # Profile editing form
│   ├── UpdatePasswordForm.tsx      # Password change form
│   └── ui/                        # Reusable UI components
└── hooks/
    ├── use-smart-toast.tsx        # Toast notification hook
    └── use-theme.tsx              # Theme management

server/
└── routes/
    └── profile.ts                 # Profile API endpoints

shared/
└── api.ts                        # Shared TypeScript types
```

## Usage

### Accessing the Profile Page
1. User must be authenticated (protected route)
2. Navigate to `/profile` or click "Profile" in header
3. Page displays user information and editing options

### Editing Profile
1. Click "Edit Profile" button or switch to Profile tab
2. Toggle edit mode to modify fields
3. Upload profile picture (optional)
4. Save changes or cancel to revert

### Changing Password
1. Switch to "Security" tab
2. Enter current password
3. Enter new password (with strength indicator)
4. Confirm new password
5. Submit to update password

## Security Considerations

### Client-Side
- Form validation prevents invalid data submission
- Password strength requirements enforced
- File upload validation (type and size limits)
- Protected routes require authentication

### Server-Side (Mock Implementation)
- Input validation on all endpoints
- Password verification for updates
- Error handling for edge cases
- Structured API responses

## Future Enhancements

1. **Real Authentication**: Replace mock endpoints with actual user authentication
2. **File Storage**: Implement proper file upload and storage for profile pictures
3. **Email Verification**: Add email change verification process
4. **Account Settings**: Expand settings tab with notification preferences
5. **Profile Visibility**: Add privacy controls for profile information
6. **Activity Log**: Track profile changes and login history

## Testing

The implementation includes:
- TypeScript type safety
- Form validation testing scenarios
- Error handling for network failures
- Responsive design testing
- Accessibility considerations

## Dependencies

### New Dependencies
- All features use existing dependencies
- No additional packages required

### Key Dependencies Used
- `react-hook-form` - Form management
- `zod` - Schema validation
- `@tanstack/react-query` - API state management
- `framer-motion` - Animations
- `lucide-react` - Icons
- `sonner` - Toast notifications