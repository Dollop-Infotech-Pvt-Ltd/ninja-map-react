import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Heart, 
  Users, 
  Target, 
  MapPin, 
  Calendar,
  Award,
  Globe,
  Zap,
  Shield,
  Smartphone,
  TrendingUp,
  CheckCircle,
  Star,
  Building,
  Lightbulb,
  Rocket
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AnimatedSection: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function About() {
  const stats = [
    { number: "2.5M+", label: "Active Users", icon: Users },
    { number: "15+", label: "Nigerian States", icon: Globe },
    { number: "500K+", label: "Places Mapped", icon: MapPin },
    { number: "99.9%", label: "Uptime", icon: Shield }
  ];

  const timeline = [
    {
      year: "2020",
      title: "The Vision",
      description: "Founded with a mission to solve Nigeria's unique navigation challenges using AI and local insights",
      icon: Lightbulb,
      color: "from-blue-500 to-purple-600"
    },
    {
      year: "2021",
      title: "First Launch",
      description: "Beta release in Lagos with detailed local mapping, offline capabilities, and community reporting",
      icon: Rocket,
      color: "from-purple-500 to-pink-600"
    },
    {
      year: "2022",
      title: "Nationwide Expansion",
      description: "Extended coverage to 15 Nigerian states with real-time traffic intelligence and cultural landmarks",
      icon: Globe,
      color: "from-pink-500 to-red-600"
    },
    {
      year: "2023",
      title: "AI Integration",
      description: "Launched AI-powered route optimization and predictive traffic analysis for Nigerian road conditions",
      icon: Zap,
      color: "from-orange-500 to-yellow-600"
    },
    {
      year: "2024",
      title: "Recognition & Growth",
      description: "Winner of Nigeria Tech Innovation Award and trusted by over 2.5 million Nigerian drivers",
      icon: Award,
      color: "from-green-500 to-blue-600"
    }
  ];

  const values = [
    {
      title: "Local First",
      description: "Built by Nigerians, for Nigerians, with deep understanding of local culture and geography",
      icon: Heart,
      gradient: "from-red-500 to-pink-600"
    },
    {
      title: "Innovation",
      description: "Pioneering AI-powered navigation technology specifically designed for African road networks",
      icon: Zap,
      gradient: "from-blue-500 to-purple-600"
    },
    {
      title: "Community",
      description: "Empowering users to contribute real-time updates and share local knowledge for everyone's benefit",
      icon: Users,
      gradient: "from-green-500 to-blue-600"
    },
    {
      title: "Reliability",
      description: "Ensuring 99.9% uptime and accurate navigation even in challenging network conditions",
      icon: Shield,
      gradient: "from-purple-500 to-indigo-600"
    }
  ];

  const team = [
    {
      name: "Adebayo Johnson",
      role: "Founder & CEO",
      bio: "Former Google Maps engineer with 10+ years in navigation technology",
      achievement: "Led development of offline mapping algorithms"
    },
    {
      name: "Chinelo Okafor",
      role: "CTO",
      bio: "AI specialist focused on traffic prediction and route optimization",
      achievement: "Published 15+ papers on African urban mobility"
    },
    {
      name: "Ibrahim Musa",
      role: "Head of Community",
      bio: "Community engagement expert with deep knowledge of Nigerian regions",
      achievement: "Built network of 50K+ community contributors"
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
              className="mb-6 border-[0.6px] text-[#00984E]  border-[#00984E] border-brand/40 bg-brand-50 dark:bg-brand-950  dark:text-white   px-6 py-3 text-auto-sm font-medium"
            >
              <Building className="w-4 h-4 mr-2 text-[#00984E] text-brand  dark:text-white"  />
              About NINja Map
            </Badge>
            <h1 className="mb-6 text-auto-5xl font-bold tracking-tight font-display text-shimmer">
              Revolutionizing Navigation for Nigeria
            </h1>
            <p className="text-auto-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
              We're building the future of navigation technology, designed specifically for Nigerian roads, 
              culture, and communities. Our AI-powered platform understands the unique challenges of 
              navigating in Nigeria and provides solutions that actually work.
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
                    <stat.icon className="h-6 w-6 text-[#00984E] " />
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

      {/* Mission Section */}
      <section className="section-padding">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <Badge variant="outline" className="mb-6 text-auto-sm">
                <Target className="w-4 h-4 mr-2" />
                Our Mission
              </Badge>
              <h2 className="text-auto-3xl font-bold font-display text-[#00984E] mb-6">
                Making Navigation Simple, Accurate, and Truly Nigerian
              </h2>
              <p className="text-auto-base text-muted-foreground leading-relaxed mb-6">
                Nigeria's roads tell unique stories. From Lagos's bustling expressways to Abuja's planned districts, 
                from Port Harcourt's industrial zones to Kano's historic quarters - each route has its own character, 
                challenges, and opportunities.
              </p>
              <p className="text-auto-base text-muted-foreground leading-relaxed mb-8">
                We don't just adapt foreign mapping technology for Nigeria; we build from the ground up with 
                Nigerian drivers, businesses, and communities at the center of everything we do.
              </p>
              
              <div className="space-y-4">
                {[
                  "AI-powered route optimization for Nigerian road conditions",
                  "Offline navigation for areas with limited connectivity",
                  "Real-time community updates and safety reports",
                  "Cultural landmarks and local business integration"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-[#00984E] flex-shrink-0" />
                    <span className="text-auto-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-brand/20 to-gradient-to/20 p-8 glass">
                  <div className="w-full h-full bg-gradient-to-br from-[#036A38] to-[#00984E] rounded-xl flex items-center justify-center text-white">
                    <MapPin className="h-24 w-24" />
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <Star className="h-8 w-8 fill-current" />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-auto-3xl font-bold font-display text-[#00984E] mb-4">
              Our Core Values
            </h2>
            <p className="text-auto-lg text-muted-foreground max-w-2xl mx-auto">
              These principles guide every decision we make and every line of code we write
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {values.map((value, index) => (
              <AnimatedSection key={index} delay={0.1 * index}>
                <motion.div
                  className="h-full p-8 text-center rounded-2xl usecase-card values-card hover-lift flex flex-col"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border-thin-green shadow-lg">
                    <value.icon className="h-8 w-8 text-[#00984E] " />
                  </div>
                  <h3 className="text-auto-lg font-bold font-display mb-4 text-foreground dark:text-white">
                    {value.title}
                  </h3>
                  <p className="text-auto-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="section-padding">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-auto-3xl font-bold font-display text-[#00984E] mb-4">
              Our Journey
            </h2>
            <p className="text-auto-lg text-muted-foreground max-w-2xl mx-auto">
              From a vision to Nigeria's leading navigation platform
            </p>
          </AnimatedSection>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-2">
              {timeline.map((item, index) => (
                <AnimatedSection key={index} delay={0.1 * index}>
                  <div className="relative flex items-start gap-8">
                    {/* Timeline line */}
                    {index < timeline.length - 1 && (
                      <div className="absolute left-8 top-16 w-[2px] h-10 bg-gradient-to-b from-[#00984E] to-[#FFB81C]" />
                    )}
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 border-thin-green rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0 relative z-10`}>
                      <item.icon className="h-8 w-8 text-[#00984E] " />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-4 mb-3">
                        <Badge variant="outline" className="text-auto-sm font-bold">
                          {item.year}
                        </Badge>
                    <h3 className="text-auto-xl font-bold font-display text-dark dark:text-white">
  {item.title}
</h3>

                      </div>
                      <p className="text-auto-base text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

     {/* Team Section */}
      <section className="section-padding bg-gradient-to-br from-muted/20 to-background">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-6 border-brand/30 bg-brand/10 text-brand px-4 py-2"
            >
              <Users className="w-4 h-4 mr-2" />
              Our Team
            </Badge>
            <h2 className="text-auto-4xl font-bold font-display text-[#00984E] mb-6">
              Meet the Visionaries Behind NINja Map
            </h2>
            <p className="text-auto-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our diverse team of Nigerian innovators, engineers, and visionaries are united by one mission:
              revolutionizing navigation for every Nigerian.
            </p>
          </AnimatedSection>

          <div className="space-y-20">
            {[
              {
                name: "Dr. Adebayo Ogundimu",
                role: "CEO & Co-Founder",
                company: "Former Google Maps Nigeria",
                image: "https://images.pexels.com/photos/6077859/pexels-photo-6077859.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop",
                description: "With over 15 years of experience in mapping technology and AI, Dr. Ogundimu leads our vision to make navigation truly Nigerian. He previously led Google Maps initiatives in West Africa and holds a PhD in Computer Science from the University of Lagos.",
                achievements: ["15+ years in mapping technology", "Former Google Maps West Africa Lead", "PhD Computer Science, University of Lagos", "50+ patents in navigation AI"],
                gradient: "from-[#036A38] to-[#00984E]"
              },
              {
                name: "Kemi Adeleke",
                role: "CTO & Co-Founder",
                company: "Former Microsoft Azure Nigeria",
                image: "https://images.pexels.com/photos/5398929/pexels-photo-5398929.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop",
                description: "Kemi brings world-class engineering expertise from her time at Microsoft Azure, where she architected cloud solutions for emerging markets. Her passion for scalable technology drives our platform's reliability across Nigeria's diverse infrastructure.",
                achievements: ["10+ years in cloud architecture", "Former Microsoft Azure Nigeria", "BSc Computer Engineering, OAU", "Led 50+ person engineering team"],
                gradient: "from-[#FFB81C] to-[#FFD87A]"
              },
              {
                name: "Ibrahim Yusuf",
                role: "Head of Product",
                company: "Former Paystack Product Lead",
                image: "https://images.pexels.com/photos/5921968/pexels-photo-5921968.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop",
                description: "Ibrahim's deep understanding of Nigerian user behavior, developed during his time at Paystack, ensures our products truly serve Nigerian needs. He champions user-centric design that works for everyone from Lagos tech hubs to rural communities.",
                achievements: ["8+ years in product management", "Former Paystack Product Lead", "MSc Business Admin, LBS", "Built products for 10M+ users"],
                gradient: "from-[#036A38] to-[#00984E]"
              }
            ].map((member, index) => (
              <AnimatedSection key={index} delay={index * 0.2}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="border-0 shadow-2xl glass-strong overflow-hidden">
                    <div className={`grid lg:grid-cols-2 gap-0 items-center min-h-[500px] ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                      {/* Large Image Side */}
                      <div className={`relative h-full lg:h-[600px] overflow-hidden ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient}/20`} />
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover object-center"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                        {/* Floating achievement badge */}
                        <div className="absolute top-6 left-6">
                          <div className="bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full shadow-lg border border-white/20">
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-[#00984E]" />
                              <span className="text-sm font-medium">{member.company}</span>
                            </div>
                          </div>
                        </div>

                        {/* Leadership badge */}
                        <div className="absolute bottom-6 right-6">
                          <div className={`bg-gradient-to-br ${member.gradient} text-white p-3 rounded-full shadow-lg`}>
                            <Rocket className="h-6 w-6" />
                          </div>
                        </div>
                      </div>

                      {/* Content Side */}
                      <div className={`p-8 lg:p-12 flex flex-col justify-center ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                        {/* Role Badge */}
                        <div className="mb-6">
                          <Badge className={`bg-gradient-to-r ${member.gradient} text-white px-4 py-2 text-sm font-medium shadow-lg`}>
                            {member.role}
                          </Badge>
                        </div>

                        {/* Name and Title */}
                        <div className="mb-8">
                          <h3 className="text-auto-3xl lg:text-auto-4xl font-bold font-display mb-2 text-white">
                            {member.name}
                          </h3>
                          <p className="text-auto-lg text-white font-semibold">
                            {member.role}
                          </p>
                        </div>

                        {/* Description */}
                        <p className="text-auto-base text-muted-foreground leading-relaxed mb-8">
                          {member.description}
                        </p>

                        {/* Achievements */}
                        <div>
                          <h4 className="text-auto-sm font-semibold text-foreground mb-4">Key Achievements:</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {member.achievements.map((achievement, achIndex) => (
                              <div key={achIndex} className="flex items-center gap-3">
                                <CheckCircle className="h-4 w-4 text-white flex-shrink-0" />
                                <span className="text-auto-sm text-muted-foreground">{achievement}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>

          {/* Team Stats */}
          <AnimatedSection delay={0.6}>
            <div className="mt-20 text-center">
              <h3 className="text-auto-2xl font-bold font-display text-[#00984E] mb-8">
                Our Team by the Numbers
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { number: "50+", label: "Team Members", icon: Users },
                  { number: "12", label: "Nigerian States Represented", icon: Globe },
                  { number: "25+", label: "Years Combined Experience", icon: Award },
                  { number: "100%", label: "Nigerian Talent", icon: Heart }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center p-6 rounded-2xl usecase-card hover-lift"
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 border-thin-green">
                      <stat.icon className="h-6 w-6 text-[#00984E]" />
                    </div>
                    <div className="text-auto-2xl font-bold text-[#00984E] mb-2 font-display">
                      {stat.number}
                    </div>
                    <p className="text-auto-sm text-muted-foreground font-medium">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-bottom-padding">
        <div className="container">
          <AnimatedSection>
<Card
  className="border-0 shadow-2xl text-white overflow-hidden bg-[#036A38] panel-metrics">


              <CardContent className="p-12 text-center relative">
                <div className="absolute inset-0 bg-[url('/api/placeholder/800/400')] opacity-10 bg-cover bg-center" />
                <div className="relative z-10">
                  <h2 className="text-auto-3xl font-bold font-display mb-4">
                    Join the Navigation Revolution
                  </h2>
                  <p className="text-auto-lg opacity-90 max-w-2xl mx-auto mb-8">
                    Be part of Nigeria's most innovative navigation community. Download NINja Map 
                    and experience the future of local navigation.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.a
                      href="/download"
                      className="bg-white  text-green-800  flex items-center text-auto-lg cursor-pointer rounded-xl px-6 py-3 font-medium transition-all duration-200 ease-out dark:bg-[#036A38] dark:text-white shadow-[0_4px_15px_rgba(3,106,56,0.3)] hover:shadow-[0_8px_25px_rgba(3,106,56,0.35)] hover:-translate-y-0.5"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Smartphone className="mr-3 h-5 w-5 "  />
                      Download App
                    </motion.a>
                    <motion.a
                      href="/contact"
                      className="flex items-center btn-ios-outline text-auto-lg cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Users className="mr-3 h-5 w-5" />
                      Partner With Us
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
