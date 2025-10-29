import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, 
  Eye, 
  MapPin, 
  Users, 
  Cookie, 
  Settings, 
  Lock, 
  Share2, 
  Database, 
  Trash2,
  FileText,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

export default function Privacy() {
  const [activeSection, setActiveSection] = useState("overview");
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});
  const navRef = useRef<HTMLDivElement>(null);

  const sections = [
    {
      id: "overview",
      title: "Privacy Overview",
      icon: Shield,
      content: [
        "At NINja Map, your privacy is not just a legal obligation—it's fundamental to building trust with millions of Nigerian drivers. This Privacy Policy explains how we collect, use, protect, and share your information when you use our navigation services.",
        "We are committed to transparency in our data practices and compliance with the Nigerian Data Protection Regulation (NDPR), General Data Protection Regulation (GDPR), and other applicable privacy laws.",
        "This policy applies to all interactions with NINja Map, including our mobile applications, website, APIs, and any related services. We may update this policy periodically, and material changes will be communicated clearly.",
        "By using NINja Map, you acknowledge that you have read and understand this Privacy Policy and consent to the collection and use of your information as described herein."
      ]
    },
    {
      id: "collection",
      title: "Data Collection",
      icon: Database,
      content: [
        "We collect location data essential for navigation services, including GPS coordinates, speed, direction, and nearby points of interest. This data enables real-time routing, traffic analysis, and location-based recommendations.",
        "Device information including device type, operating system, unique device identifiers, and app usage patterns help us optimize performance and provide device-specific features and troubleshooting.",
        "Account information such as name, email, phone number, and payment details (for premium users) are collected during registration and subscription processes. We use secure payment processors and never store complete credit card numbers.",
        "User-generated content including reviews, reports, photos, and feedback shared through our platform may be stored and used to improve services for all users while maintaining your privacy preferences."
      ]
    },
    {
      id: "usage",
      title: "How We Use Your Data",
      icon: Settings,
      content: [
        "Navigation services: Your location data enables core features including route calculation, turn-by-turn directions, real-time traffic updates, and arrival time estimates. All processing prioritizes accuracy and user safety.",
        "Service improvement: Aggregated, anonymized usage patterns help us enhance map accuracy, optimize routing algorithms, identify infrastructure needs, and develop new features that benefit the Nigerian driving community.",
        "Personalization: We customize your experience based on frequent destinations, preferred routes, and usage patterns while ensuring this data remains secure and under your control.",
        "Safety and security: We monitor for suspicious activities, enforce terms of service, prevent fraud, and may cooperate with law enforcement when legally required or to protect user safety."
      ]
    },
    {
      id: "sharing",
      title: "Data Sharing",
      icon: Share2,
      content: [
        "We never sell your personal data to third parties. Any data sharing is strictly governed by this policy and done with appropriate safeguards to protect your privacy and comply with applicable laws.",
        "Service providers: Trusted partners including cloud hosting, payment processing, customer support, and analytics providers may access limited data necessary to provide their services under strict confidentiality agreements.",
        "Aggregated insights: We may share anonymized, aggregated traffic and usage data with government agencies, urban planners, and research institutions to improve Nigerian transportation infrastructure.",
        "Legal compliance: We may disclose information when required by law, court orders, or to protect rights, property, or safety of our users, company, or the public as permitted by Nigerian and international law."
      ]
    },
    {
      id: "security",
      title: "Data Security",
      icon: Lock,
      content: [
        "Encryption: All data transmission uses TLS 1.3 encryption, and sensitive data is encrypted at rest using AES-256 encryption. Location data is anonymized in our systems and never stored with personally identifiable information unnecessarily.",
        "Access controls: Employee access to personal data is strictly limited based on job requirements, with multi-factor authentication, regular access reviews, and comprehensive audit logging of all data access activities.",
        "Infrastructure security: Our systems undergo regular security assessments, penetration testing, and compliance audits. We maintain SOC 2 Type II certification and follow industry best practices for cloud security.",
        "Incident response: We have established procedures for detecting, responding to, and reporting security incidents. Users will be notified promptly of any breaches that may affect their personal information."
      ]
    },
    {
      id: "cookies",
      title: "Cookies & Tracking",
      icon: Cookie,
      content: [
        "Essential cookies: Required for core functionality including user authentication, security, and basic app operations. These cannot be disabled while using our services.",
        "Analytics cookies: Help us understand usage patterns, identify technical issues, and measure feature effectiveness. You can opt out of analytics cookies through your app settings without affecting functionality.",
        "Preference cookies: Remember your settings, language preferences, and customizations to enhance your user experience across sessions and devices.",
        "We do not use third-party advertising cookies or allow advertising networks to track users through our platform. Our business model is based on subscriptions and enterprise licensing, not advertising."
      ]
    },
    {
      id: "rights",
      title: "Your Rights",
      icon: Users,
      content: [
        "Access and portability: You can request a copy of all personal data we hold about you in a structured, machine-readable format. This includes location history, account information, and usage data.",
        "Correction and deletion: You can update incorrect information through your account settings or request deletion of your account and associated data. Some data may be retained for legal or safety reasons as permitted by law.",
        "Data processing control: You can object to certain data processing activities, request restriction of processing, or withdraw consent where processing is based on consent rather than legal obligations.",
        "Contact our Data Protection Officer at privacy@ninjamap.ng for any privacy-related requests, concerns, or questions. We respond to all legitimate requests within 30 days as required by NDPR."
      ]
    }
  ];

  // Scroll tracking for active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset for better UX

      for (const section of sections) {
        const element = sectionsRef.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = sectionsRef.current[sectionId];
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.offsetTop - headerOffset;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

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
              <Shield className="w-4 h-4 mr-2" />
              Privacy Policy
            </Badge>
            <h1 className="mb-6 text-auto-5xl font-bold tracking-tight font-display text-shimmer">
              Your Privacy Matters
            </h1>
            <p className="text-auto-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
              Learn how we protect your personal information and location data while providing 
              world-class navigation services to Nigerian drivers.
            </p>
            
            {/* Privacy Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {[
                { label: "NDPR Compliant", value: "100%", icon: CheckCircle },
                { label: "Data Encrypted", value: "AES-256", icon: Lock },
                { label: "Last Updated", value: "Dec 2024", icon: Clock },
                { label: "Response Time", value: "< 30 days", icon: AlertTriangle }
              ].map((stat, index) => (
                <AnimatedSection key={index} delay={0.1 * index}>
                  <Card className="border-0 shadow-lg glass usecase-card">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#036A38] to-[#00984E] rounded-xl flex items-center justify-center mx-auto mb-4">
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-auto-base font-bold text-[#00984E] mb-1">
                        {stat.value}
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

      {/* Navigation Tabs */}
      <section className="sticky top-[64px] z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container">
          <div ref={navRef} className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-thin scrollbar-thumb-brand/30 scrollbar-track-transparent">
            {sections.map((section, index) => (
              <motion.button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-auto-sm transition-all whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-[#00984E] text-white shadow-lg'
                    : 'text-muted-foreground hover:text-[#00984E] hover:bg-[#00984E]/5'
                }`}
              >
                <section.icon className="h-4 w-4" />
                {section.title}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-16">
            {sections.map((section, index) => (
              <div
                key={section.id}
                ref={(el) => (sectionsRef.current[section.id] = el)}
                id={section.id}
              >
                <AnimatedSection delay={0.1 * index}>
                  <Card className="border-0 shadow-xl glass-strong">
                    <CardContent className="p-8 lg:p-12">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#036A38] to-[#00984E] rounded-2xl flex items-center justify-center shadow-lg">
                          <section.icon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-auto-2xl font-bold font-display text-[#00984E]">
                            {section.title}
                          </h2>
                          <div className={`w-16 h-1 bg-[#00984E] rounded-full mt-2 ${
                            activeSection === section.id ? 'animate-pulse' : ''
                          }`} />
                        </div>
                      </div>

                      <div className="space-y-6">
                        {section.content.map((paragraph, pIndex) => (
                          <motion.p
                            key={pIndex}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: pIndex * 0.1 }}
                            className="text-auto-base text-muted-foreground leading-relaxed"
                          >
                            {paragraph}
                          </motion.p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Tools CTA */}
      <section className="section-bottom-padding">
        <div className="container">
          <AnimatedSection>
            <Card className="border-0 shadow-2xl panel-metrics text-white overflow-hidden rounded-2xl">
              <CardContent className="p-16 text-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.1),transparent)]" />
                <div className="relative z-10 max-w-3xl mx-auto">
                  <h3 className="text-auto-3xl font-bold font-display mb-4">
                    Take Control of Your Privacy
                  </h3>
                  <p className="text-auto-lg opacity-90 mb-10 leading-relaxed">
                    Use our privacy tools to manage your data, adjust settings, or contact our privacy team.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <a
                        href="/account/privacy"
                        className="bg-white text-[#036A38] flex items-center text-auto-lg cursor-pointer rounded-xl px-8 py-4 font-medium transition-all duration-200 ease-out shadow-[0_4px_15px_rgba(3,106,56,0.3)] hover:shadow-[0_8px_25px_rgba(3,106,56,0.35)] hover:-translate-y-0.5"
                      >
                        <Settings className="w-5 h-5 mr-2" />
                        Privacy Settings
                      </a>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
                      <a
                        href="/contact?subject=privacy"
                        className="flex items-center btn-ios-outline text-auto-lg cursor-pointer"
                      >
                        <MapPin className="w-5 h-5 mr-2" />
                        Contact DPO
                      </a>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
                      <button
                        className="flex items-center btn-ios-outline text-auto-lg cursor-pointer"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download Data
                      </button>
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
