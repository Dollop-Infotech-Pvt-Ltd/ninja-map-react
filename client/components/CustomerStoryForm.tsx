import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { post } from "@/lib/http";
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
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Star,
  MapPin,
  Briefcase,
  Heart,
  User,
  Mail,
  Building,
  FileText,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { CustomerStoryRequest, CustomerStoryResponse } from "@shared/api";

const customerStorySchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(50, "Description must be at least 50 characters").max(1000, "Description must be less than 1000 characters"),
  category: z.enum(["BUSINESS", "TRANSPORT", "HEALTHCARE", "PERSONAL", "OTHER"], {
    required_error: "Please select a category",
  }),
  location: z.string().min(2, "Location is required").max(50, "Location must be less than 50 characters"),
  authorBio: z.string().min(20, "Bio must be at least 20 characters").max(200, "Bio must be less than 200 characters"),
  authorEmail: z.string().email("Please enter a valid email address"),
  authorName: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  organisationName: z.string().min(2, "Organization name is required").max(100, "Organization name must be less than 100 characters"),
  authorProfilePic: z.any().optional(),
});

type CustomerStoryFormData = z.infer<typeof customerStorySchema>;

const categoryOptions = [
  { value: "BUSINESS", label: "Business", icon: Briefcase, description: "Business operations, logistics, efficiency" },
  { value: "TRANSPORT", label: "Transport", icon: MapPin, description: "Driving, delivery, ride-sharing" },
  { value: "HEALTHCARE", label: "Healthcare", icon: Heart, description: "Medical services, emergency response" },
  { value: "PERSONAL", label: "Personal", icon: User, description: "Daily navigation, personal use" },
  { value: "OTHER", label: "Other", icon: Star, description: "Other use cases and applications" },
];

interface CustomerStoryFormProps {
  onSuccess?: () => void;
}

export default function CustomerStoryForm({ onSuccess }: CustomerStoryFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<CustomerStoryFormData>({
    resolver: zodResolver(customerStorySchema),
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      location: "",
      authorBio: "",
      authorEmail: "",
      authorName: "",
      organisationName: "",
      authorProfilePic: undefined,
    },
  });

  const createCustomerStoryMutation = useMutation({
    mutationFn: async (data: CustomerStoryFormData): Promise<CustomerStoryResponse> => {
      const formData = new FormData();
      
      // Append all text fields
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('location', data.location);
      formData.append('authorBio', data.authorBio);
      formData.append('authorEmail', data.authorEmail);
      formData.append('authorName', data.authorName);
      formData.append('organisationName', data.organisationName);
      
      // Append file if provided
      if (selectedFile) {
        formData.append('authorProfilePic', selectedFile);
      }

      // Use the http utility with base URL like blog does
      const response = await post<CustomerStoryResponse>("/api/customer-stories/create", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.message=="Story submitted successfully. Pending admin approval.") {
        toast.success(data.message);
        
        // Clear all form data
        clearAllFormData();
        
        // Show additional feedback
        setTimeout(() => {
          toast.success("Form cleared! Ready for your next story.", {
            duration: 2000,
          });
        }, 500);
        
        // Show success state after clearing
        setTimeout(() => {
          setIsSubmitted(true);
        }, 400);
        
        onSuccess?.();
      } else {
        toast.error(data.message || "Failed to submit story");
      }
    },
    onError: (error: any) => {
      const message = error.message || "Failed to submit story. Please try again.";
      toast.error(message);
    },
  });

  const onSubmit = (data: CustomerStoryFormData) => {
    createCustomerStoryMutation.mutate(data);
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
    setPreviewImage(null);
    form.setValue('authorProfilePic', undefined);
    // Clear the actual file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearAllFormData = () => {
    setIsResetting(true);
    // Reset form data
    form.reset({
      title: "",
      description: "",
      category: undefined,
      location: "",
      authorBio: "",
      authorEmail: "",
      authorName: "",
      organisationName: "",
      authorProfilePic: undefined,
    });
    
    // Clear image preview and selected file
    setPreviewImage(null);
    setSelectedFile(null);
    
    // Clear the actual file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Small delay to show visual feedback
    setTimeout(() => {
      setIsResetting(false);
    }, 300);
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
          Story Submitted Successfully!
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          Thank you for sharing your experience with NINja Map. We'll review your story and get back to you soon.
        </p>
        <Button
          onClick={() => {
            setIsSubmitted(false);
            clearAllFormData();
          }}
          disabled={isResetting}
          variant="outline"
          className="border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
        >
          {isResetting ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-green-600 border-t-transparent rounded-full animate-spin" />
              Preparing Form...
            </div>
          ) : (
            "Submit Another Story"
          )}
        </Button>
      </motion.div>
    );
  }

  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 pointer-events-none" />
      <CardHeader className="text-center pb-8 relative">
        <div className="w-16 h-16 bg-gradient-to-br from-[#036A38] to-[#00984E] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Star className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold font-display text-[#00984E] mb-2">
          Share Your Success Story
        </CardTitle>
        <CardDescription className="text-lg max-w-2xl mx-auto leading-relaxed">
          Help other Nigerians discover how NINja Map can transform their navigation experience. 
          Your story could inspire thousands of users across the country.
        </CardDescription>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified Stories Only
          </Badge>
          <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
            <Star className="h-3 w-3 mr-1" />
            Featured Content
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 relative">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Story Title */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Tell Us Your Story
                </h3>
                <p className="text-muted-foreground">
                  Share the details of how NINja Map made a difference in your life or business
                </p>
              </div>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Story Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="How NINja Map Reduced Our Delivery Time by 40%"
                        className="h-12 text-base border-2 focus:border-green-400 transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Create a compelling title that highlights your key benefit or achievement
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Choose Your Category
                </h3>
                <p className="text-muted-foreground">
                  Select the category that best describes your use case
                </p>
              </div>
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-base border-2 focus:border-green-400">
                          <SelectValue placeholder="Select the category that best describes your use case" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#036A38] to-[#00984E] flex items-center justify-center">
                                <option.icon className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-sm text-muted-foreground">{option.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Story Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Your Story</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Our company was struggling with inefficient route planning and high fuel costs. Since implementing NINja Map for our delivery fleet, we've seen remarkable improvements in efficiency and customer satisfaction..."
                      className="min-h-32 text-base resize-none border-2 focus:border-green-400 transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Share your experience, challenges you faced, and how NINja Map helped solve them (50-1000 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Personal Information Section */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  About You
                </h3>
                <p className="text-muted-foreground">
                  Help readers connect with your story by sharing some background information
                </p>
              </div>
              
              {/* Location and Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Lagos, Nigeria"
                          className="h-12 text-base border-2 focus:border-green-400 transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="authorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Your Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          className="h-12 text-base border-2 focus:border-green-400 transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="authorEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          className="h-12 text-base border-2 focus:border-green-400 transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organisationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Organization
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="TechCorp Nigeria"
                          className="h-12 text-base border-2 focus:border-green-400 transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Author Bio */}
              <FormField
                control={form.control}
                name="authorBio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Professional Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Business Executive with 10+ years of experience in logistics and operations management..."
                        className="min-h-24 text-base resize-none border-2 focus:border-green-400 transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Brief professional background that adds credibility to your story (20-200 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Author Profile Picture */}
            <FormField
              control={form.control}
              name="authorProfilePic"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile Picture (Optional)
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {/* File Upload Area */}
                      <div className="relative">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={(e) => {
                            const files = e.target.files;
                            handleFileChange(files);
                            onChange(files);
                          }}
                          {...field}
                        />
                        <div className={`
                          border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
                          ${previewImage 
                            ? 'border-green-300 bg-green-50 dark:bg-green-900/10' 
                            : 'border-gray-300 hover:border-green-400 hover:bg-green-50/50 dark:border-gray-600 dark:hover:border-green-500 dark:hover:bg-green-900/10'
                          }
                        `}>
                          {previewImage ? (
                            <div className="space-y-4">
                              <div className="relative inline-block">
                                <img
                                  src={previewImage}
                                  alt="Profile preview"
                                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                                />
                                <button
                                  type="button"
                                  onClick={removeImage}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                              <div className="text-sm">
                                <p className="font-medium text-green-600 dark:text-green-400">
                                  {selectedFile?.name}
                                </p>
                                <p className="text-muted-foreground">
                                  {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Click to change image
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                                <Upload className="h-6 w-6 text-gray-400" />
                              </div>
                              <div>
                                <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                                  Choose a profile picture
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Drag and drop or click to browse
                                </p>
                              </div>
                              <div className="flex items-center justify-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  <ImageIcon className="h-3 w-3 mr-1" />
                                  JPG, PNG
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Max 5MB
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload a professional photo to accompany your story. This helps build trust and credibility with readers.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="pt-8 border-t border-border/50">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={createCustomerStoryMutation.isPending}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-[#036A38] to-[#00984E] hover:from-[#025530] hover:to-[#007A40] shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                >
                  {createCustomerStoryMutation.isPending ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting Your Story...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Send className="h-5 w-5" />
                      Share Your Story with Nigeria
                    </div>
                  )}
                </Button>
              </motion.div>
            </div>
          </form>
        </Form>

        {/* Privacy Notice */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Privacy & Usage</p>
              <p>
                Your story may be featured on our website and marketing materials. We'll contact you before 
                publishing and you can request changes or removal at any time. Your email will not be shared publicly.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}