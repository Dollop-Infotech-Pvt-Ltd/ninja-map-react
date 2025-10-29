import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  MapPin, 
  Smartphone, 
  Shield, 
  Settings, 
  Mail, 
  MessageSquare,
  CheckCircle,
  Users,
  Target,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

export default function FAQs() {
  const stats = [
    { number: "500+", label: "Questions Answered", icon: HelpCircle },
    { number: "24/7", label: "Help Available", icon: Clock },
    { number: "98%", label: "Issues Resolved", icon: CheckCircle },
    { number: "2.5M+", label: "Users Helped", icon: Users }
  ];

  const faqCategories = [
    {
      title: "General Questions",
      icon: HelpCircle,
      gradient: "from-blue-500 to-purple-600",
      questions: [
        {
          question: "What is NINja Map and how is it different from other navigation apps?",
          answer: "NINja Map is a navigation platform specifically built for Nigeria. Unlike generic mapping apps, we focus on Nigerian road conditions, local landmarks, and cultural navigation preferences. Our maps include detailed information about Nigerian cities, villages, and rural areas that other apps often miss."
        },
        {
          question: "Is NINja Map free to use?",
          answer: "Yes! NINja Map is completely free for personal use. We offer premium features for businesses and fleet operators, but all core navigation features including offline maps, real-time traffic, and community reports are free forever."
        },
        {
          question: "Which Nigerian states and cities does NINja Map cover?",
          answer: "NINja Map covers all 36 Nigerian states plus the FCT. We have detailed mapping for major cities like Lagos, Abuja, Kano, Port Harcourt, Ibadan, and over 500 towns and villages across the country. Our coverage is constantly expanding based on user feedback."
        }
      ]
    },
    {
      title: "App Usage",
      icon: Smartphone,
      gradient: "from-purple-500 to-pink-600",
      questions: [
        {
          question: "How do I download maps for offline use?",
          answer: "Open NINja Map, go to Settings > Offline Maps, then select 'Download Area'. You can choose specific states, cities, or draw a custom area. Offline maps are automatically updated when you're connected to WiFi to ensure you have the latest road information."
        },
        {
          question: "Can I use NINja Map without an internet connection?",
          answer: "Absolutely! Once you've downloaded offline maps for your area, NINja Map works completely offline. You'll still get turn-by-turn navigation, saved locations, and basic routing. Real-time traffic and community reports require an internet connection."
        },
        {
          question: "How do I report road closures or traffic incidents?",
          answer: "While navigating, tap the 'Report' button (usually a warning icon) and select the type of incident: accident, road closure, police checkpoint, or traffic jam. Your report helps other NINja Map users in real-time."
        }
      ]
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      gradient: "from-green-500 to-blue-600",
      questions: [
        {
          question: "What location data does NINja Map collect?",
          answer: "NINja Map only collects location data when you're actively using navigation. We use this data to provide directions and improve our maps. All location data is anonymized when used for traffic analysis and road improvements. You can turn off location sharing in Settings."
        },
        {
          question: "Is my personal information shared with third parties?",
          answer: "No, we never sell your personal information to third parties. NINja Map uses your data solely to improve navigation services. Anonymous usage statistics may be shared with map data providers to improve accuracy, but this never includes personally identifiable information."
        }
      ]
    },
    {
      title: "Troubleshooting",
      icon: Settings,
      gradient: "from-orange-500 to-red-600",
      questions: [
        {
          question: "Why is my GPS location inaccurate?",
          answer: "GPS accuracy can be affected by tall buildings, bad weather, or being indoors. Make sure location services are enabled for NINja Map in your phone settings. If problems persist, try restarting the app or calibrating your phone's compass by moving it in a figure-8 pattern."
        },
        {
          question: "The app is running slowly or crashing. What should I do?",
          answer: "First, make sure you have the latest version of NINja Map. Clear the app cache in your phone settings, ensure you have at least 1GB of free storage, and restart your device. If problems continue, contact our support team with your device model and app version."
        },
        {
          question: "How do I update my offline maps?",
          answer: "Offline maps update automatically when you're connected to WiFi. You can also manually check for updates in Settings > Offline Maps > Check for Updates. We recommend updating monthly to get the latest road changes and new locations."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-[#036A38]/5 via-background to-[#00984E]/5 relative overflow-hidden">
        <div className="absolute inset-0 hero-pattern opacity-30" />
        <div className="container relative">
          <AnimatedSection className="mx-auto max-w-4xl text-center flex flex-col items-center gap-3 sm:gap-4">
            <Badge
              variant="outline"
              className="mb-2 border-[0.6px] border-[#00984E] bg-[rgba(3,106,56,0.4)] text-white lg:px-6 lg:py-3 px-3 py-2 text-auto-xs font-medium"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Help Center
            </Badge>
            <h1 className="text-auto-3xl md:text-auto-4xl lg:text-auto-5xl font-bold tracking-tight font-display text-shimmer">
              Frequently Asked Questions
            </h1>
            <p className="text-auto-md md:text-auto-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Find answers to common questions about using NINja Map for navigation across Nigeria. 
              Our comprehensive help center is designed to get you back on the road quickly.
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

      {/* FAQ Categories */}
      <section className="section-padding">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-auto-3xl font-bold font-display text-[#00984E] mb-4">
              Browse by Category
            </h2>
            <p className="text-auto-lg text-muted-foreground max-w-2xl mx-auto">
              Find the answers you need organized by topic
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {faqCategories.map((category, index) => (
              <AnimatedSection key={index} delay={0.1 * index}>
                <Card className="border-0 shadow-xl text-[#00984E] hover:shadow-2xl  transition-all duration-300 h-full overflow-hidden group  dark:text-white   text-center p-6 rounded-2xl usecase-card hover-lift">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border-thin-green  ring-1 ring-white/20">
                      <category.icon className="h-8 w-8 text-[#00984E] " />
                    </div>

                    <h3 className="text-auto-lg font-bold font-display mb-4">
                      {category.title}
                    </h3>
                    <p className="text-auto-sm text-muted-foreground">
                      {category.questions.length} questions answered
                    </p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="section-padding bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <div className="mx-auto max-w-4xl space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <AnimatedSection key={category.title} delay={categoryIndex * 0.1}>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[rgba(255,255,255,0.08)] rounded-xl shadow-lg">
                      <category.icon className="h-6 w-6 text-[#00984E] dark:text-white" />
                    </div>
                    <h2 className="text-auto-2xl font-bold font-display text-[#00984E]">
                      {category.title}
                    </h2>
                  </div>
                  
                  <Card className="border-0 shadow-lg glass overflow-hidden">
                    <CardContent className="p-0">
                      <Accordion type="single" collapsible className="w-full">
                        {category.questions.map((faq, index) => (
                          <AccordionItem
                            key={index}
                            value={`${categoryIndex}-${index}`}
                            className="border-border/40 last:border-b-0"
                          >
                            <AccordionTrigger className="px-6 py-5 text-left text-auto-base font-medium hover:text-[#00984E] transition-colors hover:bg-[#036A38]/5">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6 text-auto-sm text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="section-bottom-padding">
        <div className="container">
          <AnimatedSection>
            <Card className="border-0 shadow-2xl panel-metrics text-white overflow-hidden rounded-2xl">
              <CardContent className="p-12 text-center relative">
                <div className="absolute inset-0 bg-pattern opacity-20" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg bg-green-amber-280 ring-1 ring-white/20">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-auto-3xl font-bold font-display mb-4">
                    Still Need Help?
                  </h2>
                  <p className="text-auto-lg opacity-90 max-w-2xl mx-auto mb-8">
                    Can't find the answer you're looking for? Our support team is here to help you 
                    get the most out of your NINja Map experience.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link to="/contact">
                        <Button className="flex items-center justify-center gap-3 bg-white text-green-800 rounded-xl px-10 py-4 h-14 text-lg font-semibold transition-all duration-200 ease-out dark:bg-[#036A38] dark:text-white shadow-[0_4px_15px_rgba(3,106,56,0.3)] hover:shadow-[0_8px_25px_rgba(3,106,56,0.35)] hover:-translate-y-0.5">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contact Support
                        </Button>
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link to="/faqs" className="flex items-center btn-ios-outline h-14 px-10 rounded-xl font-semibold text-auto-lg  btn-ios-outline text-auto-lg cursor-pointer">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Us
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
