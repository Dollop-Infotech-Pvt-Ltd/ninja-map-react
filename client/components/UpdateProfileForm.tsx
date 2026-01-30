import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "@/lib/userApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Save,
  X,
  Edit3,
  CheckCircle,
  AlertTriangle,
  Loader,
  Upload,
  Camera,
  Users
} from "lucide-react";
import { useSmartToast } from "@/hooks/use-smart-toast";
import { UpdateProfileResponse } from "@shared/api";

const updateProfileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50, "Last name must be less than 50 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"], {
    required_error: "Please select a gender",
  }).optional(),
  profilePicture: z.any().optional(),
  headerImage: z.any().optional(),
});

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

interface UpdateProfileFormProps {
  userData: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    bio?: string | null;
    gender?: string | null;
    profilePicture?: string | null;
    headerImage?: string | null;
    fullName: string;
    isActive: boolean;
    role: string;
    joiningDate: string;
  };
  isEditing: boolean;
  onEditToggle: (editing: boolean) => void;
  onProfileUpdate?: () => Promise<void>;
}

export default function UpdateProfileForm({ userData, isEditing, onEditToggle, onProfileUpdate }: UpdateProfileFormProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(userData.profilePicture || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewHeaderImage, setPreviewHeaderImage] = useState<string | null>(userData.headerImage || null);
  const [selectedHeaderFile, setSelectedHeaderFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const headerFileInputRef = React.useRef<HTMLInputElement>(null);
  const toast = useSmartToast();

  // Update preview images when userData changes
  React.useEffect(() => {
    setPreviewImage(userData.profilePicture || null);
    setPreviewHeaderImage(userData.headerImage || null);
  }, [userData.profilePicture, userData.headerImage]);

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      bio: userData.bio || "",
      gender: (userData.gender as "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY") || undefined,
      profilePicture: undefined,
      headerImage: undefined,
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileFormData): Promise<UpdateProfileResponse> => {
      return await updateUserProfile({
        id: userData.id,
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        gender: data.gender,
        profilePicture: selectedFile || undefined,
      });
    },
    onSuccess: async (data) => {
      if (data.success) {
        toast.success("Profile updated successfully!");
        onEditToggle(false);
        
        // Update preview image if new profile picture was uploaded
        if (data.user?.profilePicture) {
          setPreviewImage(data.user.profilePicture);
        }
        
        // Refresh the user data to update the profile overview section
        if (onProfileUpdate) {
          try {
            await onProfileUpdate();
          } catch (error) {
            // Failed to refresh user data
          }
        }
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    },
    onError: (error: any) => {
      const message = error.message || "Failed to update profile. Please try again.";
      toast.error(message);
    },
  });

  const onSubmit = (data: UpdateProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewImage(userData.profilePicture || null);
    form.setValue('profilePicture', undefined);
    // Clear the actual file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    form.reset({
      firstName: userData.firstName,
      lastName: userData.lastName,
      bio: userData.bio || "",
      gender: (userData.gender as "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY") || undefined,
      profilePicture: undefined,
    });
    
    // Reset image preview
    setPreviewImage(userData.profilePicture || null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    onEditToggle(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and profile details
            </CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditToggle(true)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-lg">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand/20 to-brand/40 flex items-center justify-center overflow-hidden">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Profile preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-brand" />
                  )}
                </div>
                {isEditing && (
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-background border-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium mb-1">Profile Picture</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload a new profile picture. Max size: 5MB
                </p>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New
                    </Button>
                    {(previewImage || selectedFile) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing}
                        placeholder="Enter your first name"
                        className={!isEditing ? "bg-muted/50" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing}
                        placeholder="Enter your last name"
                        className={!isEditing ? "bg-muted/50" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={!isEditing}
                  >
                    <FormControl>
                      <SelectTrigger className={!isEditing ? "bg-muted/50" : ""}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                      <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={!isEditing}
                      placeholder="Tell us a bit about yourself..."
                      className={`min-h-[100px] resize-none ${!isEditing ? "bg-muted/50" : ""}`}
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description about yourself (max 500 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Account Information - Read Only */}
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg border">
              <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Account Information (Read Only)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{userData.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Mobile Number:</span>
                  <p className="font-medium">{userData.mobileNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Full Name:</span>
                  <p className="font-medium">{userData.fullName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Account Status:</span>
                  <p className="font-medium">
                    {userData.isActive ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Role:</span>
                  <p className="font-medium">{userData.role}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Member Since:</span>
                  <p className="font-medium">
                    {new Date(userData.joiningDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 pt-4 border-t"
              >
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex-1 sm:flex-none"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateProfileMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </motion.div>
            )}

            {/* Success/Error Messages */}
            {updateProfileMutation.isError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {updateProfileMutation.error?.message || "Failed to update profile. Please try again."}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}