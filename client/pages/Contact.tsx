import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent } from "@/components/ui/card";
import { UnifiedInput, UnifiedTextarea } from "@/components/ui/unified-input";
import CustomSelect from "@/components/ui/custom-select";
import {
  Mail,
  Send,
  MapPin,
  Phone,
  Clock,
  MessageSquare,
  HeadphonesIcon,
  Users,
  Building,
  Globe,
  CheckCircle,
  ExternalLink,
  Star,
  HelpCircle,
  Settings,
  Briefcase,
  Shield,
  MessageCircle
} from "lucide-react";
import { useSmartToast } from "@/hooks/use-smart-toast";
import { useFormValidation } from "@/components/ui/unified-input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "general"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useSmartToast();
  const validation = useFormValidation();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const formErrors = validation.validateForm(formData, {
      name: (value) => validation.validateName(value, "Full name"),
      email: validation.validateEmail,
      subject: validation.validateSubject,
      message: validation.validateMessage,
      type: (value) => validation.validateSelect(value, "inquiry type")
    });

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Don't show toast for validation errors since they're displayed in form
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success("Message sent successfully!", "We'll get back to you within 24 hours.");

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        type: "general"
      });
      setErrors({});
    } catch (error) {
      toast.serverError("Failed to send message", "Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    { number: "24/7", label: "Support Available", icon: HeadphonesIcon },
    { number: "<12h", label: "Average Response", icon: Clock },
    { number: "99%", label: "Satisfaction Rate", icon: Star },
    { number: "50K+", label: "Issues Resolved", icon: CheckCircle }
  ];

  const contactMethods = [
    {
      title: "General Support",
      description: "Questions about features, billing, or general inquiries",
      icon: HeadphonesIcon,
      email: "support@ninjamap.ng",
      response: "Within 24 hours",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      title: "Technical Support",
      description: "App issues, bugs, or technical difficulties",
      icon: MessageSquare,
      email: "tech@ninjamap.ng",
      response: "Within 12 hours",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      title: "Business Partnerships",
      description: "Enterprise solutions and partnership opportunities",
      icon: Building,
      email: "partnerships@ninjamap.ng",
      response: "Within 48 hours",
      gradient: "from-green-500 to-blue-600"
    },
    {
      title: "Privacy & Data",
      description: "Data deletion, privacy concerns, and GDPR requests",
      icon: Users,
      email: "privacy@ninjamap.ng",
      response: "Within 24 hours",
      gradient: "from-orange-500 to-red-600"
    }
  ];

  const officeInfo = {
    address: "The Grandview Centre, 46 Emmanuel Keshi Street, Magodo Phase 2, Lagos",
    phone: "+234 801 234 5678",
    email: "hello@ninjamap.ng",
    hours: "Monday - Friday: 9:00 AM - 6:00 PM WAT"
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
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Us
            </Badge>
            <h1 className="mb-6 text-auto-5xl font-bold tracking-tight font-display text-shimmer">
              Get in Touch with Our Team
            </h1>
            <p className="text-auto-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
              Have questions, feedback, or need support? We're here to help you navigate 
              any challenges and make the most of your NINja Map experience.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {stats.map((stat, index) => (
                <AnimatedSection key={index} delay={0.1 * index}>
                  <motion.div
                    className="text-center p-6 rounded-2xl metrics-stat hover-lift"
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

      {/* Contact Methods Section */}
      <section className="section-padding">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-auto-3xl font-bold font-display text-[#00984E] mb-4">
              Choose How to Reach Us
            </h2>
            <p className="text-auto-lg text-muted-foreground max-w-2xl mx-auto">
              Select the best contact method for your specific needs
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => (
              <AnimatedSection key={index} delay={0.1 * index}>
                <Card className="border-0 shadow-xl text-[#00984E] hover:shadow-2xl transition-all duration-300 h-full overflow-hidden group dark:text-white text-center p-6 rounded-2xl metrics-stat hover-lift">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border-thin-green ring-1 ring-white/20">
                      <method.icon className="h-8 w-8 text-[#00984E]" />
                    </div>
                    <h3 className="text-auto-lg font-bold font-display mb-4">
                      {method.title}
                    </h3>
                    <p className="text-auto-sm text-muted-foreground leading-relaxed mb-4">
                      {method.description}
                    </p>
                    <div className="space-y-2">
                      <a 
                        href={`mailto:${method.email}`}
                        className="block text-auto-sm text-white hover:underline font-medium"
                      >
                        {method.email}
                      </a>
                      <p className="text-auto-xs text-muted-foreground">
                        Response: {method.response}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Office Info */}
      <section className="section-padding bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Contact Form */}
            <AnimatedSection>
              <h2 className="text-auto-3xl font-bold font-display text-[#00984E] mb-6">
                Send us a Message
              </h2>
              <p className="text-auto-base text-muted-foreground leading-relaxed mb-8">
                Fill out the form below and we'll get back to you as soon as possible. 
                Our support team is committed to providing you with the best assistance.
              </p>

              <Card className="border-0 shadow-2xl glass">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <UnifiedInput
                        label="Full Name"
                        value={formData.name}
                        onChange={(value) => handleInputChange("name", value)}
                        icon={Users}
                        placeholder="Your full name"
                        required
                        disabled={isSubmitting}
                        error={errors.name}
                      />
                      <UnifiedInput
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(value) => handleInputChange("email", value)}
                        icon={Mail}
                        placeholder="your.email@example.com"
                        required
                        disabled={isSubmitting}
                        error={errors.email}
                      />
                    </div>

                    <CustomSelect
                      label="Inquiry Type"
                      value={formData.type}
                      onChange={(value) => handleInputChange("type", value)}
                      placeholder="Select inquiry type"
                      disabled={isSubmitting}
                      required
                      error={errors.type}
                      options={[
                        {
                          value: "general",
                          label: "General Support",
                          icon: HelpCircle,
                          description: "Questions about features, billing, or general inquiries"
                        },
                        {
                          value: "technical",
                          label: "Technical Support",
                          icon: Settings,
                          description: "App issues, bugs, or technical difficulties"
                        },
                        {
                          value: "business",
                          label: "Business Partnership",
                          icon: Briefcase,
                          description: "Enterprise solutions and partnership opportunities"
                        },
                        {
                          value: "privacy",
                          label: "Privacy & Data",
                          icon: Shield,
                          description: "Data deletion, privacy concerns, and GDPR requests"
                        },
                        {
                          value: "feedback",
                          label: "Feedback",
                          icon: MessageCircle,
                          description: "Share your thoughts and suggestions with us"
                        }
                      ]}
                    />

                    <UnifiedInput
                      label="Subject"
                      value={formData.subject}
                      onChange={(value) => handleInputChange("subject", value)}
                      placeholder="Brief description of your inquiry"
                      required
                      disabled={isSubmitting}
                      error={errors.subject}
                    />

                    <UnifiedTextarea
                      label="Message"
                      value={formData.message}
                      onChange={(value) => handleInputChange("message", value)}
                      placeholder="Please provide details about your inquiry..."
                      rows={5}
                      required
                      disabled={isSubmitting}
                      error={errors.message}
                    />

                    <ActionButton
                      type="submit"
                      loading={isSubmitting}
                      icon={Send}
                      fullWidth
                      style={{
                        background: "linear-gradient(280.64deg, rgba(255, 184, 28, 0.2) 0.53%, rgba(3, 106, 56, 0.2) 99.04%)",
                      }}
                    >
                      Send Message
                    </ActionButton>
                  </form>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Office Info */}
            <AnimatedSection delay={0.2}>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#036A38]/20 to-[#00984E]/20 p-8 glass">
                  <div className="p-8 w-full h-full bg-gradient-to-br from-[#036A38] to-[#00984E] rounded-xl flex items-center justify-center text-white">
                    <div className="text-center">
                      <Building className="h-24 w-24 mx-auto mb-6" />
                      <h3 className="text-auto-xl font-bold mb-4">Visit Our Office</h3>
                      <div className="space-y-4 text-auto-sm">
                        <div className="flex items-start gap-3 text-start">
                          <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <p>{officeInfo.address}</p>
                        </div>
                        <div className="flex items-center gap-3 text-start">
                          <Phone className="h-5 w-5 flex-shrink-0" />
                          <a href={`tel:${officeInfo.phone}`} className="hover:underline">
                            {officeInfo.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-3 text-start">
                          <Mail className="h-5 w-5 flex-shrink-0" />
                          <a href={`mailto:${officeInfo.email}`} className="hover:underline">
                            {officeInfo.email}
                          </a>
                        </div>
                        <div className="flex items-start gap-3 text-start">
                          <Clock className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <p>{officeInfo.hours}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <MessageSquare className="h-8 w-8" />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Alternative Contact Methods */}
      <section className="section-bottom-padding">
        <div className="container">
          <AnimatedSection>
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-[#036A38] to-[#0B1E16] text-white overflow-hidden rounded-2xl panel-metrics">
              <CardContent className="p-12 text-center relative">
                <div className="absolute inset-0 bg-pattern opacity-20" />
                <div className="relative z-10">
                  <h2 className="text-auto-3xl font-bold font-display mb-4">
                    Need Immediate Help?
                  </h2>
                  <p className="text-auto-lg opacity-90 max-w-2xl mx-auto mb-8">
                    For urgent technical issues or immediate assistance, try these alternative contact methods.
                  </p>
                  <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <motion.div 
                      className="bg-[#00984E] rounded-xl p-6 backdrop-blur-sm"
                      whileHover={{ scale: 1.05 }}
                    >
                      <MessageSquare className="h-8 w-8 mx-auto mb-3" />
                      <h3 className="font-bold text-auto-base mb-2">Live Chat</h3>
                      <p className="text-auto-sm opacity-90">Available 9 AM - 9 PM WAT</p>
                    </motion.div>
                    <motion.div 
                      className="bg-[#00984E] rounded-xl p-6 backdrop-blur-sm"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Phone className="h-8 w-8 mx-auto mb-3" />
                      <h3 className="font-bold text-auto-base mb-2">Phone Support</h3>
                      <p className="text-auto-sm opacity-90">+234 801 234 5678</p>
                    </motion.div>
                    <motion.div 
                      className="bg-[#00984E] rounded-xl p-6 backdrop-blur-sm"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Globe className="h-8 w-8 mx-auto mb-3" />
                      <h3 className="font-bold text-auto-base mb-2">Help Center</h3>
                      <p className="text-auto-sm opacity-90">24/7 Self-Service</p>
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
