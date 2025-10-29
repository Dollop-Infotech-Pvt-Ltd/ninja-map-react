import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Heart,
  Shield,
  AlertTriangle,
  CheckCircle,
  Flag,
  MessageSquare,
  MapPin,
  Target,
  Clock,
  Award,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

export default function CommunityGuidelines() {
  const stats = [
    { number: "2.5M+", label: "Community Members", icon: Users },
    { number: "95%", label: "Positive Interactions", icon: Heart },
    { number: "24/7", label: "Moderation Active", icon: Shield },
    { number: "99%", label: "Guidelines Followed", icon: CheckCircle }
  ];

  const guidelines = [
    {
      icon: Heart,
      title: "Be Respectful and Kind",
      description: "Treat all community members with respect, regardless of their background, location, or driving experience.",
      rules: [
        "Use polite language in all reports and messages",
        "Respect cultural and regional differences across Nigeria",
        "Help new users learn the platform",
        "Avoid discriminatory or offensive language"
      ],
      gradient: "from-[#036A38] to-[#00984E]"
    },
    {
      icon: CheckCircle,
      title: "Share Accurate Information",
      description: "Only report information that you can verify. Accurate reports help keep everyone safe on Nigerian roads.",
      rules: [
        "Verify incidents before reporting",
        "Update reports if situations change",
        "Don't share rumors or unconfirmed information",
        "Include specific location details when possible"
      ],
      gradient: "from-[#036A38] to-[#00984E]"
    },
    {
      icon: Shield,
      title: "Prioritize Safety",
      description: "Never use the app while driving. Pull over safely before making reports or interacting with the community.",
      rules: [
        "Only interact with the app when safely stopped",
        "Use voice commands when available",
        "Don't take photos while driving",
        "Report dangerous situations to authorities when appropriate"
      ],
      gradient: "from-[#036A38] to-[#00984E]"
    },
    {
      icon: MapPin,
      title: "Keep Reports Relevant",
      description: "Focus on traffic, road conditions, and navigation-related information that helps other drivers.",
      rules: [
        "Report traffic jams, accidents, and road closures",
        "Share information about road conditions",
        "Alert others to police checkpoints respectfully",
        "Avoid off-topic or personal messages"
      ],
      gradient: "from-[#036A38] to-[#00984E]"
    }
  ];

  const violations = [
    {
      severity: "Minor",
      color: "text-white bg-[#00984E] border-yellow-200",
      examples: ["Mild inappropriate language", "Off-topic reports", "Duplicate reports"],
      consequence: "Warning and content removal"
    },
    {
      severity: "Moderate", 
      color: "text-white bg-[#00984E] border-orange-200",
      examples: ["Spam or promotional content", "Harassment of other users", "Deliberately false reports"],
      consequence: "Temporary suspension (1-7 days)"
    },
    {
      severity: "Severe",
      color: "text-white bg-[#00984E] border-red-200", 
      examples: ["Hate speech or discrimination", "Threats or violent content", "Sharing personal information"],
      consequence: "Permanent account suspension"
    }
  ];

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
              <Users className="w-4 h-4 mr-2" />
              Community Guidelines
            </Badge>
            <h1 className="mb-6 text-auto-5xl font-bold tracking-tight font-display text-shimmer">
              Building a Better Nigerian Driving Community
            </h1>
            <p className="text-auto-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
              Our community guidelines help create a safe, respectful, and helpful environment for all Nigerian drivers using NINja Map. 
              Together, we build a stronger navigation community.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {stats.map((stat, index) => (
                <AnimatedSection key={index} delay={0.1 * index}>
                  <Card className="border-0 shadow-lg glass usecase-card">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#036A38] to-[#00984E] rounded-xl flex items-center justify-center mx-auto mb-4">
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-auto-2xl font-bold text-[#00984E] mb-1">
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

      {/* Guidelines */}
      <section className="section-padding">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-auto-3xl font-bold font-display text-[#00984E] mb-4">
              Our Community Guidelines
            </h2>
            <p className="text-auto-lg text-muted-foreground max-w-2xl mx-auto">
              These guidelines help us maintain a positive community where everyone feels welcome and safe
            </p>
          </AnimatedSection>

          <div className="grid gap-12 max-w-5xl mx-auto">
            {guidelines.map((guideline, index) => (
              <AnimatedSection key={index} delay={0.1 * index}>
                <Card className="group border-0 shadow-lg hover-lift overflow-hidden glass">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Icon & Title Section */}
                      <div className={`md:w-80 bg-gradient-to-br ${guideline.gradient} p-8 flex flex-col justify-center text-white relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
                        <div className="relative z-10">
                          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg backdrop-blur-sm group-hover:scale-105 transition-transform duration-300">
                            <guideline.icon className="h-10 w-10 text-white" />
                          </div>
                          <h3 className="text-auto-2xl font-bold font-display mb-4">
                            {guideline.title}
                          </h3>
                          <p className="text-auto-base opacity-90 leading-relaxed">
                            {guideline.description}
                          </p>
                        </div>

                        {/* Subtle decorative pattern */}
                        <div className="absolute top-4 right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
                        <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/5 rounded-full blur-xl" />
                      </div>

                      {/* Rules Section */}
                      <div className="flex-1 p-8">
                        <div className="space-y-0">
                          <h4 className="text-auto-lg font-semibold text-[#00984E] mb-6 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-[#00984E]" />
                            Key Guidelines
                          </h4>

                          {guideline.rules.map((rule, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                              <div className={`w-6 h-6 bg-gradient-to-r ${guideline.gradient} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                <CheckCircle className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-auto-sm text-muted-foreground leading-relaxed">{rule}</span>
                            </div>
                          ))}

                          {/* Simple Action */}
                          <div className="pt-4 mt-6 border-t border-border/40">
                            <button className={`text-auto-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r ${guideline.gradient} text-white hover:opacity-90 transition-opacity`}>
                              View Details
                            </button>
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

      {/* Violations and Consequences */}
      <section className="section-padding bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-auto-3xl font-bold font-display text-[#00984E] mb-4">
              Violations and Consequences
            </h2>
            <p className="text-auto-lg text-muted-foreground max-w-2xl mx-auto">
              We take community guidelines seriously. Here's what happens when guidelines are violated
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {violations.map((violation, index) => (
              <AnimatedSection key={index} delay={0.1 * index}>
                <Card className="border-0 shadow-xl h-full glass usecase-card  text-[#00984E]">
                  <CardContent className="p-8">
                    <div className={`inline-block px-4 py-2 rounded-full text-auto-sm font-medium mb-6 ${violation.color}`}>
                      {violation.severity} Violation
                    </div>
                    <h3 className="font-bold text-auto-base mb-4">Examples:</h3>
                    <ul className="space-y-2 mb-6">
                      {violation.examples.map((example, i) => (
                        <li key={i} className="text-auto-sm text-muted-foreground ">
                          • {example}
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-border/40 pt-4">
                      <h4 className="font-semibold text-auto-sm mb-2">Consequence:</h4>
                      <p className="text-auto-sm text-muted-foreground">{violation.consequence}</p>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.4}>
            <Card className="border-[#00984E]/20 bg-[#00984E]/5 glass shadow-xl max-w-3xl mx-auto">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-6 text-[#FFB81C]" />
                <h3 className="text-auto-xl font-bold mb-4 font-display">
                  Appeals Process
                </h3>
                <p className="text-auto-base text-muted-foreground mb-6 leading-relaxed">
                  If you believe your account was suspended in error, you can appeal the decision by contacting our support team. 
                  We review all appeals fairly and respond within 24 hours.
                </p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#036A38] to-[#00984E] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all font-medium text-auto-sm shadow-lg hover:shadow-xl"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Contact Support
                  </Link>
                </motion.div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* Reporting Section */}
      <section className="section-bottom-padding">
        <div className="container">
          <AnimatedSection>
            <Card className="border-0 shadow-2xl panel-metrics text-white overflow-hidden rounded-2xl">
              <CardContent className="p-16 text-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.1),transparent)]" />
                <div className="relative z-10 max-w-3xl mx-auto">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg backdrop-blur-sm">
                    <Flag className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-auto-3xl font-bold font-display mb-4">
                    How to Report Violations
                  </h2>
                  <p className="text-auto-lg opacity-90 max-w-3xl mx-auto mb-10 leading-relaxed">
                    Help us maintain a positive community by reporting content that violates these guidelines.
                    Your reports help keep NINja Map safe for everyone.
                  </p>
                  <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-10">
                    <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm text-left">
                      <h3 className="font-bold text-auto-base mb-3">In the App:</h3>
                      <ul className="space-y-2 text-auto-sm opacity-90">
                        <li>• Tap and hold on inappropriate content</li>
                        <li>• Select "Report" from the menu</li>
                        <li>• Choose the violation type</li>
                        <li>• Add details about the issue</li>
                      </ul>
                    </div>
                    <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm text-left">
                      <h3 className="font-bold text-auto-base mb-3">Serious Issues:</h3>
                      <ul className="space-y-2 text-auto-sm opacity-90">
                        <li>• Email us at: community@ninjamap.ng</li>
                        <li>• Include screenshots if possible</li>
                        <li>• Provide user ID or report details</li>
                        <li>• We respond within 24 hours</li>
                      </ul>
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <a
                      href="/contact"
                      className="bg-white text-[#036A38] inline-flex items-center text-auto-lg cursor-pointer rounded-xl px-8 py-4 font-medium transition-all duration-200 ease-out shadow-[0_4px_15px_rgba(3,106,56,0.3)] hover:shadow-[0_8px_25px_rgba(3,106,56,0.35)] hover:-translate-y-0.5"
                    >
                      Report Community Issue
                    </a>
                  </motion.div>
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
