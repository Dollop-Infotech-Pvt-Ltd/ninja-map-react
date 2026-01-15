import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, Shield, AlertTriangle, Users, Building, CheckCircle, ScrollText, Eye, Loader2, Settings, Database, Share2, Lock, Cookie } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { get } from "@/lib/http";
import { PolicyResponse, PolicyDocument } from "@shared/api";

export default function Terms() {
  const [activeSection, setActiveSection] = useState("introduction");
  const [termsData, setTermsData] = useState<PolicyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});
  const navRef = useRef<HTMLDivElement>(null);

  // Fetch Terms and Conditions data
  useEffect(() => {
    const fetchTermsData = async () => {
      try {
        setLoading(true);
        const response = await get<PolicyResponse>(
          "/api/policies/get-all?documentType=TERMS_AND_CONDITIONS&pageSize=10&pageNumber=0&sortDirection=ASC&sortKey=createdDate"
        );
        setTermsData(response.content);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch terms data:", err);
        setError("Failed to load terms information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTermsData();
  }, []);

  // Map icon names from API to actual icon components
  const getIconComponent = (title: string) => {
    const iconMap: { [key: string]: any } = {
      "Introduction": FileText,
      "Usage Policy": Users,
      "Service Limitations": AlertTriangle,
      "Privacy & Data": Shield,
      "Payment Terms": Building,
      "Changes & Updates": Clock,
      "Data Collection": Database,
      "How We Use Your Data": Settings,
      "Data Sharing": Share2,
      "Data Security": Lock,
      "Cookies & Tracking": Cookie,
      "Your Rights": Users
    };
    return iconMap[title] || FileText;
  };

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

      // Use dynamic terms data if available, otherwise use static sections
      const sectionsToCheck = termsData.length > 0 
        ? termsData.map(t => ({ id: t.title.toLowerCase().replace(/\s+/g, '-') }))
        : sections;

      for (const section of sectionsToCheck) {
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
  }, [termsData]);

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
            {/* Show dynamic tabs if API data is loaded, otherwise show static tabs */}
            {!loading && termsData.length > 0 ? (
              termsData.map((term) => {
                const sectionId = term.title.toLowerCase().replace(/\s+/g, '-');
                const IconComponent = getIconComponent(term.title);
                
                return (
                  <motion.button
                    key={term.id}
                    onClick={() => scrollToSection(sectionId)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-auto-sm transition-all whitespace-nowrap ${
                      activeSection === sectionId
                        ? 'bg-[#00984E] text-white shadow-lg'
                        : 'text-muted-foreground hover:text-[#00984E] hover:bg-[#00984E]/5'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {term.title}
                  </motion.button>
                );
              })
            ) : (
              sections.map((section) => (
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
              ))
            )}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-16">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-[#00984E]" />
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <AnimatedSection>
                <Card className="border-0 shadow-xl glass-strong">
                  <CardContent className="p-12 text-center">
                    <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-auto-xl font-bold mb-2">Unable to Load Content</h3>
                    <p className="text-muted-foreground">{error}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {/* Dynamic API Content */}
            {!loading && !error && termsData.length > 0 && termsData.map((term, index) => {
              const IconComponent = getIconComponent(term.title);
              const sectionId = term.title.toLowerCase().replace(/\s+/g, '-');
              
              return (
                <div
                  key={term.id}
                  ref={(el) => (sectionsRef.current[sectionId] = el)}
                  id={sectionId}
                >
                  <AnimatedSection delay={0.1 * index}>
                    <Card className="border-0 shadow-xl glass-strong">
                      <CardContent className="p-8 lg:p-12">
                        <div className="flex items-start gap-4 mb-8">
                          {term.image ? (
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden bg-gradient-to-br from-[#036A38] to-[#00984E]">
                              <img 
                                src={term.image} 
                                alt={term.title}
                                className="w-10 h-10 object-contain"
                                onError={(e) => {
                                  // Fallback to icon if image fails to load
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    const icon = document.createElement('div');
                                    icon.innerHTML = `<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/></svg>`;
                                    parent.appendChild(icon.firstChild!);
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-[#036A38] to-[#00984E] rounded-2xl flex items-center justify-center shadow-lg">
                              <IconComponent className="h-8 w-8 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h2 className="text-auto-2xl font-bold font-display text-[#00984E]">
                              {term.title}
                            </h2>
                            <div className={`w-16 h-1 bg-[#00984E] rounded-full mt-2 ${
                              activeSection === sectionId ? 'animate-pulse' : ''
                            }`} />
                          </div>
                        </div>

                        <div className="space-y-6">
                          <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-auto-base text-muted-foreground leading-relaxed"
                          >
                            {term.description}
                          </motion.p>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedSection>
                </div>
              );
            })}

            {/* Static Fallback Sections (shown if API fails or returns no data) */}
            {!loading && !error && termsData.length === 0 && sections.map((section, index) => (
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

      {/* Footer CTA */}
      <section className="section-bottom-padding">
        <div className="container">
          <AnimatedSection>
            <Card className="border-0 shadow-2xl panel-metrics text-white overflow-hidden rounded-2xl">
              <CardContent className="p-16 text-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.1),transparent)]" />
                <div className="relative z-10 max-w-3xl mx-auto">
                  <h3 className="text-auto-3xl font-bold font-display mb-4">
                    Have Questions About These Terms?
                  </h3>
                  <p className="text-auto-lg opacity-90 mb-10 leading-relaxed">
                    Our legal team is available to clarify any aspect of these terms and conditions.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <a
                        href="/contact"
                        className=  "bg-white text-[#036A38] dark:bg-[#036A38] dark:text-white flex items-center text-auto-lg cursor-pointer rounded-xl px-8 py-4 font-medium transition-all duration-200 ease-out shadow-[0_4px_15px_rgba(3,106,56,0.3)] hover:shadow-[0_8px_25px_rgba(3,106,56,0.35)] hover:-translate-y-0.5"
                      >
                        Contact Legal Team
                      </a>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
                      <a
                        href="/privacy"
                        className="flex items-center btn-ios-outline text-auto-lg cursor-pointer  btn-ios-outline text-auto-lg  btn-ios-outline bg-[#1E7A50] text-white border border-[#1E7A50] rounded-xl px-8 py-4 shadow-2xl font-display text-auto-xl font-medium  justify-center hover:brightness-110 dark:bg-transparent dark:border-0"
                      >
                        Read Privacy Policy
                      </a>
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
