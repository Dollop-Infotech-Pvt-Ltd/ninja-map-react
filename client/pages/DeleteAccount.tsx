import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Trash2, 
  AlertTriangle, 
  Check, 
  Phone, 
  Shield,
  X,
  ChevronRight,
  Clock,
  Users,
  MapPin,
  Heart,
  CheckCircle,
  Mail,
  ArrowLeft,
  UserX,
  Database,
  History,
  Settings
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

export default function DeleteAccount() {
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agreement, setAgreement] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handlePhoneSubmit = () => {
    if (phoneNumber && agreement) {
      setCurrentStep(2);
    }
  };

  const handleOtpSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCurrentStep(3);
    setIsSubmitting(false);
  };

  const stats = [
    { number: "24-48hrs", label: "Processing Time", icon: Clock },
    { number: "30 Days", label: "Recovery Window", icon: Shield },
    { number: "100%", label: "Data Removed", icon: Database },
    { number: "Secure", label: "Verification", icon: CheckCircle }
  ];

  const dataLoss = [
    {
      icon: MapPin,
      title: "Saved Locations",
      description: "All your saved home, work, and favorite places will be permanently deleted",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: Clock,
      title: "Navigation History",
      description: "Your past routes and travel patterns will be completely removed",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: Users,
      title: "Community Contributions",
      description: "All your reports, reviews, and shared content will be lost",
      gradient: "from-green-500 to-blue-600"
    },
    {
      icon: Settings,
      title: "Personalized Settings",
      description: "Your preferences, app settings, and customizations will be reset",
      gradient: "from-orange-500 to-red-600"
    },
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
              <UserX className="w-4 h-4 mr-2" />
              Account Deletion
            </Badge>
            <h1 className="mb-6 text-auto-5xl font-bold tracking-tight font-display text-[#00984E] text-shimmer">
              Delete Your Account
            </h1>
            <p className="text-auto-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
              We're sorry to see you go. This secure process will permanently remove your account 
              and all associated data from our systems. Please review the information below carefully.
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

      {/* Why Users Delete Section */}
      <section className="section-padding">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <Badge variant="outline" className="mb-6 text-auto-sm">
                <UserX className="w-4 h-4 mr-2" />
                Account Closure
              </Badge>
              <h2 className="text-auto-3xl font-bold font-display text-[#00984E] mb-6">
                We Understand Why You're Leaving
              </h2>
              <p className="text-auto-base text-muted-foreground leading-relaxed mb-6">
                Account deletion is a significant decision, and we respect your choice. Whether it's privacy
                concerns, changing needs, or simply moving to alternatives, we want to make this process
                transparent and secure.
              </p>
              <p className="text-auto-base text-muted-foreground leading-relaxed mb-8">
                Your data security is our priority. We follow strict protocols to ensure complete data
                removal while giving you a recovery window for any last-minute changes.
              </p>

              <div className="space-y-4">
                {[
                  "Complete data removal within 24-48 hours",
                  "30-day recovery window for peace of mind",
                  "Secure verification process to prevent unauthorized deletion",
                  "Export option available before deletion"
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#00984E] flex-shrink-0 mt-0.5" />
                    <span className="text-auto-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#036A38]/20 to-[#00984E]/20 p-8 glass">
                  <div className="w-full h-full bg-gradient-to-br from-[#036A38] to-[#00984E] rounded-xl flex items-center justify-center text-white">
                    <div className="text-center">
                      <Shield className="h-24 w-24 mx-auto mb-4" />
                      <h3 className="text-auto-xl font-bold mb-2">Secure Process</h3>
                      <p className="text-auto-sm opacity-90">Military-grade security</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <AlertTriangle className="h-8 w-8" />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Data Loss Information */}
      <section className="section-padding">
        <div className="container">
          <AnimatedSection className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-auto-3xl font-bold font-display text-[#00984E] mb-4">
                What You'll Lose
              </h2>
              <p className="text-auto-lg text-muted-foreground max-w-2xl mx-auto">
                These data types will be permanently deleted and cannot be recovered
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {dataLoss.map((item, index) => (
                <AnimatedSection key={index} delay={0.1 * index}>
                  <Card className="border-0 shadow-xl h-full hover:shadow-2xl transition-all duration-300 overflow-hidden group  text-white panel-metrics">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#036A38] to-[#00984E] rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
                          <item.icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-auto-xl text-white mb-3">
                            {item.title}
                          </h3>
                          <p className="text-auto-base  leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                        <X className="h-6 w-6 text-[#00984E] flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Progress Tracker */}
      <section className="section-padding bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <AnimatedSection className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-auto-3xl font-bold font-display text-[#00984E] mb-4">
                Deletion Progress
              </h2>
              <p className="text-auto-lg text-muted-foreground max-w-2xl mx-auto">
                Current step in the secure deletion process
              </p>
            </div>

            <div className="flex items-center justify-center space-x-4 mb-12">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step <= currentStep
                      ? 'bg-[#00984E]  text-white shadow-lg'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {step < currentStep ? <Check className="w-6 h-6" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-20 h-1 mx-4 rounded-full transition-all ${
                      step < currentStep ? 'bg-[#00984E] ' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className={`p-6 rounded-xl border transition-all ${currentStep >= 1 ? 'border-[#00984E] bg-[#036A38]/5' : 'border-border'}`}>
                <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-[#00984E]" />
                <h3 className="font-semibold text-auto-base mb-2">Review Data Loss</h3>
                <p className="text-auto-sm text-muted-foreground">Understand what will be permanently deleted</p>
              </div>
              <div className={`p-6 rounded-xl border transition-all ${currentStep >= 2 ? 'border-[#00984E] bg-[#036A38]/5' : 'border-border'}`}>
                <Shield className="h-8 w-8 mx-auto mb-4 text-[#00984E]" />
                <h3 className="font-semibold text-auto-base mb-2">Verify Identity</h3>
                <p className="text-auto-sm text-muted-foreground">Confirm your identity with SMS verification</p>
              </div>
              <div className={`p-6 rounded-xl border transition-all ${currentStep >= 3 ? 'border-[#00984E] bg-[#036A38]/5' : 'border-border'}`}>
                <CheckCircle className="h-8 w-8 mx-auto mb-4 text-[#00984E]" />
                <h3 className="font-semibold text-auto-base mb-2">Confirmation</h3>
                <p className="text-auto-sm text-muted-foreground">Deletion request submitted successfully</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Interactive Deletion Process */}
      <section >
        <div className="container">
          <div className="max-w-2xl mx-auto">

            {/* Step 1: What You'll Lose */}
            {currentStep === 1 && (
              <AnimatedSection>
                <Card className="border-0 shadow-xl glass-strong mb-8">
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.3 }}
                        className="w-20 h-20 bg-gradient-to-br from-destructive to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                      >
                        <AlertTriangle className="h-10 w-10 text-white" />
                      </motion.div>
                      <h2 className="text-auto-2xl font-bold font-display text-[#00984E] mb-3">
                        Confirm Account Deletion
                      </h2>
                      <p className="text-auto-base text-muted-foreground">
                        Enter your phone number to begin the secure deletion process
                      </p>
                    </div>

                    <Alert className="border-[#FFB81C]/40 bg-[#FFB81C]/10 mb-8 rounded-lg border p-4">
                      <AlertTriangle className="h-5 w-5 text-[#FFB81C] dark:text-[#FFB81C]" />
                      <AlertDescription className="text-auto-sm text-[#FFB81C]">
                        <strong>Warning:</strong> This action is permanent and cannot be undone. All your data will be permanently deleted from our servers.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="phone" className="text-auto-sm font-medium">
                          Phone Number *
                        </Label>
                        <div className="relative mt-2">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+234 801 234 5678"
                            className="pl-10 h-12 border-border/60 hover:border-destructive/40 focus:border-destructive transition-colors"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                        </div>
                        <p className="text-auto-xs text-muted-foreground mt-2">
                          We'll send a verification code to this number for security
                        </p>
                      </div>

                      <label className="flex items-start space-x-3 text-auto-sm cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-border mt-1" 
                          checked={agreement}
                          onChange={(e) => setAgreement(e.target.checked)}
                        />
                        <span className="text-muted-foreground leading-relaxed">
                          I understand that deleting my account is permanent and I will lose all my data including saved locations, navigation history, and personalized settings. This action cannot be undone.
                        </span>
                      </label>

                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button
                          onClick={handlePhoneSubmit}
                          disabled={!phoneNumber || !agreement}
                          className="w-full bg-gradient-to-r from-[#036A38] to-[#00984E] text-white hover:opacity-90 py-3 h-12 text-auto-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          Send Verification Code
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {/* Step 2: OTP Verification */}
            {currentStep === 2 && (
              <AnimatedSection>
                <Card className="border-0 shadow-xl glass-strong mb-8">
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.3 }}
                        className="w-20 h-20 bg-[#00984E]  rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                      >
                        <Shield className="h-10 w-10 text-white" />
                      </motion.div>
                      <h2 className="text-auto-2xl font-bold font-display text-[#00984E] mb-3">
                        Verify Your Identity
                      </h2>
                      <p className="text-auto-base text-muted-foreground">
                        We've sent a 6-digit code to {phoneNumber}
                      </p>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <Label className="text-auto-sm font-medium">Enter Verification Code</Label>
                        <div className="flex gap-3 mt-4 justify-center">
                          {otp.map((digit, index) => (
                            <Input
                              key={index}
                              id={`otp-${index}`}
                              type="text"
                              maxLength={1}
                              className="w-14 h-14 text-center text-auto-xl font-bold border-border/60 hover:border-brand/40 focus:border-brand transition-colors"
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Backspace" && !digit && index > 0) {
                                  const prevInput = document.getElementById(`otp-${index - 1}`);
                                  prevInput?.focus();
                                }
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-auto-sm text-muted-foreground mb-4">
                          Didn't receive the code?
                        </p>
                        <button className="text-auto-sm text-[#00984E] hover:text-[#00984E]/80 transition-colors font-medium">
                          Resend Code (0:30)
                        </button>
                      </div>

                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button
                          onClick={handleOtpSubmit}
                          disabled={otp.some(digit => !digit) || isSubmitting}
                          className="w-full bg-gradient-to-r from-[#036A38] to-[#00984E] text-white hover:opacity-90 py-3 h-12 text-auto-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {isSubmitting ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                          ) : (
                            <Trash2 className="w-5 h-5 mr-2" />
                          )}
                          {isSubmitting ? "Processing..." : "Delete My Account"}
                        </Button>
                      </motion.div>

                      <button
                        onClick={() => setCurrentStep(1)}
                        className="w-full text-auto-sm text-muted-foreground hover:text-[#00984E] transition-colors flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to previous step
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <AnimatedSection>
                <Card className="border-0 shadow-xl glass-strong mb-8">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.3 }}
                      className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
                    >
                      <CheckCircle className="h-12 w-12 text-white" />
                    </motion.div>
                    
                    <h2 className="text-auto-2xl font-bold font-display text-[#00984E] mb-6">
                      Deletion Request Received
                    </h2>
                    
                    <p className="text-auto-lg text-muted-foreground mb-8 leading-relaxed">
                      Your account deletion request has been submitted successfully. Your account will be permanently deleted within 30 days.
                    </p>

                    <div className="bg-[#036A38]/5 border border-[#00984E]/30 dark:border-[#00984E]/40 rounded-xl p-6 mb-8">
                      <p className="text-auto-sm text-[#00984E] dark:text-[#00984E] leading-relaxed">
                        <strong>Recovery Window:</strong> You can still recover your account by contacting our support team within the next 30 days. After this period, your data will be permanently deleted and cannot be recovered.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => window.location.href = '/contact'}
                          variant="outline"
                          className="flex-1 text-auto-sm border-brand text-[#00984E] hover:bg-brand hover:text-white transition-all"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Contact Support
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => window.location.href = '/'}
                          className="flex-1 bg-[#00984E]  text-white text-auto-sm shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2 rotate-180" />
                          Return to Home
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding">
        <div className="container">
          <AnimatedSection>
            <Card className="border-0 shadow-2xl panel-metrics text-white overflow-hidden rounded-2xl">
              <CardContent className="p-16 text-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.06),transparent)]" />
                <div className="relative z-10 max-w-3xl mx-auto">
                  <div className="w-20 h-20 bg-[rgba(255,255,255,0.08)] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg backdrop-blur-sm">
                    <Heart className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-auto-4xl font-bold font-display mb-6">
                    We're Sorry to See You Go
                  </h3>
                  <p className="text-auto-xl opacity-90 mb-10 leading-relaxed">
                    If there's anything we can do to improve your experience, please let us know. We'd love to win you back.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="inline-flex items-center justify-center gap-3  bg-white text-green-800 dark:bg-[#036A38] dark:text-white px-10 py-4 h-14 text-lg font-semibold rounded-xl shadow-[0_4px_15px_rgba(3,106,56,0.3)] hover:shadow-[0_8px_25px_rgba(3,106,56,0.35)] transition-all" onClick={() => window.location.href = '/contact'}>
                        Share Feedback
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
                      <a
                        href="/"
                        className="inline-flex items-center gap-3 btn-ios-outline h-14 btn-ios-outline px-10 rounded-xl font-semibold transition-all btn-ios-outline bg-[#1E7A50] text-white border border-[#1E7A50] py-4 shadow-2xl font-display text-auto-xl cursor-pointer  justify-center hover:brightness-110 dark:bg-transparent dark:border-0"
                      >
                        Explore Features
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
