import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, Shield, AlertTriangle, Users, Building, CheckCircle, ScrollText, Eye } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

export default function Terms() {
  const [activeSection, setActiveSection] = useState("introduction");
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});
  const navRef = useRef<HTMLDivElement>(null);

  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: FileText,
      content: [
        "Welcome to NINja Map, Nigeria's premier AI-powered navigation platform. These Terms and Conditions constitute a legally binding agreement between you and Dollop Infotech Pvt. Ltd. governing your use of our navigation services.",
        "By accessing, downloading, or using NINja Map in any capacity, you acknowledge that you have read, understood, and agree to be bound by these terms. If you do not agree with any part of these terms, you must discontinue use of our service immediately.",
        "We reserve the right to modify, update, or replace these terms at any time at our sole discretion. Material changes will be communicated through the app or via email. Your continued use of NINja Map after any such changes constitutes acceptance of the new terms.",
        "These terms apply to all users of NINja Map, including visitors, registered users, premium subscribers, and enterprise clients unless separate commercial agreements are in place."
      ]
    },
    {
      id: "usage",
      title: "Usage Policy",
      icon: Users,
      content: [
        "NINja Map is provided for personal, non-commercial use under this standard license. Commercial use requires a separate business license agreement with additional terms and pricing.",
        "You agree to use our service responsibly, ethically, and in compliance with all applicable laws and regulations in Nigeria and your jurisdiction. You must not use NINja Map for any illegal, harmful, or unauthorized purposes.",
        "You are prohibited from: (a) Reverse engineering, decompiling, or attempting to extract source code; (b) Redistributing or reselling our mapping data; (c) Using automated systems to access our service; (d) Interfering with our servers or other users' experience.",
        "Commercial users, fleet operators, and businesses must obtain appropriate licensing. This includes ride-sharing services, delivery companies, logistics firms, and any entity using NINja Map for revenue-generating activities."
      ]
    },
    {
      id: "limitations",
      title: "Service Limitations",
      icon: AlertTriangle,
      content: [
        "NINja Map is provided 'as is' without warranties of any kind. While we strive for accuracy, we cannot guarantee that our navigation data, routes, or traffic information is always current, complete, or error-free.",
        "We are not liable for any damages resulting from your use of NINja Map, including but not limited to: accidents, delays, missed appointments, fuel costs, toll fees, or any indirect, incidental, or consequential damages.",
        "Our service depends on various external factors including GPS satellites, cellular networks, and third-party data providers. Service interruptions, inaccuracies, or unavailability may occur due to factors beyond our control.",
        "Maximum liability is limited to the amount paid for premium services in the preceding 12 months. For free users, our liability is limited to the minimum extent permitted by Nigerian law."
      ]
    },
    {
      id: "privacy",
      title: "Privacy & Data",
      icon: Shield,
      content: [
        "Your privacy is fundamental to our service. We collect location data, usage patterns, and device information solely to provide and improve navigation services. All data handling complies with the Nigerian Data Protection Regulation (NDPR).",
        "Location data is encrypted during transmission and storage. We implement industry-standard security measures including AES-256 encryption, secure authentication protocols, and regular security audits by third-party specialists.",
        "We may share aggregated, anonymized traffic and usage data with partners to improve road infrastructure and traffic management. Personal identifiable information is never shared without explicit consent except as required by law.",
        "You have rights to access, correct, delete, or port your data. Contact our Data Protection Officer at privacy@ninjamap.ng for any data-related requests or concerns."
      ]
    },
    {
      id: "payment",
      title: "Payment Terms",
      icon: Building,
      content: [
        "Premium features are available through subscription plans billed monthly or annually. All prices are listed in Nigerian Naira (NGN) and exclude applicable taxes unless otherwise stated.",
        "Subscriptions automatically renew unless cancelled at least 24 hours before the renewal date. You can manage your subscription through your account settings or the respective app store.",
        "Refunds are available within 14 days of purchase for annual subscriptions, or 7 days for monthly subscriptions, provided usage is minimal. Premium features accessed during the refund period may affect eligibility.",
        "Enterprise and bulk licenses require separate commercial agreements with custom terms, pricing, and support levels. Contact our business team at enterprise@ninjamap.ng for commercial licensing."
      ]
    },
    {
      id: "changes",
      title: "Changes & Updates",
      icon: Clock,
      content: [
        "We continuously improve NINja Map through regular updates that may modify features, user interface, or functionality. Critical updates may be mandatory and automatically applied for security or legal compliance.",
        "Major changes to these terms will be announced through in-app notifications, email, or website announcements at least 30 days before implementation. Minor clarifications or legal updates may be implemented immediately.",
        "Your continued use of NINja Map after changes constitutes acceptance of updated terms. If you disagree with modifications, you must discontinue use and may be entitled to a prorated refund of unused premium services.",
        "We reserve the right to discontinue or modify features, pricing, or availability of NINja Map at any time with reasonable notice to users."
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
      <section className="section-padding bg-gradient-to-br from-brand/5 via-background to-gradient-to/5 relative overflow-hidden">
        <div className="absolute inset-0 hero-pattern opacity-30" />
        <div className="container relative">
          <AnimatedSection className="mx-auto max-w-4xl text-center">
            <Badge
              variant="outline"
              className="mb-6 border-brand/30 bg-brand/10 text-brand px-6 py-3 text-auto-sm font-medium"
            >
              <ScrollText className="w-4 h-4 mr-2" />
              Terms & Conditions
            </Badge>
            <h1 className="mb-6 text-auto-5xl font-bold tracking-tight font-display text-shimmer">
              Terms of Service
            </h1>
            <p className="text-auto-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
              Please read these terms and conditions carefully before using NINja Map. 
              These terms govern your use of our navigation services and platform.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12">
              {[
                { label: "Last Updated", value: "Dec 2024", icon: Clock },
                { label: "Effective Date", value: "Jan 1, 2024", icon: CheckCircle },
                { label: "Version", value: "2.1", icon: Eye }
              ].map((stat, index) => (
                <AnimatedSection key={index} delay={0.1 * index}>
                  <Card className="border-0 shadow-lg glass">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-brand rounded-xl flex items-center justify-center mx-auto mb-4">
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-auto-base font-bold text-brand mb-1">
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
                    ? 'bg-brand text-white shadow-lg'
                    : 'text-muted-foreground hover:text-brand hover:bg-brand/5'
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
                        <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-lg">
                          <section.icon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-auto-2xl font-bold font-display text-brand">
                            {section.title}
                          </h2>
                          <div className={`w-16 h-1 bg-brand rounded-full mt-2 ${
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

      {/* Footer CTA */}
      <section className="section-bottom-padding">
        <div className="container">
          <AnimatedSection>
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-brand to-gradient-to text-white overflow-hidden">
              <CardContent className="p-12 text-center relative">
                <div className="absolute inset-0 bg-pattern opacity-20" />
                <div className="relative z-10">
                  <h3 className="text-auto-3xl font-bold font-display mb-4">
                    Have Questions About These Terms?
                  </h3>
                  <p className="text-auto-lg opacity-90 mb-8 max-w-2xl mx-auto">
                    Our legal team is available to clarify any aspect of these terms and conditions.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.a
                      href="/contact"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 bg-white text-brand px-6 py-3 rounded-lg hover:bg-white/90 transition-all font-medium text-auto-sm shadow-lg hover:shadow-xl"
                    >
                      Contact Legal Team
                    </motion.a>
                    <motion.a
                      href="/privacy"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-all font-medium text-auto-sm"
                    >
                      Read Privacy Policy
                    </motion.a>
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
