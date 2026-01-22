import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star, 
  Quote, 
  MapPin,
  Briefcase,
  Users,
  Filter,
  Heart,
  TrendingUp,
  Award,
  Globe,
  CheckCircle,
  Eye,
  ThumbsUp
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import CustomerStoryForm from "@/components/CustomerStoryForm";
import { get } from "@/lib/http";
import { CustomerStoriesResponse, CustomerStory } from "@shared/api";
import Loader from "@/components/Loader";

export default function Testimonials() {
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [customerStories, setCustomerStories] = useState<CustomerStory[]>([]);
  const [totalStories, setTotalStories] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomerStories();
  }, [filter]);

  const fetchCustomerStories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params
      const categoryParam = filter !== "all" ? `&category=${filter.toUpperCase()}` : "";
      const response = await get<CustomerStoriesResponse>(
        `/api/customer-stories/get-all?pageNumber=0&pageSize=20&sortDirection=DESC&sortKey=createdDate${categoryParam}`
      );

      setCustomerStories(response.content || []);
      setTotalStories(response.totalElements || 0);
    } catch (err: any) {
      console.error("Failed to fetch customer stories:", err);
      setError(err.message || "Failed to load customer stories");
      // Fallback to static data if API fails
      setCustomerStories(staticTestimonials);
      setTotalStories(staticTestimonials.length);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get author initials
  const getAuthorInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Static fallback data (existing testimonials)
  const staticTestimonials: CustomerStory[] = [
    {
      id: "static-1",
      title: "NINja Map Revolutionized Our Lagos Operations",
      description: "NINja Map has completely revolutionized how I navigate Lagos. It understands every shortcut, landmark, and traffic pattern perfectly. This is the future of Nigerian navigation.",
      category: "BUSINESS",
      rating: 5,
      location: "Lagos",
      author: {
        name: "Adebayo Thompson",
        email: "adebayo@techcorp.ng",
        designation: "Business Executive",
        organisationName: "TechCorp Nigeria",
        profilePicture: null,
        bio: "Business Executive with 10+ years of experience"
      },
      stats: {
        views: 1250,
        likes: 45,
        comments: 12,
        shares: 8
      },
      createdDate: "2024-01-15T10:30:00Z",
      updatedDate: "2024-01-15T10:30:00Z",
      isActive: true
    },
    {
      id: "static-2", 
      title: "25% Increase in Earnings with Better Routes",
      description: "The voice guidance is incredibly clear and the offline maps work flawlessly even in poor network areas. My earnings increased by 25% with better route optimization.",
      category: "TRANSPORT",
      rating: 5,
      location: "Abuja",
      author: {
        name: "Kemi Okafor",
        email: "kemi@uber.ng",
        designation: "Professional Driver",
        organisationName: "Uber Nigeria",
        profilePicture: null,
        bio: "Professional driver with 5+ years experience"
      },
      stats: {
        views: 980,
        likes: 38,
        comments: 9,
        shares: 15
      },
      createdDate: "2024-01-10T14:20:00Z",
      updatedDate: "2024-01-10T14:20:00Z",
      isActive: true
    }
  ];

  const stats = [
    { number: `${totalStories}+`, label: "Success Stories", icon: Users },
    { number: "4.9/5", label: "Average Rating", icon: Star },
    { number: "36", label: "States Covered", icon: Globe },
    { number: "99%", label: "Satisfaction Rate", icon: Award }
  ];

  // Remove the old static testimonials array and use dynamic data
  const testimonials = customerStories;

  const filterOptions = [
    { value: "all", label: "All Stories", icon: Users, gradient: "from-[#036A38] to-[#FFB81C]" },
    { value: "business", label: "Business", icon: Briefcase, gradient: "from-[#036A38] to-[#FFB81C]" },
    { value: "transport", label: "Transport", icon: MapPin, gradient: "from-[#036A38] to-[#FFB81C]" },
    { value: "healthcare", label: "Healthcare", icon: Heart, gradient: "from-[#036A38] to-[#FFB81C]" },
    { value: "personal", label: "Personal", icon: Star, gradient: "from-[#036A38] to-[#FFB81C]" },
    { value: "other", label: "Other", icon: Globe, gradient: "from-[#036A38] to-[#FFB81C]" }
  ];

  const filteredTestimonials = testimonials;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader isVisible={true} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-[#036A38]/5 via-background to-[#00984E]/5 relative overflow-hidden">
        <div className="absolute inset-0 hero-pattern opacity-30" />
        <div className="container relative">
          <AnimatedSection className="mx-auto max-w-4xl text-center">
            <Badge
              variant="outline"
              className="mb-6 border-[0.6px] border-[#00984E] bg-[rgba(3,106,56,0.4)] text-white px-6 py-3 text-auto-sm font-medium"
            >
              <Quote className="w-4 h-4 mr-2" />
              Customer Stories
            </Badge>
            <h1 className="mb-6 text-auto-5xl font-bold tracking-tight font-display text-shimmer">
              What Nigerians Say About NINja Map
            </h1>
            <p className="text-auto-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
              Real stories from real users across Nigeria who trust NINja Map for their daily navigation needs. 
              Discover how we're transforming the way Nigeria moves.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {stats.map((stat, index) => (
                <AnimatedSection key={index} delay={0.1 * index}>
                  <motion.div
                    className="text-center p-6 rounded-2xl usecase-card hover-lift"
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 border-thin-green">
                      <stat.icon className="h-6 w-6 text-[#00984E]" />
                    </div>
                    <div className="text-auto-2xl font-bold text-[#00984E] mb-1">
                      {stat.number}
                    </div>
                    <p className="text-auto-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter Section */}
      <section className="section-padding">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-auto-3xl font-bold font-display text-[#00984E] mb-4">
              Stories by Category
            </h2>
            <p className="text-auto-lg text-muted-foreground max-w-2xl mx-auto">
              Filter testimonials by user type to find stories most relevant to you
            </p>
          </AnimatedSection>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {filterOptions.map((option, index) => (
              <AnimatedSection key={index} delay={0.1 * index}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(option.value)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-medium text-auto-sm transition-all duration-300 shadow-lg hover:shadow-xl ${
                    filter === option.value
                      ? `btn-theme-green text-white shadow-xl`
                      : 'bg-white/50 dark:bg-white/10 text-muted-foreground hover:bg-white/80 dark:hover:bg-white/20 border border-border/40'
                  }`}
                >
                  <option.icon className={`h-5 w-5 ${
                    filter === option.value ? 'text-white' : 'text-muted-foreground'
                  }`} />
                  {option.label}
                  {filter === option.value && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </motion.button>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="section-padding bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          {error && (
            <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <strong>Note:</strong> Showing sample data. {error}
              </p>
            </div>
          )}
          
          <div className="space-y-12 max-w-6xl mx-auto">
            {filteredTestimonials.map((story, index) => (
              <AnimatedSection key={story.id} delay={index * 0.15}>
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full overflow-hidden panel-metrics text-white">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* User Image & Info */}
                      <div className="lg:w-80 p-8 lg:p-12 flex flex-col justify-center bg-transparent">
                        <div className="text-center lg:text-left">
                          {story.author.profilePicture ? (
                            <img
                              src={story.author.profilePicture}
                              alt={story.author.name}
                              className="w-24 h-24 rounded-full object-cover mx-auto lg:mx-0 mb-6 border-4 border-white/20"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full flex items-center justify-center font-bold bg-white text-green-900 dark:text-white text-auto-2xl mx-auto lg:mx-0 mb-6 dark:bg-[#036A38]">
                              {getAuthorInitials(story.author.name)}
                            </div>
                          )}

                          <h3 className="text-auto-xl font-bold font-display text-white mb-2">
                            {story.author.name}
                          </h3>
                          <p className="text-auto-base text-white font-medium mb-1">
                            {story.author.designation || "Customer"}
                          </p>
                          <p className="text-auto-sm text-muted-foreground mb-4">
                            {story.author.organisationName || "Individual User"}
                          </p>

                          <div className="flex items-center gap-2 justify-center lg:justify-start mb-6">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-auto-sm text-muted-foreground">
                              {story.location}
                            </span>
                          </div>

                          {/* Story Stats */}
                          <div className="flex items-center gap-4 justify-center lg:justify-start text-sm text-muted-foreground">
                            {story.stats.views && (
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>{story.stats.views.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{story.stats.likes}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Success Story Content */}
                      <div className="flex-1 p-8 lg:p-12 lg:py-12">
                        {/* Rating */}
                        <div className="flex items-center gap-1 justify-center lg:justify-end mb-12">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-5 w-5 ${i < story.rating ? 'text-yellow-400 dark:text-[#036A38] fill-current' : 'text-gray-300'}`} />
                          ))}
                          <span className="ml-2 text-auto-sm text-muted-foreground">
                            {story.rating}/5
                          </span>
                        </div>

                        <div className="relative">
                          <Quote className="absolute -top-4 -left-4 h-12 w-12 text-white/15" />

                          <div className="pl-4">
                            <h4 className="text-auto-lg font-bold text-white mb-4 leading-tight">
                              {story.title}
                            </h4>

                            <p className="text-auto-lg leading-relaxed text-foreground mb-6 italic">
                              "{story.description}"
                            </p>

                            {/* Success Metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-border/40 pt-4">
                              <div className="text-center sm:text-left">
                                <div className="text-auto-xl font-bold text-white mb-1">
                                  {story.category === 'BUSINESS' ? '40%' :
                                   story.category === 'TRANSPORT' ? '60%' :
                                   story.category === 'HEALTHCARE' ? '50%' : '35%'}
                                </div>
                                <div className="text-auto-sm text-muted-foreground">
                                  Time Saved
                                </div>
                              </div>
                              <div className="text-center sm:text-left">
                                <div className="text-auto-xl font-bold text-[#FFB81C] mb-1">
                                  {story.category === 'BUSINESS' ? '25%' :
                                   story.category === 'TRANSPORT' ? '45%' :
                                   story.category === 'HEALTHCARE' ? '30%' : '20%'}
                                </div>
                                <div className="text-auto-sm text-muted-foreground">
                                  Cost Reduction
                                </div>
                              </div>
                              <div className="text-center sm:text-left">
                                <div className="text-auto-xl font-bold text-white mb-1">
                                  {story.rating * 20}%
                                </div>
                                <div className="text-auto-sm text-muted-foreground">
                                  Satisfaction
                                </div>
                              </div>
                            </div>

                            {/* Date */}
                            <div className="mt-4 text-xs text-muted-foreground">
                              Shared on {formatDate(story.createdDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}

            {filteredTestimonials.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-auto-lg font-medium mb-2">No stories found</h3>
                <p className="text-muted-foreground">
                  {filter === "all" 
                    ? "Be the first to share your story!" 
                    : `No stories found in the ${filter} category. Try selecting a different category.`
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-bottom-padding">
        <div className="container">
          <AnimatedSection>
            <Card className="border-0 shadow-2xl panel-metrics text-white overflow-hidden">
              <CardContent className="p-12 text-center relative">
                <div className="absolute inset-0 bg-pattern opacity-20" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg backdrop-blur-sm">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-auto-3xl font-bold font-display mb-4">
                    Share Your Story
                  </h2>
                  <p className="text-auto-lg opacity-90 max-w-2xl mx-auto mb-8">
                    Have a great experience with NINja Map? We'd love to hear from you and share your story 
                    with other Nigerian drivers. Help us build an even stronger community.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <button
                        onClick={() => {
                          const formSection = document.getElementById('story-form');
                          formSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex items-center text-auto-lg cursor-pointer rounded-xl px-6 py-3 font-medium transition-all duration-200 ease-out bg-white text-green-800 dark:bg-[#036A38] dark:text-white shadow-[0_4px_15px_rgba(3,106,56,0.3)] hover:shadow-[0_8px_25px_rgba(3,106,56,0.35)] hover:-translate-y-0.5"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Share Your Story
                      </button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link to="/about" className="flex items-center btn-ios-outline text-auto-lg cursor-pointer btn-ios-outline bg-[#1E7A50] text-white border border-[#1E7A50] rounded-xl px-8 py-4 shadow-2xl font-display text-auto-xl font-medium  justify-center hover:brightness-110 dark:bg-transparent dark:border-0">
                        <Users className="w-4 h-4 mr-2" />
                        Learn About Us
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* Customer Story Form Section */}
      <section id="story-form" className="section-padding bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <CustomerStoryForm onSuccess={fetchCustomerStories} />
            </AnimatedSection>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
