import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  Server,
  MapPin,
  Globe,
  Smartphone,
  Mail,
  Rss,
  TrendingUp,
  Shield,
  Zap,
  Database
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

export default function Status() {
  const stats = [
    { number: "99.99%", label: "Overall Uptime", icon: TrendingUp },
    { number: "45ms", label: "Avg Response", icon: Zap },
    { number: "36", label: "States Online", icon: Globe },
    { number: "24/7", label: "Monitoring", icon: Activity }
  ];

  const services = [
    {
      name: "Navigation API",
      status: "operational",
      uptime: "99.99%",
      responseTime: "45ms",
      icon: MapPin,
      description: "Core navigation and routing services",
      gradient: "from-[#036A38] to-[#00984E]"
    },
    {
      name: "Map Tiles",
      status: "operational",
      uptime: "99.98%",
      responseTime: "120ms",
      icon: Globe,
      description: "Map rendering and tile serving",
      gradient: "from-[#036A38] to-[#00984E]"
    },
    {
      name: "Traffic Intelligence",
      status: "operational",
      uptime: "99.95%",
      responseTime: "78ms",
      icon: Activity,
      description: "Real-time traffic data processing",
      gradient: "from-[#036A38] to-[#00984E]"
    },
    {
      name: "Mobile App Backend",
      status: "operational",
      uptime: "99.97%",
      responseTime: "65ms",
      icon: Smartphone,
      description: "Mobile application backend services",
      gradient: "from-[#036A38] to-[#00984E]"
    }
  ];

  const incidents = [
    {
      date: "Jan 15, 2024",
      time: "14:30 WAT",
      title: "Intermittent delays in Community Reports",
      status: "monitoring",
      description: "We're monitoring increased response times in the community reporting system. Navigation services remain unaffected."
    },
    {
      date: "Jan 12, 2024", 
      time: "09:15 WAT",
      title: "Map tiles loading slowly in Lagos area",
      status: "resolved",
      description: "Resolved an issue causing slow map tile loading in Lagos metropolitan area. Service fully restored."
    },
    {
      date: "Jan 8, 2024",
      time: "16:45 WAT", 
      title: "Scheduled maintenance completed",
      status: "resolved",
      description: "Completed scheduled infrastructure maintenance. All services operating normally."
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-600 ";
      case "degraded":
        return "bg-green-600 bg-yellow-50 ";
      case "outage":
        return "bg-green-600 ";
      case "monitoring":
        return "bg-green-600 ";
      case "resolved":
        return "bg-green-600 ";
      default:
        return "bg-green-600 ";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-4 w-4" />;
      case "degraded":
      case "monitoring":
        return <AlertTriangle className="h-4 w-4" />;
      case "outage":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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
              <Activity className="w-4 h-4 mr-2" />
              System Status
            </Badge>
            <h1 className="mb-6 text-auto-5xl font-bold tracking-tight font-display text-shimmer">
              NINja Map Status
            </h1>
            <p className="text-auto-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
              Real-time status and performance metrics for all NINja Map services across Nigeria. 
              We're committed to providing 99.99% uptime for your navigation needs.
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

      {/* Overall Status */}
      <section className="section-padding">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <AnimatedSection>
              <Card className="border-[#00984E]/20 bg-[#00984E]/10 mb-12 glass shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#00984E] rounded-2xl flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-auto-xl font-bold text-[#00984E] mb-2">All Systems Operational</h2>
                      <p className="text-auto-base text-[#036A38]">All core navigation services are running smoothly across Nigeria</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Services Status */}
            <AnimatedSection delay={0.1} className="mb-16">
              <h2 className="text-auto-3xl font-bold font-display text-[#00984E] mb-8 text-center">
                Service Status
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {services.map((service, index) => (
                  <Card key={index} className="border-0 shadow-xl glass hover-lift">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                          <service.icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-auto-lg font-display text-[#00984E]">
                            {service.name}
                          </h3>
                          <p className="text-auto-sm text-muted-foreground">
                            {service.description}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="font-bold text-auto-base text-[#00984E]">{service.uptime}</div>
                          <div className="text-auto-xs text-muted-foreground">Uptime</div>
                        </div>
                        <div>
                          <div className="font-bold text-auto-base text-[#00984E]">{service.responseTime}</div>
                          <div className="text-auto-xs text-muted-foreground">Response</div>
                        </div>
                        <div>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-auto-xs font-medium ${getStatusColor(service.status)}`}>
                            {getStatusIcon(service.status)}
                            {service.status}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="section-padding bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-auto-3xl font-bold font-display text-[#00984E] mb-4">
                Recent Incidents
              </h2>
              <p className="text-auto-lg text-muted-foreground max-w-2xl mx-auto">
                Transparency in our service status and incident response
              </p>
            </AnimatedSection>

            <Card className="border-0 shadow-xl glass">
              <CardContent className="p-8">
                <div className="space-y-8">
                  {incidents.map((incident, index) => (
                    <motion.div
                      key={index}
                      className="border-l-4 border-[#00984E]/20 pl-6 py-4 hover:border-[#00984E]/40 transition-colors"
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-auto-base text-[#00984E] mb-1">{incident.title}</h3>
                          <p className="text-auto-sm text-muted-foreground">
                            {incident.date} at {incident.time}
                          </p>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-auto-xs font-medium ${getStatusColor(incident.status)}`}>
                          {getStatusIcon(incident.status)}
                          {incident.status}
                        </div>
                      </div>
                      <p className="text-auto-sm text-muted-foreground leading-relaxed">
                        {incident.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Performance Insights */}
      <section className="section-padding bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-auto-3xl font-bold font-display text-[#00984E] mb-4">
              Performance Insights
            </h2>
            <p className="text-auto-lg text-muted-foreground max-w-2xl mx-auto">
              Real-time analytics and performance metrics from the last 30 days
            </p>
          </AnimatedSection>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Uptime Chart */}
            <AnimatedSection>
              <Card className="border-0 shadow-xl glass-strong h-full">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-[#00984E]/10 dark:bg-[#00984E]/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-[#00984E] dark:text-[#00984E]" />
                    </div>
                    <div>
                      <h3 className="text-auto-lg font-bold text-[#00984E]">System Uptime</h3>
                      <p className="text-auto-sm text-muted-foreground">99.98% over 30 days</p>
                    </div>
                  </div>

                  {/* Mock Chart Visualization */}
                  <div className="relative h-48 bg-gradient-to-br from-[#00984E]/10 to-[#00984E]/20 dark:from-[#00984E]/10 dark:to-[#00984E]/20 rounded-xl p-4 mb-4">
                    <div className="absolute inset-4">
                      <div className="h-full w-full flex items-end gap-1">
                        {Array.from({ length: 30 }, (_, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-[#00984E] to-[#036A38] rounded-t opacity-80 hover:opacity-100 transition-opacity"
                            style={{
                              height: `${Math.random() * 20 + 80}%`,
                              animationDelay: `${i * 50}ms`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="absolute top-4 left-4 text-auto-xs text-[#036A38] dark:text-[#00984E] font-medium">
                      100%
                    </div>
                    <div className="absolute bottom-4 left-4 text-auto-xs text-[#00984E] dark:text-[#00984E]">
                      30 days ago
                    </div>
                    <div className="absolute bottom-4 right-4 text-auto-xs text-[#00984E] dark:text-[#00984E]">
                      Today
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-auto-lg font-bold text-[#00984E]">99.98%</div>
                      <div className="text-auto-xs text-muted-foreground">Average</div>
                    </div>
                    <div>
                      <div className="text-auto-lg font-bold text-[#00984E]">24min</div>
                      <div className="text-auto-xs text-muted-foreground">Downtime</div>
                    </div>
                    <div>
                      <div className="text-auto-lg font-bold text-[#00984E]">2</div>
                      <div className="text-auto-xs text-muted-foreground">Incidents</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Response Time Chart */}
            <AnimatedSection delay={0.1}>
              <Card className="border-0 shadow-xl glass-strong h-full">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-[#00984E]/10 dark:bg-[#00984E]/20 rounded-xl flex items-center justify-center">
                      <Clock className="h-6 w-6 text-[#00984E] dark:text-[#00984E]" />
                    </div>
                    <div>
                      <h3 className="text-auto-lg font-bold text-[#00984E]">Response Times</h3>
                      <p className="text-auto-sm text-muted-foreground">Avg 89ms over 30 days</p>
                    </div>
                  </div>

                  {/* Mock Chart Visualization */}
                  <div className="relative h-48 bg-gradient-to-br from-[#00984E]/10 to-[#00984E]/20 dark:from-[#00984E]/10 dark:to-[#00984E]/20 rounded-xl p-4 mb-4">
                    <div className="absolute inset-4">
                      <div className="h-full w-full flex items-end gap-0.5">
                        {Array.from({ length: 50 }, (_, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-[#00984E] to-[#036A38] rounded-t opacity-70 hover:opacity-100 transition-opacity"
                            style={{
                              height: `${Math.random() * 40 + 40}%`,
                              animationDelay: `${i * 30}ms`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="absolute top-4 left-4 text-auto-xs text-[#036A38] dark:text-[#00984E] font-medium">
                      200ms
                    </div>
                    <div className="absolute bottom-4 left-4 text-auto-xs text-[#00984E] dark:text-[#00984E]">
                      30 days ago
                    </div>
                    <div className="absolute bottom-4 right-4 text-auto-xs text-[#00984E] dark:text-[#00984E]">
                      Today
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-auto-lg font-bold text-[#00984E]">89ms</div>
                      <div className="text-auto-xs text-muted-foreground">Average</div>
                    </div>
                    <div>
                      <div className="text-auto-lg font-bold text-[#00984E]">67ms</div>
                      <div className="text-auto-xs text-muted-foreground">Best</div>
                    </div>
                    <div>
                      <div className="text-auto-lg font-bold text-[#00984E]">156ms</div>
                      <div className="text-auto-xs text-muted-foreground">Worst</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          {/* Additional Metrics */}
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: "API Calls", value: "2.3B+", change: "+5.2%", icon: Activity, color: "text-green-600" },
              { label: "Data Processed", value: "1.2TB", change: "+12.1%", icon: Database, color: "text-green-600" },
              { label: "Error Rate", value: "0.02%", change: "-15.3%", icon: AlertTriangle, color: "text-green-600" },
              { label: "Avg Load Time", value: "1.2s", change: "-8.5%", icon: Zap, color: "text-green-600" }
            ].map((metric, index) => (
              <AnimatedSection key={index} delay={0.1 * index}>
                <Card className="border-0 shadow-lg glass hover-lift usecase-card">
                  <CardContent className="p-6 text-center">
                    <metric.icon className={`h-8 w-8 mx-auto mb-3 ${metric.color}`} />
                    <div className="text-auto-2xl font-bold text-[#00984E] mb-1">
                      {metric.value}
                    </div>
                    <div className="text-auto-sm text-muted-foreground mb-2">
                      {metric.label}
                    </div>
                    <div className={`text-auto-xs font-medium text-green-600 '
                    }`}>
                      {metric.change} vs last month
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe for Updates */}
      <section className="section-bottom-padding">
        <div className="container">
          <AnimatedSection>
            <Card className="border-0 shadow-2xl panel-metrics text-white overflow-hidden rounded-2xl">
              <CardContent className="p-16 text-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.1),transparent)]" />
                <div className="relative z-10 max-w-3xl mx-auto">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg backdrop-blur-sm">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-auto-3xl font-bold font-display mb-4">
                    Stay Updated
                  </h2>
                  <p className="text-auto-lg opacity-90 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Get notifications about service status changes and scheduled maintenance.
                    Be the first to know about any service updates.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <button className="bg-white text-[#036A38] dark:bg-[#036A38] dark:text-white inline-flex items-center text-auto-lg cursor-pointer rounded-xl px-8 py-4 font-medium transition-all duration-200 ease-out shadow-[0_4px_15px_rgba(3,106,56,0.3)] hover:shadow-[0_8px_25px_rgba(3,106,56,0.35)] hover:-translate-y-0.5">
                        <Mail className="w-5 h-5 mr-2" />
                        Subscribe to Updates
                      </button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
                      <button className="flex items-center btn-ios-outline text-auto-lg cursor-pointer  btn-ios-outline h-14 px-10 rounded-xl font-semibold text-auto-lg  btn-ios-outline text-auto-lg  btn-ios-outline bg-[#1E7A50] text-white border border-[#1E7A50]  py-4 shadow-2xl font-display text-auto-xl  justify-center hover:brightness-110 dark:bg-transparent dark:border-0">
                        <Rss className="w-5 h-5 mr-2" />
                        RSS Feed
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
