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
      gradient: "from-blue-500 to-purple-600"
    },
    {
      name: "Map Tiles",
      status: "operational", 
      uptime: "99.98%",
      responseTime: "120ms",
      icon: Globe,
      description: "Map rendering and tile serving",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      name: "Traffic Intelligence",
      status: "operational",
      uptime: "99.95%",
      responseTime: "78ms", 
      icon: Activity,
      description: "Real-time traffic data processing",
      gradient: "from-green-500 to-blue-600"
    },
    {
      name: "Mobile App Backend",
      status: "operational",
      uptime: "99.97%",
      responseTime: "65ms",
      icon: Smartphone,
      description: "Mobile application backend services",
      gradient: "from-orange-500 to-red-600"
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
        return "text-green-600 bg-green-50 border-green-200";
      case "degraded":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "outage":
        return "text-red-600 bg-red-50 border-red-200";
      case "monitoring":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "resolved":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
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
      <section className="section-padding bg-gradient-to-br from-brand/5 via-background to-gradient-to/5 relative overflow-hidden">
        <div className="absolute inset-0 hero-pattern opacity-30" />
        <div className="container relative">
          <AnimatedSection className="mx-auto max-w-4xl text-center">
            <Badge
              variant="outline"
              className="mb-6 border-brand/30 bg-brand/10 text-brand px-6 py-3 text-auto-sm font-medium"
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
                  <Card className="border-0 shadow-lg glass">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-brand rounded-xl flex items-center justify-center mx-auto mb-4">
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-auto-2xl font-bold text-brand mb-1">
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
              <Card className="border-green-200 bg-green-50 mb-12 glass shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-auto-xl font-bold text-green-800 mb-2">All Systems Operational</h2>
                      <p className="text-auto-base text-green-700">All core navigation services are running smoothly across Nigeria</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Services Status */}
            <AnimatedSection delay={0.1} className="mb-16">
              <h2 className="text-auto-3xl font-bold font-display text-brand mb-8 text-center">
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
                          <h3 className="font-bold text-auto-lg font-display text-brand">
                            {service.name}
                          </h3>
                          <p className="text-auto-sm text-muted-foreground">
                            {service.description}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="font-bold text-auto-base text-brand">{service.uptime}</div>
                          <div className="text-auto-xs text-muted-foreground">Uptime</div>
                        </div>
                        <div>
                          <div className="font-bold text-auto-base text-brand">{service.responseTime}</div>
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
              <h2 className="text-auto-3xl font-bold font-display text-brand mb-4">
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
                      className="border-l-4 border-brand/20 pl-6 py-4 hover:border-brand/40 transition-colors"
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-auto-base text-brand mb-1">{incident.title}</h3>
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
            <h2 className="text-auto-3xl font-bold font-display text-brand mb-4">
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
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-auto-lg font-bold text-brand">System Uptime</h3>
                      <p className="text-auto-sm text-muted-foreground">99.98% over 30 days</p>
                    </div>
                  </div>

                  {/* Mock Chart Visualization */}
                  <div className="relative h-48 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-800/10 rounded-xl p-4 mb-4">
                    <div className="absolute inset-4">
                      <div className="h-full w-full flex items-end gap-1">
                        {Array.from({ length: 30 }, (_, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-green-500 to-green-400 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                            style={{
                              height: `${Math.random() * 20 + 80}%`,
                              animationDelay: `${i * 50}ms`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="absolute top-4 left-4 text-auto-xs text-green-700 dark:text-green-300 font-medium">
                      100%
                    </div>
                    <div className="absolute bottom-4 left-4 text-auto-xs text-green-600 dark:text-green-400">
                      30 days ago
                    </div>
                    <div className="absolute bottom-4 right-4 text-auto-xs text-green-600 dark:text-green-400">
                      Today
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-auto-lg font-bold text-green-600">99.98%</div>
                      <div className="text-auto-xs text-muted-foreground">Average</div>
                    </div>
                    <div>
                      <div className="text-auto-lg font-bold text-green-600">24min</div>
                      <div className="text-auto-xs text-muted-foreground">Downtime</div>
                    </div>
                    <div>
                      <div className="text-auto-lg font-bold text-green-600">2</div>
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
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-auto-lg font-bold text-brand">Response Times</h3>
                      <p className="text-auto-sm text-muted-foreground">Avg 89ms over 30 days</p>
                    </div>
                  </div>

                  {/* Mock Chart Visualization */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/10 rounded-xl p-4 mb-4">
                    <div className="absolute inset-4">
                      <div className="h-full w-full flex items-end gap-0.5">
                        {Array.from({ length: 50 }, (_, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                            style={{
                              height: `${Math.random() * 40 + 40}%`,
                              animationDelay: `${i * 30}ms`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="absolute top-4 left-4 text-auto-xs text-blue-700 dark:text-blue-300 font-medium">
                      200ms
                    </div>
                    <div className="absolute bottom-4 left-4 text-auto-xs text-blue-600 dark:text-blue-400">
                      30 days ago
                    </div>
                    <div className="absolute bottom-4 right-4 text-auto-xs text-blue-600 dark:text-blue-400">
                      Today
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-auto-lg font-bold text-blue-600">89ms</div>
                      <div className="text-auto-xs text-muted-foreground">Average</div>
                    </div>
                    <div>
                      <div className="text-auto-lg font-bold text-blue-600">67ms</div>
                      <div className="text-auto-xs text-muted-foreground">Best</div>
                    </div>
                    <div>
                      <div className="text-auto-lg font-bold text-blue-600">156ms</div>
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
              { label: "API Calls", value: "2.3B+", change: "+5.2%", icon: Activity, color: "text-purple-600" },
              { label: "Data Processed", value: "1.2TB", change: "+12.1%", icon: Database, color: "text-orange-600" },
              { label: "Error Rate", value: "0.02%", change: "-15.3%", icon: AlertTriangle, color: "text-red-600" },
              { label: "Avg Load Time", value: "1.2s", change: "-8.5%", icon: Zap, color: "text-green-600" }
            ].map((metric, index) => (
              <AnimatedSection key={index} delay={0.1 * index}>
                <Card className="border-0 shadow-lg glass hover-lift">
                  <CardContent className="p-6 text-center">
                    <metric.icon className={`h-8 w-8 mx-auto mb-3 ${metric.color}`} />
                    <div className="text-auto-2xl font-bold text-brand mb-1">
                      {metric.value}
                    </div>
                    <div className="text-auto-sm text-muted-foreground mb-2">
                      {metric.label}
                    </div>
                    <div className={`text-auto-xs font-medium ${
                      metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
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
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-brand to-gradient-to text-white overflow-hidden">
              <CardContent className="p-12 text-center relative">
                <div className="absolute inset-0 bg-pattern opacity-20" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg backdrop-blur-sm">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-auto-3xl font-bold font-display mb-4">
                    Stay Updated
                  </h2>
                  <p className="text-auto-lg opacity-90 max-w-2xl mx-auto mb-8">
                    Get notifications about service status changes and scheduled maintenance. 
                    Be the first to know about any service updates.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="bg-white text-brand hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-200">
                        <Mail className="w-4 h-4 mr-2" />
                        Subscribe to Updates
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" className="border-white/30 text-white hover:bg-white hover:text-brand bg-transparent transition-all backdrop-blur-sm">
                        <Rss className="w-4 h-4 mr-2" />
                        RSS Feed
                      </Button>
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
