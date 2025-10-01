import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

export default function Testimonials() {
  const [filter, setFilter] = useState<string>("all");

  const stats = [
    { number: "2.5M+", label: "Happy Users", icon: Users },
    { number: "4.9/5", label: "Average Rating", icon: Star },
    { number: "36", label: "States Covered", icon: Globe },
    { number: "99%", label: "Satisfaction Rate", icon: Award }
  ];

  const testimonials = [
    {
      name: "Adebayo Thompson",
      role: "Business Executive",
      company: "TechCorp Nigeria",
      content:
        "NINja Map has completely revolutionized how I navigate Lagos. It understands every shortcut, landmark, and traffic pattern perfectly. This is the future of Nigerian navigation.",
      avatar: "AT",
      rating: 5,
      location: "Lagos",
      category: "business"
    },
    {
      name: "Kemi Okafor",
      role: "Professional Driver",
      company: "Uber Nigeria",
      content:
        "The voice guidance is incredibly clear and the offline maps work flawlessly even in poor network areas. My earnings increased by 25% with better route optimization.",
      avatar: "KO",
      rating: 5,
      location: "Abuja",
      category: "transport"
    },
    {
      name: "Ibrahim Musa",
      role: "Logistics Manager",
      company: "Swift Logistics",
      content:
        "Our delivery times improved by 35% since adopting NINja Map. The real-time traffic intelligence and community reports are game-changing for our business operations.",
      avatar: "IM",
      rating: 5,
      location: "Kano",
      category: "business"
    },
    {
      name: "Folake Adeniyi",
      role: "Tourism Coordinator",
      company: "Nigeria Tourism Board",
      content:
        "NINja Map helps tourists navigate our beautiful country with confidence. The cultural landmark recognition makes it perfect for showcasing Nigeria's heritage.",
      avatar: "FA",
      rating: 5,
      location: "Port Harcourt",
      category: "tourism"
    },
    {
      name: "David Okonkwo",
      role: "Emergency Response Coordinator",
      company: "Red Cross Nigeria",
      content:
        "In emergency situations, every second counts. NINja Map's real-time navigation and local knowledge help us reach those in need faster than ever before.",
      avatar: "DO",
      rating: 5,
      location: "Enugu",
      category: "emergency"
    },
    {
      name: "Aisha Suleiman",
      role: "Medical Professional",
      company: "National Hospital Abuja",
      content:
        "As a healthcare worker, reliable navigation is crucial for patient care. NINja Map never fails to guide me through Abuja's complex road network efficiently.",
      avatar: "AS",
      rating: 5,
      location: "Abuja",
      category: "healthcare"
    }
  ];

  const filterOptions = [
    { value: "all", label: "All Stories", icon: Users, gradient: "from-blue-500 to-purple-600" },
    { value: "business", label: "Business", icon: Briefcase, gradient: "from-purple-500 to-pink-600" },
    { value: "transport", label: "Transport", icon: MapPin, gradient: "from-green-500 to-blue-600" },
    { value: "healthcare", label: "Healthcare", icon: Heart, gradient: "from-red-500 to-pink-600" },
    { value: "personal", label: "Personal", icon: Star, gradient: "from-orange-500 to-red-600" }
  ];

  const filteredTestimonials = filter === "all" 
    ? testimonials 
    : testimonials.filter(t => t.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-brand/5 via-background to-gradient-to/5 relative overflow-hidden">
        <div className="absolute inset-0 hero-pattern opacity-30" />
        <div className="container relative">
          <AnimatedSection className="mx-auto max-w-4xl text-center">
            <Badge
              variant="outline"
              className="mb-6 border-brand/30 bg-brand/10 text-brand px-6 py-3 text-auto-sm font-medium"
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
                  <Card className="border-0 shadow-lg glass">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-brand rounded-xl flex items-center justify-center mx-auto mb-4">
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-auto-2xl font-bold text-brand mb-1">
                        {stat.number}
                      </div>
                      <p className="text-auto-sm text-muted-foreground">
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
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
            <h2 className="text-auto-3xl font-bold font-display text-brand mb-4">
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
                      ? `bg-gradient-to-r ${option.gradient} text-white shadow-xl`
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
          <div className="space-y-12 max-w-6xl mx-auto">
            {filteredTestimonials.map((testimonial, index) => (
              <AnimatedSection key={testimonial.name + testimonial.company} delay={index * 0.15}>
                <Card className="border-0 shadow-2xl glass-strong hover-lift overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* User Image & Info */}
                      <div className="lg:w-80 bg-gradient-to-br from-brand/10 to-gradient-to/10 p-8 lg:p-12 flex flex-col justify-center">
                        <div className="text-center lg:text-left">
                          <div className="w-24 h-24 bg-gradient-brand text-white rounded-full flex items-center justify-center font-bold text-auto-2xl shadow-2xl mx-auto lg:mx-0 mb-6">
                            {testimonial.avatar}
                          </div>

                          <h3 className="text-auto-xl font-bold font-display text-brand mb-2">
                            {testimonial.name}
                          </h3>
                          <p className="text-auto-base text-brand/80 font-medium mb-1">
                            {testimonial.role}
                          </p>
                          <p className="text-auto-sm text-muted-foreground mb-4">
                            {testimonial.company}
                          </p>

                          <div className="flex items-center gap-2 justify-center lg:justify-start mb-6">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-auto-sm text-muted-foreground">
                              {testimonial.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Success Story Content */}
                      <div className="flex-1 p-8 lg:p-12 lg:py-12">
                        {/* Rating */}
                        <div className="flex items-center gap-1 justify-center lg:justify-end mb-12">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                          ))}
                          <span className="ml-2 text-auto-sm text-muted-foreground">
                            {testimonial.rating}/5
                          </span>
                        </div>

                        <div className="relative">
                          <Quote className="absolute -top-4 -left-4 h-12 w-12 text-brand/15" />

                          <div className="pl-4">
                            <h4 className="text-auto-lg font-bold text-brand mb-4 leading-tight">
                              Success Story: {testimonial.company} Transformation
                            </h4>

                            <p className="text-auto-lg leading-relaxed text-foreground mb-6 italic">
                              "{testimonial.content}"
                            </p>

                            {/* Success Metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-border/40">
                              <div className="text-center sm:text-left">
                                <div className="text-auto-xl font-bold text-green-600 mb-1">
                                  {testimonial.category === 'business' ? '40%' :
                                   testimonial.category === 'transport' ? '60%' :
                                   testimonial.category === 'healthcare' ? '50%' : '35%'}
                                </div>
                                <div className="text-auto-sm text-muted-foreground">
                                  Time Saved
                                </div>
                              </div>
                              <div className="text-center sm:text-left">
                                <div className="text-auto-xl font-bold text-blue-600 mb-1">
                                  {testimonial.category === 'business' ? '25%' :
                                   testimonial.category === 'transport' ? '45%' :
                                   testimonial.category === 'healthcare' ? '30%' : '20%'}
                                </div>
                                <div className="text-auto-sm text-muted-foreground">
                                  Cost Reduction
                                </div>
                              </div>
                              <div className="text-center sm:text-left">
                                <div className="text-auto-xl font-bold text-purple-600 mb-1">
                                  {testimonial.rating * 20}%
                                </div>
                                <div className="text-auto-sm text-muted-foreground">
                                  Satisfaction
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-bottom-padding">
        <div className="container">
          <AnimatedSection>
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-brand to-gradient-to text-white overflow-hidden">
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
                      <Link to="/contact">
                        <Button className="bg-white text-brand hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-200">
                          <Heart className="w-4 h-4 mr-2" />
                          Share Your Story
                        </Button>
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link to="/about">
                        <Button variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white hover:text-brand transition-all backdrop-blur-sm">
                          <Users className="w-4 h-4 mr-2" />
                          Learn About Us
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
