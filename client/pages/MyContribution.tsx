import { useState, useEffect } from 'react';
import { ChevronDown, MapPin, Building2, MapPinOff, AlertTriangle, Calendar, Info, ArrowLeft, ChevronRight, Utensils, ShoppingBag, Heart, Car, Briefcase, GraduationCap, Plane, Film, Users, MoreHorizontal, X, Image as ImageIcon, Edit2, Loader2, Navigation, Camera, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { fetchBusinessCategories } from '@/lib/businessCategoriesApi';
import { createBusiness, convertTo24Hour, base64ToFile } from '@/lib/businessApi';
import { submitActivityReport, convertActivityTypeToAPI, base64ToFileForReport } from '@/lib/activityReportApi';
import type { BusinessCategory, CreateBusinessRequest, BusinessHoursRequest } from '@shared/api';
import { useLoggedInUser } from '@/hooks/use-logged-in-user';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Picker from 'react-mobile-picker';

type ContributionType = 'place' | 'business' | 'fix' | 'activity' | null;
type ActivityType = 'traffic' | 'accident' | 'closure' | 'event' | 'other' | null;
type PlaceType = 'road' | 'landmark' | 'public' | null;
type BusinessType = 'register' | 'claim' | null;
type FixType = 'edit-details' | 'move-pin' | 'correct-name' | null;

// Helper function to get category icon based on category name
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('food') || name.includes('drink')) {
    return Utensils;
  } else if (name.includes('retail') || name.includes('shopping')) {
    return ShoppingBag;
  } else if (name.includes('health') || name.includes('wellness')) {
    return Heart;
  } else if (name.includes('automotive') || name.includes('transport')) {
    return Car;
  } else if (name.includes('finance') || name.includes('service')) {
    return Briefcase;
  } else if (name.includes('education')) {
    return GraduationCap;
  } else if (name.includes('travel') || name.includes('hospitality')) {
    return Plane;
  } else if (name.includes('entertainment') || name.includes('lifestyle')) {
    return Film;
  } else if (name.includes('public') || name.includes('community')) {
    return Users;
  } else {
    return MoreHorizontal;
  }
};

// Validation schema for contact details using Zod
const contactDetailsSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^[789][01]\d{8}$/,
      'Please enter a valid Nigerian phone number starting with 7, 8, or 9 (e.g., 8012345678)'
    ),
  website: z
    .string()
    .url('Please enter a valid website URL')
    .optional()
    .or(z.literal(''))
});

type ContactDetailsFormData = z.infer<typeof contactDetailsSchema>;

export default function MyContribution() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useLoggedInUser();
  const [expandedSection, setExpandedSection] = useState<ContributionType>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>(null);
  const [selectedPlaceType, setSelectedPlaceType] = useState<PlaceType>(null);
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType>(null);
  const [selectedFixType, setSelectedFixType] = useState<FixType>(null);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [businessStep, setBusinessStep] = useState(1); // 1: profile, 2: location, 3: contact, 4: hours, 5: photos, 6: review
  
  // Business categories state
  const [businessCategories, setBusinessCategories] = useState<BusinessCategory[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  
  const [businessData, setBusinessData] = useState({
    name: '',
    category: '',
    categoryId: '', // Store the subcategory ID for API
    phone: '',
    website: '',
    coordinates: null as { lat: number; lng: number } | null,
    hours: {} as Record<string, { open: string; close: string; closed: boolean; open24: boolean }>,
    photos: [] as string[]
  });
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [tempHours, setTempHours] = useState({ open: '09:00 AM', close: '05:00 PM', open24: false, closed: false });
  const [showTimePicker, setShowTimePicker] = useState<'open' | 'close' | null>(null);
  const [showActivityMap, setShowActivityMap] = useState(false);
  const [activityLocation, setActivityLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [activityLocationInput, setActivityLocationInput] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [activityPhoto, setActivityPhoto] = useState<string | null>(null);
  const [activityDescription, setActivityDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmittingBusiness, setIsSubmittingBusiness] = useState(false);
  const [businessSubmissionError, setBusinessSubmissionError] = useState<string | null>(null);
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);
  const [activitySubmissionError, setActivitySubmissionError] = useState<string | null>(null);

  // Listen for messages from the map iframe
  useEffect(() => {
    const handleMapMessage = (event: MessageEvent) => {
      // Only accept messages from our own origin for security
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'MAP_CLICK' && event.data.location) {
        const { lat, lng, address } = event.data.location;
        setActivityLocation({
          lat,
          lng,
          address: address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        });
      }
    };

    window.addEventListener('message', handleMapMessage);
    return () => window.removeEventListener('message', handleMapMessage);
  }, []);

  // Check if coordinates are within Nigeria bounds
  const isInNigeria = (lat: number, lng: number): boolean => {
    // Nigeria approximate bounds
    const nigeriaBounds = {
      north: 13.9,
      south: 4.3,
      west: 2.7,
      east: 14.7
    };
    
    return lat >= nigeriaBounds.south && 
           lat <= nigeriaBounds.north && 
           lng >= nigeriaBounds.west && 
           lng <= nigeriaBounds.east;
  };

  // Get user's current location or use Lagos as default
  const openMapWithLocation = () => {
    setIsGettingLocation(true);
    
    // Default to Lagos coordinates (only used if location is outside Nigeria or fails)
    const lagosDefault = {
      lat: 6.5244,
      lng: 3.3792,
      address: 'Lagos, Nigeria'
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Check if location is within Nigeria
          if (isInNigeria(latitude, longitude)) {
            // Use actual location if in Nigeria
            setActivityLocation({
              lat: latitude,
              lng: longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            });
            // Don't update input field - let user select from map
          } else {
            // Use Lagos if outside Nigeria
            setActivityLocation(lagosDefault);
          }
          
          setIsGettingLocation(false);
          setShowActivityMap(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use Lagos as default if location fails
          setActivityLocation(lagosDefault);
          setIsGettingLocation(false);
          setShowActivityMap(true);
        },
        {
          timeout: 5000,
          enableHighAccuracy: true
        }
      );
    } else {
      // Use Lagos as default if geolocation not supported
      setActivityLocation(lagosDefault);
      setIsGettingLocation(false);
      setShowActivityMap(true);
    }
  };

  // Contact details form setup
  const contactForm = useForm<ContactDetailsFormData>({
    resolver: zodResolver(contactDetailsSchema),
    defaultValues: {
      phone: '',
      website: ''
    }
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = contactForm;

  // Load business categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      setIsCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const categories = await fetchBusinessCategories();
        setBusinessCategories(categories);
      } catch (error) {
        console.error('Failed to load business categories:', error);
        setCategoriesError('Failed to load categories. Please try again.');
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  const toggleSection = (section: ContributionType) => {
    setExpandedSection(expandedSection === section ? null : section);
    if (section !== 'activity') {
      setSelectedActivity(null);
      setActivityLocationInput('');
      setActivityDescription('');
      setActivityPhoto(null);
      setActivityLocation(null);
      setIsAnonymous(false);
      setActivitySubmissionError(null);
    }
    if (section !== 'place') {
      setSelectedPlaceType(null);
    }
    if (section !== 'business') {
      setSelectedBusinessType(null);
    }
    if (section !== 'fix') {
      setSelectedFixType(null);
    }
  };

  // Function to handle business submission
  const handleBusinessSubmission = async () => {
    // Check if user is authenticated
    if (!user) {
      setBusinessSubmissionError('Please log in to create a business listing');
      return;
    }

    if (!businessData.coordinates) {
      setBusinessSubmissionError('Please set your business location on the map');
      return;
    }

    if (!businessData.categoryId) {
      setBusinessSubmissionError('Please select a business category');
      return;
    }

    setIsSubmittingBusiness(true);
    setBusinessSubmissionError(null);

    try {
      // Convert business hours to API format
      const businessHours: BusinessHoursRequest[] = [];
      const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      
      daysOfWeek.forEach(day => {
        const dayKey = day.charAt(0) + day.slice(1).toLowerCase(); // Convert to "Sunday", "Monday", etc.
        const hours = businessData.hours[dayKey];
        
        if (hours) {
          businessHours.push({
            weekday: day,
            openingTime: hours.open24 ? undefined : convertTo24Hour(hours.open),
            closingTime: hours.open24 ? undefined : convertTo24Hour(hours.close),
            isClosed: hours.closed,
            isOpen24Hours: hours.open24
          });
        } else {
          // Default to closed if no hours set
          businessHours.push({
            weekday: day,
            isClosed: true,
            isOpen24Hours: false
          });
        }
      });

      // Convert base64 images to File objects
      const businessImages: File[] = [];
      businessData.photos.forEach((photo, index) => {
        if (photo.startsWith('data:')) {
          const file = base64ToFile(photo, `business-photo-${index + 1}.jpg`);
          businessImages.push(file);
        }
      });

      // Create business request
      const createRequest: CreateBusinessRequest = {
        businessName: businessData.name,
        subCategoryId: businessData.categoryId,
        address: `${businessData.coordinates.lat.toFixed(6)}, ${businessData.coordinates.lng.toFixed(6)}`, // Use coordinates as address for now
        latitude: businessData.coordinates.lat,
        longitude: businessData.coordinates.lng,
        phoneNumber: `+234${businessData.phone}`,
        website: businessData.website || undefined,
        businessHours,
        businessImages: businessImages.length > 0 ? businessImages : undefined
      };

      const result = await createBusiness(createRequest);

      if (result.success) {
        // Success - show success message and reset form
        alert(`Business "${businessData.name}" created successfully!`);
        
        // Reset form
        setSelectedBusinessType(null);
        setBusinessStep(1);
        setBusinessData({
          name: '',
          category: '',
          categoryId: '',
          phone: '',
          website: '',
          coordinates: null,
          hours: {},
          photos: []
        });
        
        // Reset contact form
        contactForm.reset();
      } else {
        setBusinessSubmissionError(result.message);
      }
    } catch (error) {
      console.error('Error submitting business:', error);
      setBusinessSubmissionError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmittingBusiness(false);
    }
  };

  // Function to handle activity report submission
  const handleActivitySubmission = async () => {
    // Check if user is authenticated
    if (!user) {
      setActivitySubmissionError('Please log in to submit a report');
      return;
    }

    if (!selectedActivity) {
      setActivitySubmissionError('Please select an activity type');
      return;
    }

    if (!activityDescription.trim()) {
      setActivitySubmissionError('Please provide a description');
      return;
    }

    if (!activityLocation) {
      setActivitySubmissionError('Please set the location for your report');
      return;
    }

    setIsSubmittingActivity(true);
    setActivitySubmissionError(null);

    try {
      // Convert photo to File object if provided
      let reportPicture: File | undefined;
      if (activityPhoto && activityPhoto.startsWith('data:')) {
        reportPicture = base64ToFileForReport(activityPhoto, 'activity-report.jpg');
      }

      // Create activity report request
      const reportRequest = {
        reportType: convertActivityTypeToAPI(selectedActivity),
        comment: activityDescription,
        latitude: activityLocation.lat,
        longitude: activityLocation.lng,
        location: activityLocation.address,
        reportPicture,
        hideName: isAnonymous
      };

      const result = await submitActivityReport(reportRequest);

      if (result.success) {
        // Success - show success message and reset form
        alert(`Report submitted successfully!${isAnonymous ? ' (Anonymous)' : ''}`);
        
        // Reset form
        setSelectedActivity(null);
        setActivityLocationInput('');
        setActivityDescription('');
        setActivityPhoto(null);
        setActivityLocation(null);
        setIsAnonymous(false);
      } else {
        setActivitySubmissionError(result.message);
      }
    } catch (error) {
      console.error('Error submitting activity report:', error);
      setActivitySubmissionError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmittingActivity(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur">
          <div className="container py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-xl font-semibold text-foreground">Contribute</h1>
              </div>
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Help
              </button>
            </div>
          </div>
        </div>

        {/* Content - Centered and Full Height */}
        <div className="flex-1 flex items-start justify-center py-6 px-4">
        <div className="w-full max-w-3xl space-y-4">
          {/* Welcome Message */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Help Improve the Map</h2>
            <p className="text-muted-foreground">Your contributions make our maps better for everyone</p>
          </div>
          {/* Add Missing Place */}
          <div className="panel-green overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <button
              onClick={() => toggleSection('place')}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#036A38]/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-[#036A38]" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Add Missing place</h3>
                  <p className="text-sm text-muted-foreground">House, road, landmarks...</p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  expandedSection === 'place' && "rotate-180"
                )}
              />
            </button>
            {expandedSection === 'place' && (
              <div className="animate-slide-up">
                {/* Place Type Options */}
                <div className="border-t border-border/40">
                  {/* Add Road */}
                  <button
                    onClick={() => setSelectedPlaceType(selectedPlaceType === 'road' ? null : 'road')}
                    className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-muted/5 transition-colors border-b border-border/20"
                  >
                    <div>
                      <h4 className="font-medium text-foreground text-sm">Add Road</h4>
                      <p className="text-xs text-muted-foreground">Missing or new roads/paths..</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {selectedPlaceType === 'road' && (
                    <div className="px-4 pb-4 pt-2 space-y-3 bg-muted/5">
                      <Input placeholder="Road name" />
                      <Input placeholder="Start location" />
                      <Input placeholder="End location" />
                      <select className="w-full h-12 rounded-xl border border-input bg-background/80 backdrop-blur-sm px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand hover:border-border/80 hover:bg-background/90">
                        <option value="">Road type</option>
                        <option value="highway">Highway</option>
                        <option value="main-road">Main Road</option>
                        <option value="street">Street</option>
                        <option value="path">Path/Trail</option>
                      </select>
                      <textarea
                        className="w-full rounded-xl border border-input bg-background/80 backdrop-blur-sm px-4 py-3 text-sm font-medium transition-all duration-200 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand hover:border-border/80 hover:bg-background/90 min-h-[80px]"
                        placeholder="Additional details..."
                      />
                      <Button className="w-full bg-[#036A38] hover:bg-[#025C31] text-white">
                        Submit
                      </Button>
                    </div>
                  )}

                  {/* Add Landmark */}
                  <button
                    onClick={() => setSelectedPlaceType(selectedPlaceType === 'landmark' ? null : 'landmark')}
                    className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-muted/5 transition-colors border-b border-border/20"
                  >
                    <div>
                      <h4 className="font-medium text-foreground text-sm">Add Landmark</h4>
                      <p className="text-xs text-muted-foreground">Parks, monuments, worship centers..</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {selectedPlaceType === 'landmark' && (
                    <div className="px-4 pb-4 pt-2 space-y-3 bg-muted/5">
                      <Input placeholder="Landmark name" />
                      <Input placeholder="Address/Location" />
                      <select className="w-full h-12 rounded-xl border border-input bg-background/80 backdrop-blur-sm px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand hover:border-border/80 hover:bg-background/90">
                        <option value="">Landmark type</option>
                        <option value="park">Park</option>
                        <option value="monument">Monument</option>
                        <option value="worship">Worship Center</option>
                        <option value="historical">Historical Site</option>
                        <option value="other">Other</option>
                      </select>
                      <textarea
                        className="w-full rounded-xl border border-input bg-background/80 backdrop-blur-sm px-4 py-3 text-sm font-medium transition-all duration-200 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand hover:border-border/80 hover:bg-background/90 min-h-[80px]"
                        placeholder="Description..."
                      />
                      <Button className="w-full bg-[#036A38] hover:bg-[#025C31] text-white">
                        Submit
                      </Button>
                    </div>
                  )}

                  {/* Add Public Places */}
                  <button
                    onClick={() => setSelectedPlaceType(selectedPlaceType === 'public' ? null : 'public')}
                    className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-muted/5 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-foreground text-sm">Add Public places</h4>
                      <p className="text-xs text-muted-foreground">Hospital, police station, bus stop, govt office..</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {selectedPlaceType === 'public' && (
                    <div className="px-4 pb-4 pt-2 space-y-3 bg-muted/5">
                      <Input placeholder="Place name" />
                      <Input placeholder="Address" />
                      <select className="w-full h-12 rounded-xl border border-input bg-background/80 backdrop-blur-sm px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand hover:border-border/80 hover:bg-background/90">
                        <option value="">Place type</option>
                        <option value="hospital">Hospital</option>
                        <option value="police">Police Station</option>
                        <option value="bus-stop">Bus Stop</option>
                        <option value="govt-office">Government Office</option>
                        <option value="school">School</option>
                        <option value="post-office">Post Office</option>
                        <option value="other">Other</option>
                      </select>
                      <Input placeholder="Contact number (optional)" />
                      <textarea
                        className="w-full rounded-xl border border-input bg-background/80 backdrop-blur-sm px-4 py-3 text-sm font-medium transition-all duration-200 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand hover:border-border/80 hover:bg-background/90 min-h-[80px]"
                        placeholder="Additional information..."
                      />
                      <Button className="w-full bg-[#036A38] hover:bg-[#025C31] text-white">
                        Submit
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Add Business */}
          <div className="panel-green overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <button
              onClick={() => toggleSection('business')}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#036A38]/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-[#036A38]" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Add your Business</h3>
                  <p className="text-sm text-muted-foreground">Create a business listing</p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  expandedSection === 'business' && "rotate-180"
                )}
              />
            </button>
            {expandedSection === 'business' && (
              <div className="animate-slide-up">
                {/* Business Type Options */}
                <div className="border-t border-border/40">
                  {/* Register Business */}
                  <button
                    onClick={() => setSelectedBusinessType(selectedBusinessType === 'register' ? null : 'register')}
                    className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-muted/5 transition-colors border-b border-border/20"
                  >
                    <div>
                      <h4 className="font-medium text-foreground text-sm">Register Business</h4>
                      <p className="text-xs text-muted-foreground">Add a new shop, restaurant, or service to the map</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {selectedBusinessType === 'register' && (
                    <div className="px-4 pb-4 pt-2 space-y-4 bg-muted/5">
                      {/* Step 1: Business Profile */}
                      {businessStep === 1 && !showCategorySelector && (
                        <>
                          <div className="space-y-2">
                            <h4 className="text-lg font-semibold text-foreground">Make your Business Profile</h4>
                            <p className="text-sm text-muted-foreground">Add your business details to help customers find and trust you</p>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm text-muted-foreground mb-1 block">Business name</label>
                              <Input 
                                placeholder="Enter business name" 
                                value={businessData.name}
                                onChange={(e) => setBusinessData({...businessData, name: e.target.value})}
                              />
                            </div>
                            
                            <div>
                              <label className="text-sm text-muted-foreground mb-1 block">Business category</label>
                              <button
                                onClick={() => setShowCategorySelector(true)}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-input bg-background/80 hover:bg-background/90 transition-all"
                              >
                                <span className={cn(
                                  "text-sm font-medium",
                                  businessData.category ? "text-foreground" : "text-muted-foreground"
                                )}>
                                  {businessData.category || 'Select category'}
                                </span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </div>
                          </div>

                          <div className="pt-2 text-xs text-muted-foreground">
                            By continuing, you agree to the Business Profile{' '}
                            <span className="text-[#036A38] cursor-pointer hover:underline">Terms of Service</span>. 
                            Your business details may be reviewed and published on NINja Map. Read our{' '}
                            <span className="text-[#036A38] cursor-pointer hover:underline">Privacy Policy</span> to 
                            understand how your data is used.
                          </div>

                          <Button 
                            className="w-full bg-[#036A38] hover:bg-[#025C31] text-white"
                            disabled={!businessData.name || !businessData.category}
                            onClick={() => setBusinessStep(2)}
                          >
                            Next
                          </Button>
                        </>
                      )}

                      {/* Category Selector */}
                      {showCategorySelector && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 mb-4">
                            <button
                              onClick={() => setShowCategorySelector(false)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <ArrowLeft className="h-5 w-5" />
                            </button>
                            <h4 className="text-lg font-semibold text-foreground">Business category</h4>
                          </div>

                          <Input 
                            placeholder="Search categories..." 
                            className="mb-2"
                          />

                          {/* Loading State */}
                          {isCategoriesLoading && (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="h-6 w-6 animate-spin text-[#036A38]" />
                              <span className="ml-2 text-sm text-muted-foreground">Loading categories...</span>
                            </div>
                          )}

                          {/* Error State */}
                          {categoriesError && (
                            <div className="text-center py-4">
                              <p className="text-sm text-red-500 mb-2">{categoriesError}</p>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setIsCategoriesLoading(true);
                                  setCategoriesError(null);
                                  fetchBusinessCategories()
                                    .then(setBusinessCategories)
                                    .catch(() => setCategoriesError('Failed to load categories. Please try again.'))
                                    .finally(() => setIsCategoriesLoading(false));
                                }}
                              >
                                Retry
                              </Button>
                            </div>
                          )}

                          {/* Categories List */}
                          {!isCategoriesLoading && !categoriesError && (
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                              {businessCategories.map((category) => {
                                const IconComponent = getCategoryIcon(category.categoryName);
                                const isExpanded = expandedCategory === category.id;
                                
                                return (
                                  <div key={category.id} className="border border-border/40 rounded-xl overflow-hidden">
                                    <button
                                      onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                                      className="w-full flex items-center justify-between p-4 hover:bg-muted/5 transition-colors"
                                    >
                                      <div className="flex items-center gap-3">
                                        {category.categoryPicture ? (
                                          <img 
                                            src={category.categoryPicture} 
                                            alt={category.categoryName}
                                            className="h-5 w-5 object-contain"
                                          />
                                        ) : (
                                          <IconComponent className="h-5 w-5 text-[#036A38]" />
                                        )}
                                        <span className="text-sm font-medium text-foreground">{category.categoryName}</span>
                                        {category.hasSubCategories && (
                                          <span className="text-xs text-muted-foreground">({category.subCategoryCount})</span>
                                        )}
                                      </div>
                                      {category.hasSubCategories && (
                                        <ChevronDown
                                          className={cn(
                                            "h-4 w-4 text-muted-foreground transition-transform",
                                            isExpanded && "rotate-180"
                                          )}
                                        />
                                      )}
                                    </button>
                                    
                                    {/* If no subcategories, allow direct selection */}
                                    {!category.hasSubCategories && (
                                      <div className="px-4 pb-2">
                                        <button
                                          onClick={() => {
                                            setBusinessData({
                                              ...businessData, 
                                              category: category.categoryName,
                                              categoryId: category.id // Store category ID for categories without subcategories
                                            });
                                            setShowCategorySelector(false);
                                          }}
                                          className="w-full text-left px-3 py-2 text-sm text-[#036A38] hover:bg-[#036A38]/10 transition-colors rounded-lg"
                                        >
                                          Select {category.categoryName}
                                        </button>
                                      </div>
                                    )}
                                    
                                    {/* Subcategories */}
                                    {isExpanded && category.hasSubCategories && (
                                      <div className="border-t border-border/40 bg-muted/5">
                                        {category.subCategories.map((sub) => (
                                          <button
                                            key={sub.id}
                                            onClick={() => {
                                              setBusinessData({
                                                ...businessData, 
                                                category: sub.subCategoryName,
                                                categoryId: sub.id // Store subcategory ID for API
                                              });
                                              setShowCategorySelector(false);
                                            }}
                                            className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted/10 transition-colors border-b border-border/20 last:border-b-0"
                                          >
                                            {sub.subCategoryName}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              
                              {businessCategories.length === 0 && !isCategoriesLoading && (
                                <div className="text-center py-8">
                                  <p className="text-sm text-muted-foreground">No categories available</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Step 2: Place Pin */}
                      {businessStep === 2 && (
                        <>
                          <div className="space-y-2">
                            <h4 className="text-lg font-semibold text-foreground">Place your pin</h4>
                            <p className="text-sm text-muted-foreground">Move your pin location to help customers find your business accurately</p>
                          </div>

                          <div className="relative w-full h-96 bg-muted rounded-xl overflow-hidden border border-border/40">
                            <iframe
                              src="/map"
                              className="w-full h-full border-0"
                              title="Map"
                              style={{ pointerEvents: 'auto' }}
                              onLoad={(e) => {
                                const iframe = e.target as HTMLIFrameElement;
                                try {
                                  // Add message listener for map clicks
                                  const handleMapMessage = (event: MessageEvent) => {
                                    if (event.origin !== window.location.origin) return;
                                    
                                    if (event.data.type === 'MAP_CLICK') {
                                      const { lat, lng } = event.data;
                                      console.log('📍 Pin placed at coordinates:', { lat, lng });
                                      console.log(`Latitude: ${lat}`);
                                      console.log(`Longitude: ${lng}`);
                                      
                                      // Update business data with coordinates
                                      setBusinessData(prev => ({
                                        ...prev,
                                        coordinates: { lat, lng }
                                      }));
                                    }
                                  };
                                  
                                  window.addEventListener('message', handleMapMessage);
                                  
                                  // Send message to map to enable pin placement mode
                                  setTimeout(() => {
                                    iframe.contentWindow?.postMessage({
                                      type: 'ENABLE_PIN_PLACEMENT',
                                      message: 'Click on the map to place your business pin'
                                    }, window.location.origin);
                                  }, 1000);
                                  
                                } catch (error) {
                                  console.error('Error setting up map communication:', error);
                                }
                              }}
                            />
                          </div>

                          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border/40">
                            <p className="font-medium text-foreground mb-1">Click on the map to set your business location</p>
                            <p className="text-xs">Use the map above to find and mark your exact business location</p>
                            {businessData.coordinates && (
                              <div className="mt-2 p-2 bg-[#036A38]/10 rounded border border-[#036A38]/20">
                                <p className="text-xs font-mono text-[#036A38]">
                                  📍 Pin placed at: {businessData.coordinates.lat.toFixed(6)}, {businessData.coordinates.lng.toFixed(6)}
                                </p>
                              </div>
                            )}
                          </div>

                          <Button 
                            className="w-full bg-[#036A38] hover:bg-[#025C31] text-white"
                            disabled={!businessData.coordinates}
                            onClick={() => setBusinessStep(3)}
                          >
                            {businessData.coordinates ? 'Next' : 'Place pin to continue'}
                          </Button>
                        </>
                      )}

                      {/* Step 3: Contact Details */}
                      {businessStep === 3 && (
                        <>
                          <div className="space-y-2">
                            <h4 className="text-lg font-semibold text-foreground">Contact details</h4>
                            <p className="text-sm text-muted-foreground">Help customers reach your business easily</p>
                          </div>

                          <form onSubmit={handleSubmit((data) => {
                            setBusinessData(prev => ({
                              ...prev,
                              phone: data.phone,
                              website: data.website || ''
                            }));
                            setBusinessStep(4);
                          })}>
                            <div className="space-y-3">
                              <div>
                                <label className="text-sm text-muted-foreground mb-1 block">Phone number</label>
                                <div className="flex gap-2">
                                  <div className="w-20 px-3 py-2 rounded-xl border border-input bg-muted/50 flex items-center justify-center text-sm font-medium text-muted-foreground">
                                    +234
                                  </div>
                                  <div className="flex-1">
                                    <Input 
                                      {...register('phone')}
                                      placeholder="8012345678" 
                                      className={cn(
                                        "flex-1",
                                        errors.phone && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                      )}
                                      onChange={(e) => {
                                        // Remove any non-digit characters
                                        let value = e.target.value.replace(/\D/g, '');
                                        
                                        // Remove any prefixes (234, +234, 0)
                                        if (value.startsWith('234')) {
                                          value = value.substring(3);
                                        } else if (value.startsWith('0')) {
                                          value = value.substring(1);
                                        }
                                        
                                        // Limit to 10 digits and ensure it starts with 7, 8, or 9
                                        value = value.substring(0, 10);
                                        
                                        // Only allow if it starts with 7, 8, or 9 or is empty
                                        if (value === '' || /^[789]/.test(value)) {
                                          setValue('phone', value);
                                        }
                                      }}
                                    />
                                    {errors.phone && (
                                      <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Enter your 10-digit phone number starting with 7, 8, or 9 (e.g., 8012345678)
                                </p>
                              </div>

                              <div>
                                <label className="text-sm text-muted-foreground mb-1 block">Website (optional)</label>
                                <Input 
                                  {...register('website')}
                                  placeholder="https://www.example.com" 
                                  className={cn(
                                    errors.website && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                  )}
                                />
                                {errors.website && (
                                  <p className="text-xs text-red-500 mt-1">{errors.website.message}</p>
                                )}
                              </div>
                            </div>

                            <Button 
                              type="submit"
                              className="w-full bg-[#036A38] hover:bg-[#025C31] text-white mt-4"
                            >
                              Next
                            </Button>
                          </form>
                        </>
                      )}

                      {/* Step 4: Business Hours */}
                      {businessStep === 4 && !editingDay && (
                        <>
                          <div className="space-y-2">
                            <h4 className="text-lg font-semibold text-foreground">Business Hours</h4>
                            <p className="text-sm text-muted-foreground">Let customers know when you're open</p>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              variant="outline"
                              size="sm"
                              className="text-[#036A38] border-[#036A38] hover:bg-[#036A38]/10"
                              onClick={() => {
                                const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                                setSelectedDays(weekdays);
                                setEditingDay('Monday');
                                // Load hours from Monday if available
                                const mondayHours = businessData.hours['Monday'];
                                if (mondayHours) {
                                  setTempHours({
                                    open: mondayHours.open || '09:00 AM',
                                    close: mondayHours.close || '05:00 PM',
                                    open24: mondayHours.open24 || false,
                                    closed: mondayHours.closed || false
                                  });
                                }
                              }}
                            >
                              Edit Mon-Sat
                            </Button>
                            <Button 
                              variant="outline"
                              size="sm"
                              className="text-[#036A38] border-[#036A38] hover:bg-[#036A38]/10"
                              onClick={() => {
                                setSelectedDays(['Sunday']);
                                setEditingDay('Sunday');
                                // Load hours from Sunday if available
                                const sundayHours = businessData.hours['Sunday'];
                                if (sundayHours) {
                                  setTempHours({
                                    open: sundayHours.open || '09:00 AM',
                                    close: sundayHours.close || '05:00 PM',
                                    open24: sundayHours.open24 || false,
                                    closed: sundayHours.closed || false
                                  });
                                }
                              }}
                            >
                              Edit Sunday
                            </Button>
                          </div>

                          <div className="space-y-1">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                              const dayHours = businessData.hours[day];
                              let hoursDisplay = 'Closed';
                              
                              if (dayHours) {
                                if (dayHours.open24) {
                                  hoursDisplay = 'Open 24 hours';
                                } else if (!dayHours.closed) {
                                  hoursDisplay = `${dayHours.open} - ${dayHours.close}`;
                                }
                              }
                              
                              return (
                                <div key={day} className="flex items-center justify-between py-3 px-2 hover:bg-muted/5 rounded-lg transition-colors">
                                  <span className="text-sm font-medium text-foreground">{day}</span>
                                  <div className="flex items-center gap-3">
                                    <span className={cn(
                                      "text-sm",
                                      dayHours && !dayHours.closed ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                      {hoursDisplay}
                                    </span>
                                    <button
                                      onClick={() => {
                                        setEditingDay(day);
                                        setSelectedDays([day]);
                                        // Load existing hours if available
                                        if (dayHours) {
                                          setTempHours({
                                            open: dayHours.open || '09:00 AM',
                                            close: dayHours.close || '05:00 PM',
                                            open24: dayHours.open24 || false,
                                            closed: dayHours.closed || false
                                          });
                                        }
                                      }}
                                      className="text-muted-foreground hover:text-foreground p-1"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <Button 
                            className="w-full bg-[#036A38] hover:bg-[#025C31] text-white mt-4"
                            onClick={() => setBusinessStep(5)}
                          >
                            Next
                          </Button>
                        </>
                      )}

                      {/* Step 5: Business Photos */}
                      {businessStep === 5 && (
                        <>
                          <div className="space-y-2">
                            <h4 className="text-lg font-semibold text-foreground">Business Photos</h4>
                            <p className="text-sm text-muted-foreground">Add photos to help customers recognise and trust your business</p>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            {/* Display uploaded images */}
                            {businessData.photos.map((photo, index) => (
                              <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                                <img 
                                  src={photo} 
                                  alt={`Business photo ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  onClick={() => {
                                    const newPhotos = businessData.photos.filter((_, i) => i !== index);
                                    setBusinessData({...businessData, photos: newPhotos});
                                  }}
                                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-4 w-4 text-white" />
                                </button>
                              </div>
                            ))}
                            
                            {/* Add Image Button */}
                            {businessData.photos.length < 9 && (
                              <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-[#036A38] flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    files.forEach(file => {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setBusinessData(prev => ({
                                          ...prev,
                                          photos: [...prev.photos, reader.result as string]
                                        }));
                                      };
                                      reader.readAsDataURL(file);
                                    });
                                    e.target.value = '';
                                  }}
                                />
                                <ImageIcon className="h-6 w-6 text-[#036A38]" />
                                <span className="text-xs text-muted-foreground">Add Image</span>
                              </label>
                            )}
                          </div>

                          {businessData.photos.length > 0 && (
                            <p className="text-xs text-muted-foreground text-center">
                              {businessData.photos.length} photo{businessData.photos.length !== 1 ? 's' : ''} added (max 9)
                            </p>
                          )}

                          <Button 
                            className="w-full bg-[#036A38] hover:bg-[#025C31] text-white"
                            onClick={() => {
                              // Go to review step
                              setBusinessStep(6);
                            }}
                          >
                            Review
                          </Button>
                        </>
                      )}

                      {/* Step 6: Review */}
                      {businessStep === 6 && (
                        <>
                          <div className="space-y-2 mb-4">
                            <h4 className="text-lg font-semibold text-foreground">Make your Business Profile</h4>
                            <p className="text-sm text-muted-foreground">Add your business details to help customers find and trust you</p>
                          </div>

                          <div className="space-y-4">
                            {/* Business Name */}
                            <div>
                              <label className="text-sm text-muted-foreground mb-1 block">Business name</label>
                              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-input bg-background/80">
                                <span className="text-sm font-medium text-foreground">{businessData.name}</span>
                                <button
                                  onClick={() => setBusinessStep(1)}
                                  className="text-[#036A38] hover:text-[#025C31]"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Business Category */}
                            <div>
                              <label className="text-sm text-muted-foreground mb-1 block">Business category</label>
                              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-input bg-background/80">
                                <span className="text-sm font-medium text-foreground">{businessData.category}</span>
                                <button
                                  onClick={() => setBusinessStep(1)}
                                  className="text-[#036A38] hover:text-[#025C31]"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Map Location */}
                            <div>
                              <div className="relative w-full h-40 bg-muted rounded-xl overflow-hidden border border-border/40">
                                <iframe
                                  src="/map"
                                  className="w-full h-full border-0 pointer-events-none"
                                  title="Map"
                                />
                                <button
                                  onClick={() => setBusinessStep(2)}
                                  className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-background/90 backdrop-blur-sm border border-border/40 text-sm font-medium text-foreground hover:bg-background transition-colors"
                                >
                                  <MapPin className="h-4 w-4 text-[#036A38]" />
                                  edit map location
                                </button>
                              </div>
                            </div>

                            {/* Phone Number */}
                            <div>
                              <label className="text-sm text-muted-foreground mb-1 block">Phone number</label>
                              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-input bg-background/80">
                                <span className="text-sm font-medium text-foreground">
                                  +234 {businessData.phone}
                                </span>
                                <button
                                  onClick={() => {
                                    // Pre-fill the form with current data
                                    setValue('phone', businessData.phone);
                                    setValue('website', businessData.website);
                                    setBusinessStep(3);
                                  }}
                                  className="text-[#036A38] hover:text-[#025C31]"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Website */}
                            {businessData.website && (
                              <div>
                                <label className="text-sm text-muted-foreground mb-1 block">Website</label>
                                <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-input bg-background/80">
                                  <span className="text-sm font-medium text-foreground">{businessData.website}</span>
                                  <button
                                    onClick={() => {
                                      // Pre-fill the form with current data
                                      setValue('phone', businessData.phone);
                                      setValue('website', businessData.website);
                                      setBusinessStep(3);
                                    }}
                                    className="text-[#036A38] hover:text-[#025C31]"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Business Hours */}
                            <div>
                              <label className="text-sm text-muted-foreground mb-1 block">Business hours</label>
                              <div className="px-4 py-3 rounded-xl border border-input bg-background/80">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    {Object.keys(businessData.hours).length > 0 ? (
                                      <>
                                        {/* Show Sunday separately if it exists */}
                                        {businessData.hours['Sunday'] && (
                                          <div className="text-sm">
                                            <span className="text-foreground">Sunday: </span>
                                            <span className="text-muted-foreground">
                                              {businessData.hours['Sunday'].open24 
                                                ? 'Open 24 hours'
                                                : businessData.hours['Sunday'].closed 
                                                  ? 'Closed'
                                                  : `${businessData.hours['Sunday'].open} - ${businessData.hours['Sunday'].close}`
                                              }
                                            </span>
                                          </div>
                                        )}
                                        {/* Show weekdays if they have the same hours */}
                                        {businessData.hours['Monday'] && (
                                          <div className="text-sm">
                                            <span className="text-foreground">Mon-Sat: </span>
                                            <span className="text-muted-foreground">
                                              {businessData.hours['Monday'].open24 
                                                ? 'Open 24 hours'
                                                : businessData.hours['Monday'].closed 
                                                  ? 'Closed'
                                                  : `${businessData.hours['Monday'].open} - ${businessData.hours['Monday'].close}`
                                              }
                                            </span>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">Not set</span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => setBusinessStep(4)}
                                    className="text-[#036A38] hover:text-[#025C31]"
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Business Photos */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-sm text-muted-foreground">Business photos</label>
                                <button
                                  onClick={() => setBusinessStep(5)}
                                  className="text-[#036A38] hover:text-[#025C31]"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                              </div>
                              {businessData.photos.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                  {businessData.photos.slice(0, 2).map((photo, index) => (
                                    <div key={index} className="aspect-square rounded-xl overflow-hidden border border-border">
                                      <img 
                                        src={photo} 
                                        alt={`Business photo ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                                  {businessData.photos.length > 2 && (
                                    <div className="aspect-square rounded-xl overflow-hidden border border-border bg-muted/50 flex items-center justify-center relative">
                                      <img 
                                        src={businessData.photos[2]} 
                                        alt="Business photo 3"
                                        className="w-full h-full object-cover opacity-40"
                                      />
                                      <span className="absolute text-2xl font-bold text-foreground">
                                        +{businessData.photos.length - 2}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="px-4 py-3 rounded-xl border border-input bg-background/80">
                                  <span className="text-sm text-muted-foreground">No photos added</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Error Display */}
                          {businessSubmissionError && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                              {businessSubmissionError}
                            </div>
                          )}

                          <Button 
                            className="w-full bg-[#036A38] hover:bg-[#025C31] text-white mt-4"
                            disabled={isSubmittingBusiness}
                            onClick={handleBusinessSubmission}
                          >
                            {isSubmittingBusiness ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Creating Business...
                              </>
                            ) : (
                              'Submit'
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Claim Your Business */}
                  <button
                    onClick={() => setSelectedBusinessType(selectedBusinessType === 'claim' ? null : 'claim')}
                    className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-muted/5 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-foreground text-sm">Claim Your Business</h4>
                      <p className="text-xs text-muted-foreground">Take ownership of an existing place and manage</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {selectedBusinessType === 'claim' && (
                    <div className="px-4 pb-4 pt-2 space-y-3 bg-muted/5">
                      <Input placeholder="Business name" />
                      <Input placeholder="Business location/address" />
                      <Input placeholder="Your name" />
                      <Input placeholder="Your contact number" />
                      <Input placeholder="Your email" />
                      <textarea
                        className="w-full rounded-xl border border-input bg-background/80 backdrop-blur-sm px-4 py-3 text-sm font-medium transition-all duration-200 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand hover:border-border/80 hover:bg-background/90 min-h-[80px]"
                        placeholder="Proof of ownership (describe your relationship to the business)..."
                      />
                      <Button className="w-full bg-[#036A38] hover:bg-[#025C31] text-white">
                        Submit Claim
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Fix Map */}
          <div className="panel-green overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <button
              onClick={() => toggleSection('fix')}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#036A38]/10 flex items-center justify-center">
                  <MapPinOff className="h-5 w-5 text-[#036A38]" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Fix map</h3>
                  <p className="text-sm text-muted-foreground">Names, addresses, routes</p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  expandedSection === 'fix' && "rotate-180"
                )}
              />
            </button>
            {expandedSection === 'fix' && (
              <div className="animate-slide-up">
                {/* Fix Type Options */}
                <div className="border-t border-border/40">
                  {/* Edit Place Details */}
                  <button
                    onClick={() => setSelectedFixType(selectedFixType === 'edit-details' ? null : 'edit-details')}
                    className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-muted/5 transition-colors border-b border-border/20"
                  >
                    <div>
                      <h4 className="font-medium text-foreground text-sm">Edit Place Details</h4>
                      <p className="text-xs text-muted-foreground">Update wrong names, categories, or addresses.</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {selectedFixType === 'edit-details' && (
                    <div className="px-4 pb-4 pt-2 space-y-3 bg-muted/5">
                      <Input placeholder="Place name" />
                      <Input placeholder="Current address" />
                      <select className="w-full h-12 rounded-xl border border-input bg-background/80 backdrop-blur-sm px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand hover:border-border/80 hover:bg-background/90">
                        <option value="">What needs to be fixed?</option>
                        <option value="wrong-name">Wrong name</option>
                        <option value="wrong-category">Wrong category</option>
                        <option value="wrong-address">Wrong address</option>
                        <option value="wrong-phone">Wrong phone number</option>
                        <option value="other">Other</option>
                      </select>
                      <Input placeholder="Correct information" />
                      <textarea
                        className="w-full rounded-xl border border-input bg-background/80 backdrop-blur-sm px-4 py-3 text-sm font-medium transition-all duration-200 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand hover:border-border/80 hover:bg-background/90 min-h-[80px]"
                        placeholder="Additional details..."
                      />
                      <Button className="w-full bg-[#036A38] hover:bg-[#025C31] text-white">
                        Submit
                      </Button>
                    </div>
                  )}

                  {/* Move Place Pin */}
                  <button
                    onClick={() => setSelectedFixType(selectedFixType === 'move-pin' ? null : 'move-pin')}
                    className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-muted/5 transition-colors border-b border-border/20"
                  >
                    <div>
                      <h4 className="font-medium text-foreground text-sm">Move Place Pin</h4>
                      <p className="text-xs text-muted-foreground">Parks, monuments, worship centers..</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {selectedFixType === 'move-pin' && (
                    <div className="px-4 pb-4 pt-2 space-y-3 bg-muted/5">
                      <Input placeholder="Place name" />
                      <Input placeholder="Current location (address)" />
                      <Input placeholder="Correct location (address)" />
                      <textarea
                        className="w-full rounded-xl border border-input bg-background/80 backdrop-blur-sm px-4 py-3 text-sm font-medium transition-all duration-200 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand hover:border-border/80 hover:bg-background/90 min-h-[80px]"
                        placeholder="Explain why the pin location is incorrect..."
                      />
                      <Button className="w-full bg-[#036A38] hover:bg-[#025C31] text-white">
                        Submit
                      </Button>
                    </div>
                  )}

                  {/* Correct Road / Street Name */}
                  <button
                    onClick={() => setSelectedFixType(selectedFixType === 'correct-name' ? null : 'correct-name')}
                    className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-muted/5 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-foreground text-sm">Correct Road / Street Name</h4>
                      <p className="text-xs text-muted-foreground">Hospital, police station, bus stop, govt office..</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {selectedFixType === 'correct-name' && (
                    <div className="px-4 pb-4 pt-2 space-y-3 bg-muted/5">
                      <Input placeholder="Current road/street name" />
                      <Input placeholder="Correct road/street name" />
                      <Input placeholder="Location/Area" />
                      <textarea
                        className="w-full rounded-xl border border-input bg-background/80 backdrop-blur-sm px-4 py-3 text-sm font-medium transition-all duration-200 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand hover:border-border/80 hover:bg-background/90 min-h-[80px]"
                        placeholder="Additional information..."
                      />
                      <Button className="w-full bg-[#036A38] hover:bg-[#025C31] text-white">
                        Submit
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Post/Report Activity */}
          <div className="panel-green overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <button
              onClick={() => toggleSection('activity')}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#036A38]/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-[#036A38]" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Post/ report Activity</h3>
                  <p className="text-sm text-muted-foreground">Traffic, police, accident, events</p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  expandedSection === 'activity' && "rotate-180"
                )}
              />
            </button>
            {expandedSection === 'activity' && (
              <div className="px-4 pb-4 pt-4 space-y-4 animate-slide-up">
                {/* Activity Type Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setSelectedActivity('traffic')}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all aspect-square",
                      selectedActivity === 'traffic'
                        ? "bg-[#036A38]/10 border-[#036A38] shadow-md"
                        : "bg-background/80 border-border hover:bg-muted/5"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      selectedActivity === 'traffic' ? "bg-[#036A38]/20" : "bg-[#036A38]/10"
                    )}>
                      <Car className="h-6 w-6 text-[#036A38]" />
                    </div>
                    <span className="text-xs font-medium text-foreground text-center">Traffic</span>
                  </button>

                  <button
                    onClick={() => setSelectedActivity('accident')}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all aspect-square",
                      selectedActivity === 'accident'
                        ? "bg-[#036A38]/10 border-[#036A38] shadow-md"
                        : "bg-background/80 border-border hover:bg-muted/5"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      selectedActivity === 'accident' ? "bg-[#036A38]/20" : "bg-[#036A38]/10"
                    )}>
                      <AlertTriangle className="h-6 w-6 text-[#036A38]" />
                    </div>
                    <span className="text-xs font-medium text-foreground text-center">Accident</span>
                  </button>

                  <button
                    onClick={() => setSelectedActivity('closure')}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all aspect-square",
                      selectedActivity === 'closure'
                        ? "bg-[#036A38]/10 border-[#036A38] shadow-md"
                        : "bg-background/80 border-border hover:bg-muted/5"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      selectedActivity === 'closure' ? "bg-[#036A38]/20" : "bg-[#036A38]/10"
                    )}>
                      <MapPinOff className="h-6 w-6 text-[#036A38]" />
                    </div>
                    <span className="text-xs font-medium text-foreground text-center">Road Closure</span>
                  </button>

                  <button
                    onClick={() => setSelectedActivity('event')}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all aspect-square",
                      selectedActivity === 'event'
                        ? "bg-[#036A38]/10 border-[#036A38] shadow-md"
                        : "bg-background/80 border-border hover:bg-muted/5"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      selectedActivity === 'event' ? "bg-[#036A38]/20" : "bg-[#036A38]/10"
                    )}>
                      <Calendar className="h-6 w-6 text-[#036A38]" />
                    </div>
                    <span className="text-xs font-medium text-foreground text-center">Event</span>
                  </button>

                  <button
                    onClick={() => setSelectedActivity('other')}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all aspect-square",
                      selectedActivity === 'other'
                        ? "bg-[#036A38]/10 border-[#036A38] shadow-md"
                        : "bg-background/80 border-border hover:bg-muted/5"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      selectedActivity === 'other' ? "bg-[#036A38]/20" : "bg-[#036A38]/10"
                    )}>
                      <Info className="h-6 w-6 text-[#036A38]" />
                    </div>
                    <span className="text-xs font-medium text-foreground text-center">Other</span>
                  </button>
                </div>

                {/* Activity Form */}
                {selectedActivity && !showActivityMap && (
                  <div className="space-y-4 animate-fade-in pt-2">
                    {/* Location Input with Live Location Button */}
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Location</label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Enter location or use live location" 
                          value={activityLocationInput}
                          onChange={(e) => setActivityLocationInput(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={openMapWithLocation}
                          disabled={isGettingLocation}
                          className="bg-[#036A38] hover:bg-[#025C31] text-white px-4"
                        >
                          {isGettingLocation ? (
                            <Clock className="h-5 w-5 animate-spin" />
                          ) : (
                            <Navigation className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                      {activityLocation ? (
                        <div className="text-xs text-[#036A38] bg-[#036A38]/10 p-2 rounded border border-[#036A38]/20">
                          📍 Location set: {activityLocation.address}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Click the location icon to use your current location or select from map</p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Description *</label>
                      <textarea
                        value={activityDescription}
                        onChange={(e) => setActivityDescription(e.target.value)}
                        className={cn(
                          "w-full rounded-xl border border-input bg-background/80 backdrop-blur-sm px-4 py-3 text-sm font-medium transition-all duration-200 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand hover:border-border/80 hover:bg-background/90 min-h-[100px]",
                          !activityDescription.trim() && activitySubmissionError && "border-red-500"
                        )}
                        placeholder="Describe what's happening..."
                      />
                      {!activityDescription.trim() && (
                        <p className="text-xs text-muted-foreground">Please provide a description of the activity</p>
                      )}
                    </div>

                    {/* Photo Upload */}
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Add Photo (Optional)</label>
                      
                      {activityPhoto ? (
                        <div className="relative rounded-xl overflow-hidden border border-border">
                          <img 
                            src={activityPhoto} 
                            alt="Activity photo" 
                            className="w-full h-48 object-cover"
                          />
                          <button
                            onClick={() => setActivityPhoto(null)}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
                          >
                            <X className="h-5 w-5 text-white" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-border hover:border-[#036A38] transition-colors cursor-pointer bg-background/50">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setActivityPhoto(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                              e.target.value = '';
                            }}
                          />
                          <Camera className="h-5 w-5 text-[#036A38]" />
                          <span className="text-sm text-muted-foreground">Take or upload a photo</span>
                        </label>
                      )}
                    </div>

                    {/* Anonymous Checkbox */}
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/40">
                      <input
                        type="checkbox"
                        id="anonymous-activity"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="w-4 h-4 rounded border-[#036A38] text-[#036A38] focus:ring-[#036A38] focus:ring-offset-0"
                      />
                      <label htmlFor="anonymous-activity" className="text-sm text-foreground cursor-pointer flex-1">
                        Hide my name (contribute anonymously)
                      </label>
                    </div>

                    {/* Error Display */}
                    {activitySubmissionError && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                        {activitySubmissionError}
                      </div>
                    )}

                    <Button 
                      className="w-full bg-[#036A38] hover:bg-[#025C31] text-white"
                      disabled={isSubmittingActivity || !activityDescription.trim() || !activityLocation}
                      onClick={handleActivitySubmission}
                    >
                      {isSubmittingActivity ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Submitting Report...
                        </>
                      ) : (
                        'Submit Report'
                      )}
                    </Button>
                  </div>
                )}

                {/* Map View for Location Selection */}
                {showActivityMap && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-foreground">Pin your location</h4>
                      <button
                        onClick={() => {
                          setShowActivityMap(false);
                          // Don't update input when closing without confirming
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="relative w-full h-96 bg-muted rounded-xl overflow-hidden border border-border/40">
                      <iframe
                        src="/map"
                        className="w-full h-full border-0"
                        title="Activity Location Map"
                        style={{ pointerEvents: 'auto' }}
                      />
                      {activityLocation && (
                        <div className="absolute top-3 left-3 right-3 bg-background/95 backdrop-blur-sm border border-border/40 rounded-lg p-3 shadow-lg">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-[#036A38] mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground">
                                {isInNigeria(activityLocation.lat, activityLocation.lng) 
                                  ? 'Your Location' 
                                  : 'Default Location (Outside Nigeria)'}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {activityLocation.address}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      Click on the map to select your exact location
                    </p>

                    <Button 
                      className="w-full bg-[#036A38] hover:bg-[#025C31] text-white"
                      onClick={() => {
                        setShowActivityMap(false);
                        // Only update input when user confirms the location from map
                        if (activityLocation) {
                          setActivityLocationInput(activityLocation.address);
                        }
                      }}
                    >
                      Confirm Location
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Hours Editor Modal - Rendered at root level */}
      {editingDay && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card border border-[#036A38]/30 rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold text-foreground">
                {selectedDays.length > 1 
                  ? `${selectedDays.length} days selected` 
                  : editingDay}
              </h4>
              <button 
                onClick={() => {
                  setEditingDay(null);
                  setSelectedDays([]);
                  setShowTimePicker(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-2 justify-center mb-3">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => {
                const dayInitial = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][i];
                const isSelected = selectedDays.includes(day);
                
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (isSelected) {
                        // Deselect day
                        const newSelectedDays = selectedDays.filter(d => d !== day);
                        setSelectedDays(newSelectedDays);
                        // If we deselected the current editing day, switch to first remaining day
                        if (day === editingDay && newSelectedDays.length > 0) {
                          setEditingDay(newSelectedDays[0]);
                        } else if (newSelectedDays.length === 0) {
                          setEditingDay(null);
                        }
                      } else {
                        // Select day
                        setSelectedDays([...selectedDays, day]);
                        setEditingDay(day);
                      }
                    }}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      isSelected 
                        ? "bg-[#036A38] text-white" 
                        : "bg-muted/20 text-muted-foreground hover:bg-[#036A38]/20 hover:text-foreground"
                    )}
                  >
                    {dayInitial}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4 items-center justify-center py-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-[#036A38] text-[#036A38] focus:ring-[#036A38]"
                  checked={tempHours.open24}
                  onChange={(e) => setTempHours({...tempHours, open24: e.target.checked, closed: false})}
                />
                <span className="text-sm text-foreground">Open 24 hours</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-[#036A38] text-[#036A38] focus:ring-[#036A38]"
                  checked={tempHours.closed}
                  onChange={(e) => setTempHours({...tempHours, closed: e.target.checked, open24: false})}
                />
                <span className="text-sm text-foreground">Closed</span>
              </label>
            </div>

            {!tempHours.open24 && !tempHours.closed && (
              <div className="grid grid-cols-2 gap-4 py-2">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Opening time</label>
                  <button
                    onClick={() => setShowTimePicker('open')}
                    className="w-full px-4 py-3 rounded-xl border border-[#036A38]/30 bg-background/80 hover:bg-background/90 hover:border-[#036A38] transition-all text-left"
                  >
                    <span className="text-sm font-medium text-foreground">{tempHours.open || '00:00 AM'}</span>
                  </button>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Closing time</label>
                  <button
                    onClick={() => setShowTimePicker('close')}
                    className="w-full px-4 py-3 rounded-xl border border-[#036A38]/30 bg-background/80 hover:bg-background/90 hover:border-[#036A38] transition-all text-left"
                  >
                    <span className="text-sm font-medium text-foreground">{tempHours.close || '00:00 PM'}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1 border-border/40"
                onClick={() => {
                  setEditingDay(null);
                  setSelectedDays([]);
                  setShowTimePicker(null);
                  setTempHours({ open: '09:00 AM', close: '05:00 PM', open24: false, closed: false });
                }}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-[#036A38] hover:bg-[#025C31] text-white"
                onClick={() => {
                  // Save hours for all selected days
                  const updatedHours = { ...businessData.hours };
                  selectedDays.forEach(day => {
                    updatedHours[day] = {
                      open: tempHours.open,
                      close: tempHours.close,
                      closed: tempHours.closed,
                      open24: tempHours.open24
                    };
                  });
                  setBusinessData({ ...businessData, hours: updatedHours });
                  setEditingDay(null);
                  setSelectedDays([]);
                  setShowTimePicker(null);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Time Picker Modal - Rendered at root level */}
      {showTimePicker && (
        <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-[#036A38]/30 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/5">
              <button
                onClick={() => {
                  if (showTimePicker === 'open') {
                    setTempHours({...tempHours, open: '09:00 AM'});
                  } else {
                    setTempHours({...tempHours, close: '05:00 PM'});
                  }
                }}
                className="text-[#036A38] font-medium hover:text-[#025C31] transition-colors"
              >
                Reset
              </button>
              <h4 className="text-base font-semibold text-foreground">
                {showTimePicker === 'open' ? 'Opening time' : 'Closing time'}
              </h4>
              <button
                onClick={() => setShowTimePicker(null)}
                className="text-[#036A38] font-medium hover:text-[#025C31] transition-colors"
              >
                Done
              </button>
            </div>

            <div className="relative py-8 px-4 bg-background">
              {/* Selection highlight bar */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-12 bg-[#036A38]/5 border-y border-[#036A38]/20 pointer-events-none" />
              
              <div className="h-48">
                <Picker
                  value={{
                    hour: (() => {
                      const currentTime = showTimePicker === 'open' ? tempHours.open : tempHours.close;
                      const [hour] = currentTime.split(':');
                      return hour.padStart(2, '0');
                    })(),
                    minute: (() => {
                      const currentTime = showTimePicker === 'open' ? tempHours.open : tempHours.close;
                      const parts = currentTime.split(/[:\s]/);
                      return parts[1];
                    })(),
                    period: (() => {
                      const currentTime = showTimePicker === 'open' ? tempHours.open : tempHours.close;
                      return currentTime.split(' ')[1];
                    })()
                  }}
                  onChange={(value) => {
                    const newTime = `${value.hour}:${value.minute} ${value.period}`;
                    if (showTimePicker === 'open') {
                      setTempHours({...tempHours, open: newTime});
                    } else {
                      setTempHours({...tempHours, close: newTime});
                    }
                  }}
                  wheelMode="natural"
                  height={192}
                  itemHeight={40}
                  style={{
                    color: 'hsl(var(--foreground))',
                    fontSize: '18px',
                    fontWeight: '500'
                  }}
                >
                  <Picker.Column name="hour">
                    {Array.from({ length: 12 }, (_, i) => {
                      const hour = (i + 1).toString().padStart(2, '0');
                      return (
                        <Picker.Item key={hour} value={hour}>
                          {hour}
                        </Picker.Item>
                      );
                    })}
                  </Picker.Column>
                  <Picker.Column name="minute">
                    {Array.from({ length: 60 }, (_, i) => {
                      const minute = i.toString().padStart(2, '0');
                      return (
                        <Picker.Item key={minute} value={minute}>
                          {minute}
                        </Picker.Item>
                      );
                    })}
                  </Picker.Column>
                  <Picker.Column name="period">
                    <Picker.Item value="AM">
                      <div className={cn(
                        "py-2 px-4 rounded-lg transition-all font-medium",
                        (() => {
                          const currentTime = showTimePicker === 'open' ? tempHours.open : tempHours.close;
                          const currentPeriod = currentTime.split(' ')[1];
                          return currentPeriod === 'AM' 
                            ? "bg-[#036A38]/10 border-2 text-[#036A38]" 
                            : "text-muted-foreground";
                        })()
                      )}>
                        AM
                      </div>
                    </Picker.Item>
                    <Picker.Item value="PM">
                      <div className={cn(
                        "py-2 px-4 rounded-lg transition-all font-medium",
                        (() => {
                          const currentTime = showTimePicker === 'open' ? tempHours.open : tempHours.close;
                          const currentPeriod = currentTime.split(' ')[1];
                          return currentPeriod === 'PM' 
                            ? "bg-[#036A38]/10 border-2 border-[#036A38] text-[#036A38]" 
                            : "text-muted-foreground";
                        })()
                      )}>
                        PM
                      </div>
                    </Picker.Item>
                  </Picker.Column>
                </Picker>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
