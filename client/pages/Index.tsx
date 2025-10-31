import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Smartphone,
  Shield,
  Zap,
  Download,
  CheckCircle,
  Check,
  Globe,
  Users,
  Clock,
  Award,
  Star,
  Quote,
  Layers,
  Cpu,
  Cloud,
  Lock,
  Eye,
  Satellite,
  Headphones,
  Building,
  Heart,
  TrendingUp,
  Target,
  Compass,
  BarChart3,
  Briefcase,
  ArrowUpRight,
  Lightbulb,
  Truck,
  Car,
  School,
  Hospital,
  Sparkles,
  Crown,
  Rocket,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

import TestimonialUserSample from "../assets/testimonial-sample-user.png"

function CountUpAnimation({
  end,
  duration = 2000,
  suffix = "",
}: {
  end: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const testimonials = [
  {
    name: "Adebayo Thompson",
    role: "Business Executive",
    company: "TechCorp Nigeria",
    content:
      "NINja Map has completely revolutionized how I navigate Lagos. It understands every shortcut, landmark, and traffic pattern perfectly. This is the future of Nigerian navigation.",
    avatar: "AT",
    image: TestimonialUserSample,
    rating: 5,
    location: "Lagos",
  },
  {
    name: "Kemi Okafor",
    role: "Professional Driver",
    company: "Uber Nigeria",
    content:
      "The voice guidance is incredibly clear and the offline maps work flawlessly even in poor network areas. My earnings increased by 25% with better route optimization.",
    avatar: "KO",
    image: TestimonialUserSample, 
    rating: 5,
    location: "Abuja",
  },
  {
    name: "Ibrahim Musa",
    role: "Logistics Manager",
    company: "Swift Logistics",
    content:
      "Our delivery times improved by 35% since adopting NINja Map. The real-time traffic intelligence and community reports are game-changing for our business operations.",
    avatar: "IM",
    image: TestimonialUserSample,
    rating: 5,
    location: "Kano",
  },
  {
    name: "Folake Adeniyi",
    role: "Tourism Coordinator",
    company: "Nigeria Tourism Board",
    content:
      "NINja Map helps tourists navigate our beautiful country with confidence. The cultural landmark recognition makes it perfect for showcasing Nigeria's heritage.",
    avatar: "FA",
    image: TestimonialUserSample,
    rating: 5,
    location: "Port Harcourt",
  },
  {
    name: "David Okonkwo",
    role: "Emergency Response Coordinator",
    company: "Red Cross Nigeria",
    content:
      "In emergency situations, every second counts. NINja Map's real-time navigation and local knowledge help us reach those in need faster than ever before.",
    avatar: "DO",
    image: TestimonialUserSample,
    rating: 5,
    location: "Enugu",
  },
  {
    name: "Aisha Suleiman",
    role: "Medical Professional",
    company: "National Hospital Abuja",
    content:
      "As a healthcare worker, reliable navigation is crucial for patient care. NINja Map never fails to guide me through Abuja's complex road network efficiently.",
    avatar: "AS",
    image: TestimonialUserSample,
    rating: 5,
    location: "Abuja",
  },
];

export default function Index() {
  const [isNavSticky, setIsNavSticky] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0); // Start with first card

  // Check scroll position for sticky navigation with smoother detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsNavSticky(scrollY > 56); // Trigger sticky after scrolling past hero area
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-play testimonials with smoother timing
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev =>
        prev >= testimonials.length - 1 ? 0 : prev + 1
      );
    }, 6000); // Change every 6 seconds for compact design

    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Smooth scroll function - only for landing page internal navigation
  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const navHeight = 64;
      const elementPosition = element.offsetTop - navHeight;

      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  // Handle navigation clicks - only for landing page sections
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    const targetId = href.replace("#", "").replace("-", "");
    smoothScrollTo(targetId);
  };

  const features = [
    {
      icon: Target,
      title: "Hyperlocal Navigation Intelligence",
      description:
        "Navigate using familiar Nigerian landmarks, junctions, and local descriptions with AI precision.",
      longDescription:
        "Our advanced AI system understands Nigerian addressing conventions, from 'After 3rd Mainland Bridge' to 'Opposite Mr. Biggs', providing navigation that feels natural and intuitive to every Nigerian driver.",
      color: "bg-blue-50 dark:bg-blue-950/20",
      iconColor: "text-[#00984E]",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      icon: Compass,
      title: "Smart Voice Guidance System",
      description:
        "Clear, context-aware voice directions in English, optimized for Nigerian road conditions.",
      longDescription:
        "Advanced voice synthesis technology provides clear, contextual directions that consider Nigerian traffic patterns, road quality, and local driving habits for optimal navigation experience.",
      color: "bg-green-50 dark:bg-green-950/20",
      iconColor: "text-green-600 dark:text-green-400",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      icon: Users,
      title: "Community Intelligence Network",
      description:
        "Real-time updates from fellow Nigerian drivers about traffic, road conditions, and alternatives.",
      longDescription:
        "Join over 2.5M Nigerian drivers sharing real-time road intelligence, traffic updates, accident reports, and route recommendations for smarter navigation decisions.",
      color: "bg-purple-50 dark:bg-purple-950/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      icon: Shield,
      title: "Enterprise-Grade Security",
      description:
        "Your data stays in Nigeria with military-grade security and privacy protection.",
      longDescription:
        "GDPR-compliant data handling with servers hosted exclusively within Nigerian borders, featuring AES-256 encryption and zero data sharing with third parties.",
      color: "bg-red-50 dark:bg-red-950/20",
      iconColor: "text-red-600 dark:text-red-400",
      borderColor: "border-red-200 dark:border-red-800",
    },
    {
      icon: Zap,
      title: "Lightning-Fast Performance",
      description:
        "Optimized for Nigerian networks with offline capabilities and instant response times.",
      longDescription:
        "Edge computing optimization with intelligent caching, 2G network compatibility, and sub-100ms response times ensure universal access across Nigeria.",
      color: "bg-yellow-50 dark:bg-yellow-950/20",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      borderColor: "border-yellow-200 dark:border-yellow-800",
    },
    {
      icon: Satellite,
      title: "Next-Gen Mapping Technology",
      description:
        "Precise vector maps with satellite imagery, specifically calibrated for Nigerian terrain.",
      longDescription:
        "Daily updated Sentinel-2 satellite data, local surveying, and AI-enhanced accuracy provide unparalleled precision for Nigerian roads and landmarks.",
      color: "bg-indigo-50 dark:bg-indigo-950/20",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      borderColor: "border-indigo-200 dark:border-indigo-800",
    },
  ];

  const stats = [
    { value: 2500000, label: "Active Users Nationwide", suffix: "+" },
    { value: 36, label: "States Fully Covered", suffix: "/36" },
    { value: 99.9, label: "Uptime Reliability", suffix: "%" },
    { value: 847, label: "Cities & Towns", suffix: "+" },
    { value: 15000, label: "Daily New Users", suffix: "+" },
    { value: 2.1, label: "Million Daily Routes", suffix: "M" },
  ];

  const techSpecs = [
    {
      title: "AI-Powered Vector Maps",
      description:
        "Custom neural vector maps optimized for Nigerian roads and landmarks",
      icon: Layers,
      metric: "99.9%",
      metricLabel: "Accuracy",
      details:
        "Machine learning algorithms trained on millions of Nigerian route data points",
    },
    {
      title: "Real-Time Intelligence Engine",
      description: "AI algorithms processing live traffic and community data",
      icon: Cpu,
      metric: "<100ms",
      metricLabel: "Response Time",
      details:
        "Edge computing infrastructure for instantaneous navigation updates",
    },
    {
      title: "Sovereign Cloud Infrastructure",
      description: "Hosted exclusively on secure Nigerian cloud servers",
      icon: Cloud,
      metric: "99.99%",
      metricLabel: "Uptime SLA",
      details: "Multi-region redundancy with automatic failover capabilities",
    },
    {
      title: "Zero-Knowledge Privacy",
      description: "Military-grade encryption with complete data sovereignty",
      icon: Lock,
      metric: "256-bit",
      metricLabel: "Encryption",
      details: "End-to-end encryption with no third-party data sharing",
    },
    {
      title: "Community Intelligence Platform",
      description:
        "Live traffic monitoring and crowd-sourced road intelligence",
      icon: Eye,
      metric: "2.5M+",
      metricLabel: "Data Points",
      details: "Real-time updates from millions of Nigerian drivers",
    },
    {
      title: "Satellite Precision Mapping",
      description:
        "Daily updated satellite imagery with ground-truth verification",
      icon: Satellite,
      metric: "Daily",
      metricLabel: "Updates",
      details:
        "Sentinel-2 satellite data with AI-enhanced accuracy verification",
    },
  ];

  const useCases = [
    {
      icon: Briefcase,
      title: "Business & Commerce",
      description:
        "Optimize delivery routes, reduce fuel costs, improve customer satisfaction",
      users: "250K+ businesses",
    },
    {
      icon: Car,
      title: "Personal Transportation",
      description:
        "Daily commuting, family trips, exploring new places with confidence",
      users: "2M+ personal users",
    },
    {
      icon: Truck,
      title: "Logistics & Delivery",
      description: "Fleet management, cargo tracking, optimized route planning",
      users: "50K+ fleet operators",
    },
    {
      icon: Hospital,
      title: "Emergency Services",
      description: "Medical emergencies, fire services, police rapid response",
      users: "500+ emergency units",
    },
    {
      icon: School,
      title: "Educational Institutions",
      description: "School bus routing, campus navigation, field trip planning",
      users: "1K+ schools",
    },
    {
      icon: Building,
      title: "Government Agencies",
      description:
        "Public service delivery, urban planning, infrastructure development",
      users: "200+ agencies",
    },
  ];

  return (
    <div className="min-h-screen bg-background font-display theme-transition">
      {/* Header */}
      <Header />

      {/* Optimized Background Elements */}
      <div className="fixed inset-0 bg-gradient-radial-brand pointer-events-none opacity-60"></div>

      {/* Hero Section with landing page specific navigation */}
      <section className="section-padding relative hero-pattern">
        <div className="container relative">
          {/* add a placeholder view, when the navbar is sticky */}
          {isNavSticky && 
            <div className="flex" style={{
              height: 62
            }}></div>
          }

          {/* Quick Links Navigation - Will become sticky */}
          <div className="hidden lg:flex justify-center mb-12">
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`glass rounded-full px-6 py-3 shadow-2xl border border-white/20 backdrop-blur-xl transition-all duration-300 ease-out ${
                isNavSticky ? 'fixed top-[72px] transform -translate-x-1/2 z-40 scale-95 bg-background/90' : 'relative'
              }`}
              id="hero-navigation"
            >
              <div className="flex items-center space-x-8">
                {[
                  "Features",
                  "Technology",
                  "Use Cases",
                  "Community",
                  "Testimonials",
                ].map((item, index) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase().replace(" ", "")}`}
                    onClick={(e) =>
                      handleNavClick(e, `#${item.toLowerCase().replace(" ", "")}`)
                    }
                    className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-brand px-3 py-2 rounded-full hover:bg-brand/10 whitespace-nowrap"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item}
                  </motion.a>
                ))}
              </div>
            </motion.nav>
          </div>

          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Badge
                variant="outline"
                className="mb-6 border-brand/40 bg-brand-50 dark:bg-brand-950 text-brand dark:text-white text-sm px-4 py-3 hover-glow theme-transition"
              >
                <Sparkles className="w-4 h-4 mr-2 text-brand dark:text-white" />
                Revolutionizing Nigerian Navigation
              </Badge>
            </motion.div>

            <motion.h1
              className="mb-8 text-auto-6xl font-bold tracking-tight font-display"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Navigate Nigeria
              <span className="text-gradient block mt-2 text-shimmer">
                Like a True Local
              </span>
            </motion.h1>

            <motion.p
              className="mx-auto mb-12 max-w-4xl text-auto-xl text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              The world's most advanced digital mapping platform designed
              exclusively for Nigeria's unique landscapes, addressing systems,
              and cultural context. Experience navigation powered by artificial
              intelligence that truly understands how Nigerians move, work, and
              live.
            </motion.p>

            <motion.div
              className="flex flex-col gap-6 sm:flex-row sm:justify-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <motion.div
                className="flex items-center text-auto-lg cursor-pointer rounded-xl px-6 py-3 font-medium transition-all duration-200 ease-out bg-[#036A38] text-white shadow-[0_4px_15px_rgba(3,106,56,0.3)] hover:shadow-[0_8px_25px_rgba(3,106,56,0.35)] hover:-translate-y-0.5"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="mr-3 h-5 w-5" />
                Download for Android
              </motion.div>
              <motion.div
                className="btn-ios-outline bg-[#1E7A50] text-white border border-[#1E7A50] rounded-xl px-8 py-4 shadow-2xl font-display text-auto-xl font-medium cursor-pointer flex items-center justify-center hover:brightness-110 dark:bg-transparent dark:border-0"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="mr-3 h-5 w-5" />
                Download for iOS
              </motion.div>
            </motion.div>

            <motion.div
              className="flex flex-wrap items-center justify-center gap-12 text-auto-sm text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1 }}
            >
              {[
                {
                  icon: Shield,
                  text: "Privacy Guaranteed",
                  color: "text-yellow-500",
                },
                {
                  icon: Headphones,
                  text: "24/7 Expert Support",
                  color: "text-yellow-500",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 group hover-scale"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <item.icon
                    className={`h-5 w-5 ${item.color} group-hover:scale-110 transition-transform`}
                  />
                  <span className="group-hover:text-foreground transition-colors font-medium">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>



      {/* Enhanced Stats Section */}
      <section className="border-y border-border/40 bg-gradient-to-r from-brand/5 via-transparent to-brand/5 section-padding">
        <div className="container">
          <AnimatedSection delay={0.2}>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center group"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-auto-3xl font-bold text-gradient mb-3 group-hover:scale-110 transition-transform font-display">
                    <CountUpAnimation end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-auto-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="section-padding">
        <div className="container">
          <AnimatedSection className="mx-auto max-w-4xl text-center mb-24">
            <Badge
              variant="outline"
              className="mb-6 border-brand/30 bg-brand-50 dark:bg-brand-950 text-brand dark:text-white px-4 py-3"
            >
              <Target className="w-4 h-4 mr-2 text-brand dark:text-white" />
              Advanced Features
            </Badge>
            <h2 className="mb-8 text-auto-4xl font-bold tracking-tight font-display">
              Built for Nigerian Excellence
            </h2>
            <p className="text-auto-xl text-muted-foreground leading-relaxed">
              Unlike generic mapping solutions, NINja Map leverages cutting-edge
              AI and machine learning to understand the intricate nuances of
              Nigerian navigation, from Lagos traffic intelligence to rural
              pathway optimization.
            </p>
          </AnimatedSection>

          <div className="grid gap-12 lg:gap-16">
            {features.map((feature, index) => (
              <AnimatedSection key={index} delay={index * 0.15}>
                <motion.div
                  className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-16`}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="lg:w-1/2">
                    <Card
                      className={`${index % 2 === 1 ? "panel-amber" : "panel-green"} hover-lift h-full`}
                    >
                      <CardHeader className="pb-8">
                        <div
                          className={`mb-8 flex h-20 w-20 items-center justify-center rounded-3xl  ${index % 2 === 1 ? "border-thin-amber" : "border-thin-green"}`}
                        >
                          <feature.icon
                            className={`h-10 w-10 ${index % 2 === 1 ? "text-[#FFB81C]" : "text-[#00984E]"}`}
                          />
                        </div>
                        <CardTitle className="text-auto-2xl mb-6 font-bold font-display">
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="text-auto-lg text-muted-foreground leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-auto-base text-muted-foreground/80 leading-relaxed mb-6">
                          {feature.longDescription}
                        </p>
                        <Button
                          variant="ghost"
                          className={`p-2 h-auto ${index % 2 === 1 ? "text-[#FFB81C]" : "text-[#00984E]"} hover:scale-105 transition-transform group`}
                        >
                          <span className="font-semibold">Learn more</span>
                          <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="lg:w-1/2">
                    <div
                      className={`${index % 2 === 1 ? "panel-amber" : "panel-green"} p-12`}
                    >
                      <div className="grid grid-cols-2 gap-6">
                        <motion.div
                          className={`${index % 2 === 1 ? "panel-amber-inner" : "panel-green-inner"} p-8 hover-lift `}
                          whileHover={{ scale: 1.05, y: -5 }}
                        >
                          <BarChart3
                            className={`h-12 w-12 mb-4 ${index % 2 === 1 ? "text-[#FFB81C]" : "text-[#00984E]"}`}
                          />
                          <div className="text-3xl font-bold mb-2 font-display">
                            98.7%
                          </div>
                          <div className="text-sm opacity-80">
                            User Satisfaction
                          </div>
                        </motion.div>
                        <motion.div
                          className={`${index % 2 === 1 ? "panel-amber-inner" : "panel-green-inner"} p-8 hover-lift`}
                          whileHover={{ scale: 1.05, y: -5 }}
                        >
                          <TrendingUp
                            className={`h-12 w-12 mb-4 ${index % 2 === 1 ? "text-[#FFB81C]" : "text-[#00984E]"}`}
                          />
                          <div className="text-3xl font-bold mb-2 font-display">
                            2.1M
                          </div>
                          <div className="text-sm opacity-80">Daily Routes</div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="usecases" className="bg-muted/30 section-padding">
        <div className="container">
          <AnimatedSection className="mx-auto max-w-4xl text-center mb-20">
            <Badge
              variant="outline"
              className="mb-6 border-brand/30 bg-brand-50 dark:bg-brand-950 text-brand dark:text-white px-4 py-3"
            >
              <Lightbulb className="w-4 h-4 mr-2 text-brand dark:text-white" />
              Use Cases
            </Badge>
            <h2 className="mb-8 text-auto-4xl font-bold tracking-tight font-display">
              Powering Nigeria's Movement
            </h2>
            <p className="text-auto-xl text-muted-foreground leading-relaxed">
              From individual commuters to large enterprises, NINja Map serves
              diverse navigation needs across Nigeria's dynamic landscape.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group h-full"
                >
                  <Card className="usecase-card hover-lift h-full overflow-hidden">
                    <CardHeader className="pb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border-thin-green`}>
                        <useCase.icon className="h-6 w-6 text-[#00984E]" />
                      </div>
                      <CardTitle className="text-auto-xl mb-4 font-display">
                        {useCase.title}
                      </CardTitle>
                      <CardDescription className="text-auto-base leading-relaxed">
                        {useCase.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-6">
                        {[
                          "Real-time optimization",
                          "Nigerian-specific features",
                          "Offline capabilities"
                        ].map((feature, itemIndex) => (
                          <div key={itemIndex} className="flex items-center space-x-3">
                            <CheckCircle className="h-4 w-4 text-[#00984E] flex-shrink-0" />
                            <span className="text-auto-sm text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-border/40">
                        <div className="flex items-center justify-between">
                          <span className="text-auto-sm text-[#FFB81C] font-medium">{useCase.users}</span>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 rounded-lg bg-[#00984E] text-white font-medium border border-[#00984E] transition-colors hover:bg-[#FFB81C] hover:text-black hover:border-[#FFB81C]"
                          >
                            Learn More
                          </motion.button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="section-padding">
        <div className="container">
          <AnimatedSection className="mx-auto max-w-4xl text-center mb-20">
            <Badge
              variant="outline"
              className="mb-6 border-brand/30 bg-brand-50 dark:bg-brand-950 text-brand dark:text-white px-4 py-3"
            >
              <Cpu className="w-4 h-4 mr-2 text-brand dark:text-white" />
              Advanced Technology
            </Badge>
            <h2 className="mb-8 text-auto-4xl font-bold tracking-tight font-display">
              Enterprise-Grade Infrastructure
            </h2>
            <p className="text-auto-xl text-muted-foreground leading-relaxed">
              Powered by cutting-edge artificial intelligence, deployed on
              sovereign Nigerian cloud infrastructure, and engineered with
              military-grade security protocols for unparalleled performance and
              reliability.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {techSpecs.map((spec, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group h-full"
                >
                  <Card className="usecase-card hover-lift h-full overflow-hidden ">
                    <CardHeader className="pb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border-thin-green`}>
                        <spec.icon className="h-6 w-6 text-[#00984E]" />
                      </div>
                      <CardTitle className="text-auto-xl mb-4 font-display">
                        {spec.title}
                      </CardTitle>
                      <CardDescription className="text-auto-base leading-relaxed">
                        {spec.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-center text-[#FFB81C] font-display">
                          {spec.metric}
                        </div>
                        <div className="text-xs text-muted-foreground text-center">
                          {spec.metricLabel}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground/80 leading-relaxed mb-6">
                        {spec.details}
                      </p>
                      <div className="pt-4 border-t border-border/40">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>Reliability</span>
                          <span>99.9%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#00984E] via-[#00984E] to-[#FFB81C] rounded-full"
                            initial={{ width: "0%" }}
                            whileInView={{ width: "99%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: index * 0.2, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.8}>
            <div className="panel-metrics p-12 lg:p-16 text-white">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h3 className="text-auto-3xl font-bold mb-8 font-display">
                    Enterprise Performance Metrics
                  </h3>
                  <div className="space-y-4">
                    {[
                      "99.99% uptime SLA with multi-region redundancy",
                      "Sub-100ms response times nationwide",
                      "Military-grade AES-256 encryption",
                      "Real-time sync across 2.5M+ concurrent users",
                      "AI-powered route optimization algorithms",
                      "24/7 monitoring with automatic failover",
                      "Edge computing for reduced latency",
                      "Blockchain-secured data integrity",
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start space-x-4"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <CheckCircle className="h-6 w-6 mt-1 flex-shrink-0 opacity-90 text-[#00984E]" />
                        <span className="text-auto-base opacity-90 leading-relaxed">
                          {item}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {[
                    { metric: "2.5M+", label: "Active Users", icon: Users },
                    { metric: "2.1M", label: "Daily Routes", icon: Clock },
                    { metric: "2.5M+", label: "Active Users", icon: Users },
                    { metric: "2.1M", label: "Daily Routes", icon: Globe },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="metrics-stat p-8"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <item.icon className="h-8 w-8 mx-auto mb-3 text-[#00984E]" />
                      <div className="text-auto-2xl font-bold mb-1 font-display text-foreground">
                        {item.metric}
                      </div>
                      <div className="text-auto-sm text-muted-foreground">
                        {item.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Community Impact Section */}
      <section id="community" className="bg-muted/30 section-padding">
        <div className="container">
          <AnimatedSection className="mx-auto max-w-4xl text-center mb-20">
            <Badge
              variant="outline"
              className="mb-6 border-brand/30 bg-brand-50 dark:bg-brand-950 text-brand dark:text-white px-4 py-3"
            >
              <Heart className="w-4 h-4 mr-2 text-brand dark:text-white" />
              Community Impact
            </Badge>
            <h2 className="mb-8 text-auto-4xl font-bold tracking-tight font-display">
              Empowering Nigerian Communities
            </h2>
            <p className="text-auto-xl text-muted-foreground leading-relaxed">
              Beyond navigation, NINja Map contributes to Nigeria's development by supporting local businesses,
              improving safety, and building stronger communities across all 36 states.
            </p>
          </AnimatedSection>

          {/* Impact Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              { number: "150K+", label: "Local Businesses Listed", icon: Building },
              { number: "500K+", label: "Safety Reports Filed", icon: Shield },
              { number: "2M+", label: "Hours of Traffic Saved", icon: Clock },
              { number: "36", label: "States Connected", icon: Globe }
            ].map((stat, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  className="text-center p-6 rounded-2xl usecase-card hover-lift"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 border-thin-green">
                    <stat.icon className="h-6 w-6 text-[#00984E]" />
                  </div>
                  <div className="text-auto-3xl font-bold mb-2 font-display text-[#00984E] dark:text-gradient-green-amber">
                    {stat.number}
                  </div>
                  <p className="text-auto-sm text-muted-foreground font-medium dark:text-white/70">
                    {stat.label}
                  </p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>

          {/* Community Features Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: Building,
                title: "Support Local Business",
                description: "Discover and promote Nigerian-owned businesses in your area",
                features: ["Business directory", "Reviews and ratings", "Direct contact info", "Opening hours"],
                color: "from-blue-500 to-purple-600"
              },
              {
                icon: Shield,
                title: "Enhanced Safety Network",
                description: "Community-driven safety reporting for safer Nigerian roads",
                features: ["Real-time incident reports", "Road condition updates", "Police checkpoint alerts", "Emergency assistance"],
                color: "from-green-500 to-blue-600"
              },
              {
                icon: Users,
                title: "Connect Communities",
                description: "Bridge the gap between Nigerian communities nationwide",
                features: ["Local event discovery", "Community announcements", "Cultural landmark info", "Regional insights"],
                color: "from-purple-500 to-pink-600"
              }
            ].map((feature, index) => (
              <AnimatedSection key={index} delay={index * 0.2}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group"
                >
                  <Card className="usecase-card hover-lift hover-panel-amber transition-all duration-300 h-full overflow-hidden">
                    <CardHeader className="pb-6">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 border-thin-green group-hover:border-[#FFB81C]">
                        <feature.icon className="h-6 w-6 text-[#00984E] group-hover:text-[#FFB81C]" />
                      </div>
                      <CardTitle className="text-auto-xl mb-4 font-display">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-auto-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {feature.features.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-center space-x-3">
                            <CheckCircle className="h-4 w-4 text-[#00984E] group-hover:text-[#FFB81C] flex-shrink-0" />
                            <span className="text-auto-sm text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 pt-4 border-t border-border/40">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full px-4 py-3 rounded-lg bg-[#00984E] text-white font-medium border border-[#00984E] transition-colors hover:bg-[#FFB81C] hover:text-black hover:border-[#FFB81C]"
                        >
                          Learn More
                        </motion.button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Redesigned with Large Images */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-muted/20 to-background relative overflow-hidden">
        <div className="container">
          <AnimatedSection className="mx-auto max-w-4xl text-center mb-16">
            <Badge
              variant="outline"
              className="mb-6 border-brand/30 bg-brand-50 dark:bg-brand-950 text-brand dark:text-white px-4 py-2"
            >
              <Heart className="w-4 h-4 mr-2 text-brand dark:text-white" />
              Customer Stories
            </Badge>
            <h2 className="mb-6 text-auto-4xl font-bold tracking-tight font-display">
              Loved by Millions Across Nigeria
            </h2>
            <p className="text-auto-xl text-muted-foreground leading-relaxed">
              Join the growing community of satisfied users who've revolutionized their navigation experience.
            </p>
          </AnimatedSection>

          {/* Large Image Testimonial Card */}
          <div className="max-w-7xl mx-auto">
            <AnimatedSection>
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative"
              >
                <Card className="border-0 shadow-2xl glass-strong overflow-hidden bg-gradient-to-br from-background to-muted/30">
                  <CardContent className="p-0">
                    <div className="grid lg:grid-cols-2 gap-0 items-center min-h-[500px]">
                      {/* Large User Image Side */}
                      <div className="relative h-80 lg:h-[500px] overflow-hidden">
                        <img
                          src={testimonials[currentTestimonial].image}
                          alt={testimonials[currentTestimonial].name}
                          className="w-full h-full object-contain object-center"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/40 to-orange-700/40"  style={{
                            zIndex: -1
                          }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                        {/* Floating badge */}
                        <div className="absolute top-6 left-6">
                          <div className="bg-white/90 backdrop-blur-sm text-[#036A38] px-4 py-2 rounded-full shadow-lg border border-white/20">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm font-medium">{testimonials[currentTestimonial].location}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content Side */}
                      <div className="p-8 lg:p-12 flex flex-col justify-center">
                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{
                                  delay: i * 0.1,
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 15
                                }}
                              >
                                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                              </motion.div>
                            ))}
                          </div>
                          <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                            {testimonials[currentTestimonial].rating}.0
                          </span>
                        </div>

                        {/* Quote */}
                        <div className="relative my-12">
                          <Quote className="absolute -top-4 -left-4 h-12 w-12 text-white/20" />
                          <blockquote className="text-auto-xl lg:text-auto-2xl text-foreground leading-relaxed font-medium pl-8 italic">
                            "{testimonials[currentTestimonial].content}"
                          </blockquote>
                        </div>

                        {/* Author Info */}
                        <div className="border-t border-border/40">
                          <h3 className="text-auto-xl font-medium font-display mb-2">
                            {testimonials[currentTestimonial].name}
                          </h3>
                          <p className="text-auto-lg  text-[#036A38] font-regular mb-1">
                            {testimonials[currentTestimonial].role}
                          </p>
                          <p className="text-auto-base text-muted-foreground">
                            {testimonials[currentTestimonial].company}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatedSection>

            {/* Enhanced Navigation */}
            <div className="flex flex-col items-center gap-8 mt-12">
              {/* User Thumbnails */}
              <div className="flex items-center justify-center gap-4">
                {testimonials.map((testimonial, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`relative transition-all duration-300 ${
                      index === currentTestimonial
                        ? 'ring-1 rounded-full ring-brand ring-offset-4 ring-offset-background scale-120'
                        : 'opacity-30 hover:opacity-50 hover:scale-105 scale-90'
                    }`}
                    whileHover={{ scale: index === currentTestimonial ? 1.1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover shadow-lg"
                      loading="lazy"
                    />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Download CTA */}
      <section className="cta-gradient-bg section-padding text-white relative overflow-hidden ">
        <div className="container relative">
          <AnimatedSection className="mx-auto max-w-5xl text-center ">
            <Badge
              variant="outline"
              className="mb-8 text-white text-lg px-6 py-3 rounded-full bg-white/10 border border-white/20"
            >
              <Rocket className="w-5 h-5 mr-2 text-white" />
              Start Your Journey Today
            </Badge>
            <h2 className="mb-8 text-auto-5xl font-bold tracking-tight font-display">
              Ready to Navigate Like a Nigerian?
            </h2>
            <p className="mb-16 text-auto-xl opacity-90 leading-relaxed max-w-4xl mx-auto">
              Join millions of Nigerians who've already revolutionized their
              navigation experience. Download NINja Map today and discover why
              it's the most trusted mapping platform in Nigeria.
            </p>

            <div className="flex flex-col sm:flex-row gap-8 justify-center mb-16">
              <motion.div
                className=" dark:bg-[#036A38] dark:text-[white] bg-[white] text-[#036A38]  border border-[#036A38] rounded-xl px-8 py-4 shadow-2xl font-display text-auto-xl font-medium transition-all duration-200 hover:shadow-3xl hover:brightness-105 cursor-pointer flex items-center justify-center"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Smartphone className="mr-3 h-6 w-6" />
                Download for Android
              </motion.div>

              <motion.div
                className="btn-ios-outline bg-[#1E7A50] text-white border border-[#1E7A50] rounded-xl px-8 py-4 shadow-2xl font-display text-auto-xl font-medium cursor-pointer flex items-center justify-center hover:brightness-110 dark:bg-transparent dark:border-0"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Smartphone className="mr-3 h-6 w-6" />
                Download for iOS
              </motion.div>
            </div>

            <div className="grid grid-cols-3 gap-8 text-center">
              {[
                { icon: Crown, text: "Premium Free Forever", metric: "100%" },
                { icon: Shield,text: "Privacy Guaranteed",metric: "Military-Grade"},
                { icon: Headphones, text: "Expert Support", metric: "24/7" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="opacity-90 hover:opacity-100 transition-all duration-300 group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 0.9, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ opacity: 1, scale: 1.05 }}
                >
                  <item.icon className="h-12 w-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <div className="text-auto-lg font-bold mb-2 font-display">
                    {item.metric}
                  </div>
                  <div className="text-auto-base font-medium opacity-90">
                    {item.text}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
