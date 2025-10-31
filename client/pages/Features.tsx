import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  MapPin, 
  Wifi, 
  Users, 
  Volume2, 
  Landmark, 
  Truck, 
  Code,
  Shield,
  Clock,
  Navigation,
  Smartphone,
  Eye,
  CheckCircle,
  ArrowRight,
  Download,
  Star,
  Target,
  Rocket
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

export default function Features() {
  const stats = [
    { number: "50+", label: "Advanced Features", icon: Zap },
    { number: "36", label: "States Covered", icon: MapPin },
    { number: "99.9%", label: "Accuracy Rate", icon: Target },
    { number: "24/7", label: "Offline Access", icon: Wifi }
  ];

  const coreFeatures = [
    {
      icon: Zap,
      title: "AI-Powered Navigation",
      description: "Advanced machine learning algorithms optimized for Nigerian roads, landmarks, and traffic patterns.",
      features: [
        "Smart route optimization",
        "Predictive traffic analysis",
        "Local pattern recognition",
        "Dynamic re-routing"
      ],
      gradient: "from-[#036A38] to-[#00984E]"
    },
    {
      icon: Wifi,
      title: "Offline Map Access",
      description: "Download detailed maps for any Nigerian state and navigate without internet connection.",
      features: [
        "Complete offline functionality",
        "State-by-state downloads",
        "Automatic map updates",
        "Zero data usage navigation"
      ],
      gradient: "from-[#036A38] to-[#00984E]"
    },
    {
      icon: Navigation,
      title: "Real-time Traffic Intelligence",
      description: "Live traffic data from millions of Nigerian drivers for the most accurate route planning.",
      features: [
        "Live traffic conditions",
        "Accident reports",
        "Road closure alerts",
        "Best time to travel"
      ],
      gradient: "from-[#036A38] to-[#00984E]"
    },
    {
      icon: Users,
      title: "Community Reports",
      description: "Crowd-sourced information from Nigerian drivers about road conditions and incidents.",
      features: [
        "Real-time incident reports",
        "Police checkpoint alerts",
        "Road condition updates",
        "Community verification"
      ],
      gradient: "from-[#036A38] to-[#00984E]"
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Built for Nigeria",
      description: "Designed specifically for Nigerian roads, culture, and navigation patterns"
    },
    {
      icon: Clock,
      title: "Always Reliable",
      description: "Works offline and online with 99.9% uptime across all Nigerian networks"
    },
    {
      icon: Eye,
      title: "Privacy First",
      description: "Your location data stays private while contributing to community intelligence"
    },
    {
      icon: Smartphone,
      title: "Universal Access",
      description: "Works on any smartphone, from high-end devices to basic Android phones"
    }
  ];

  const advancedFeatures = [
    {
      title: "Voice Guidance",
      description: "Clear, locally-adapted voice instructions in English and Nigerian Pidgin",
      icon: Volume2,
      gradient: "from-[#036A38] to-[#00984E]"
    },
    {
      title: "Cultural Landmarks",
      description: "Navigate using familiar Nigerian landmarks and cultural reference points",
      icon: Landmark,
      gradient: "from-[#036A38] to-[#00984E]"
    },
    {
      title: "Fleet Management",
      description: "Professional tools for businesses managing vehicle fleets across Nigeria",
      icon: Truck,
      gradient: "from-[#036A38] to-[#00984E]"
    },
    {
      title: "API Integration",
      description: "Powerful APIs for developers to integrate Nigerian mapping into their applications",
      icon: Code,
      gradient: "from-[#036A38] to-[#00984E]"
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
              <Zap className="w-4 h-4 mr-2" />
              Product Features
            </Badge>
            <h1 className="mb-6 text-auto-5xl font-bold tracking-tight font-display text-shimmer">
              Navigation Technology Built for Nigeria
            </h1>
            <p className="text-auto-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
              Discover the powerful features that make NINja Map the most trusted navigation platform in Nigeria. 
              Every feature is designed with Nigerian roads, culture, and driving patterns in mind.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 ">
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

      {/* Core Features */}
      <section className="section-padding">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-auto-3xl font-bold font-display text-[#00984E] mb-4">
              Core Features
            </h2>
            <p className="text-auto-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced navigation technology designed specifically for Nigerian roads and culture
            </p>
          </AnimatedSection>

          <div className="grid lg:grid-cols-2 gap-12">
            {coreFeatures.map((feature, index) => (
              <AnimatedSection key={index} delay={0.2 * index}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="h-full"
                >
                  <Card className="group border-0 shadow-2xl h-full glass-strong overflow-hidden hover-glow">
                    <CardContent className="p-0 h-full flex flex-col">
                      {/* Enhanced header section */}
                      <div className={`bg-gradient-to-br ${feature.gradient} p-10 relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/10" />

                        {/* Floating elements */}
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full blur-xl" />
                        <div className="absolute top-1/2 right-8 w-16 h-16 bg-white/5 rounded-full blur-lg" />

                        <div className="relative z-10 text-white">
                          <motion.div
                            className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center mb-8 shadow-2xl border border-white/30"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <feature.icon className="h-10 w-10 text-white" />
                          </motion.div>

                          <h3 className="text-auto-2xl font-bold font-display mb-4 leading-tight">
                            {feature.title}
                          </h3>

                          <p className="text-auto-base opacity-95 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>

                      {/* Enhanced content section */}
                      <div className="flex-1 p-8 bg-gradient-to-b from-background via-muted/10 to-background">
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-gradient-to-r from-[#036A38] to-[#00984E] rounded-lg flex items-center justify-center shadow-lg">
                              <Star className="h-4 w-4 text-white" />
                            </div>
                            <h4 className="text-auto-lg font-bold text-foreground font-display">
                              Key Capabilities
                            </h4>
                          </div>

                         <div className="space-y-4">
                            {feature.features.map((item, i) => (
                              <motion.div
                                key={i}
                                className="group/item flex items-start gap-4 p-4 rounded-xl bg-[#036A38]/5 hover:bg-muted/50 transition-all transition-ease duration-200 border border-transparent hover:border-[#00984E]/20"
                                whileHover={{ x: 4 }}
                              >
                                <div className="w-7 h-7 bg-gradient-to-r from-[#036A38] to-[#00984E] rounded-full flex items-center justify-center flex-shrink-0 shadow-md group-hover/item:scale-110 transition-transform">
                                  <CheckCircle className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <span className="text-auto-sm text-foreground font-medium leading-relaxed group-hover/item:text-[#00984E] transition-colors">
                                    {item}
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          {/* Enhanced action section */}
                          <motion.div
                                key={"key Capabilities"}
                                className="duration-200"
                                initial={{ opacity: 0, y: 100 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                whileHover={{ x: 4 }}
                              >
                          <div className="pt-6 mt-8 border-t border-border/40">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Eye className="h-4 w-4" />
                                <span className="text-auto-xs">Learn more</span>
                              </div>
                              <motion.button
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#036A38] to-[#00984E] text-white font-semibold shadow-lg hover:shadow-xl transition-all text-auto-sm "
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Explore Feature
                                <ArrowRight className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </div>
                          </motion.div>
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

      {/* Benefits Section */}
      <section className="section-padding bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-auto-3xl font-bold font-display text-[#00984E] mb-4">
              Why Choose NINja Map?
            </h2>
            <p className="text-auto-lg text-muted-foreground max-w-2xl mx-auto">
              Built by Nigerians, for Nigerians. Experience navigation that truly understands your needs
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <AnimatedSection key={index} delay={0.1 * index}>
                <Card className="border-0 shadow-xl text-center h-full glass hover-lift usecase-card">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[#00984E]/10 p-4 flex items-center justify-center">
                      <benefit.icon className="h-8 w-8 text-[#00984E]" />
                    </div>
                    <h3 className="font-bold text-auto-base mb-3 font-display">
                      {benefit.title}
                    </h3>
                    <p className="text-auto-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="section-padding">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <Badge variant="outline" className="mb-6 text-auto-sm border-[#00984E] bg-[rgba(3,106,56,0.1)] text-[#00984E]">
                <Rocket className="w-4 h-4 mr-2" />
                Advanced Features
              </Badge>
              <h2 className="text-auto-3xl font-bold font-display text-[#00984E] mb-6">
                Everything You Need for Nigerian Navigation
              </h2>
              <p className="text-auto-base text-muted-foreground leading-relaxed mb-6">
                From voice guidance in Nigerian Pidgin to cultural landmark recognition, 
                NINja Map understands the unique aspects of Nigerian navigation that other apps miss.
              </p>
              <p className="text-auto-base text-muted-foreground leading-relaxed mb-8">
                Whether you're a business managing a fleet across multiple states or an individual 
                navigating daily commutes, our advanced features adapt to your specific needs.
              </p>
              
              <div className="space-y-4">
                {[
                  "Landmark-based directions using familiar Nigerian references",
                  "Voice guidance in English and Nigerian Pidgin",
                  "Real-time community updates and safety reports",
                  "Enterprise-grade fleet management tools"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 ">
                    <CheckCircle className="h-5 w-5 text-[#00984E] flex-shrink-0" />
                    <span className="text-auto-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="grid md:grid-cols-2 gap-6">
                {advancedFeatures.map((feature, index) => (
                  <Card key={index} className="border-0 shadow-lg glass hover-lift usecase-card">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#036A38] to-[#00984E] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-auto-sm mb-2 font-display">
                        {feature.title}
                      </h3>
                      <p className="text-auto-xs text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container">
          <AnimatedSection>
            <Card className="border-0 shadow-2xl  text-white overflow-hidden panel-metrics">
              <CardContent className="p-12 text-center relative ">
                <div className="absolute inset-0 bg-pattern opacity-20" />
                <div className="relative z-10">
                  <h2 className="text-auto-3xl font-bold font-display mb-4">
                    Ready to Experience Nigerian Navigation?
                  </h2>
                  <p className="text-auto-lg opacity-90 max-w-2xl mx-auto mb-8">
                    Join millions of Nigerians who trust NINja Map for their daily navigation needs. 
                    Download now and discover the difference.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <a
                        href="/download"
                        className="bg-white text-[#036A38] dark:bg-[#036A38] dark:text-[white] flex items-center text-auto-lg cursor-pointer rounded-xl px-8 py-4 font-medium transition-all duration-200 ease-out shadow-[0_4px_15px_rgba(3,106,56,0.3)] hover:shadow-[0_8px_25px_rgba(3,106,56,0.35)] hover:-translate-y-0.5"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download for Android
                      </a>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
                      <a
                        href="/download"
                        className="flex items-center btn-ios-outline text-auto-lg cursor-pointer btn-ios-outline bg-[#1E7A50] text-white border border-[#1E7A50] rounded-xl px-8 py-4 shadow-2xl font-display text-auto-xl font-medium  justify-center hover:brightness-110 dark:bg-transparent dark:border-0"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download for iOS
                      </a>
                    </motion.div>
                  </div>
                  <div className="mt-6">
                    <Link
                      to="/testimonials"
                      className="inline-flex items-center gap-2 text-auto-sm text-white/90 hover:text-white transition-colors font-medium"
                    >
                      Read what our users say
                      <ArrowRight className="w-4 h-4" />
                    </Link>
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
