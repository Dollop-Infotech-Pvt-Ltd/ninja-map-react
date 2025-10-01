import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Rss,
  Download,
  Copy,
  Share2,
  Bell,
  Smartphone,
  Globe,
  Code,
  CheckCircle,
  ExternalLink,
  Calendar,
  Clock,
  BookOpen,
  Zap,
  Heart,
  Users,
  TrendingUp,
  Shield,
  Eye,
  Settings,
  Star,
  Wifi,
  Filter,
  Layers,
  Radio
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

export default function RSS() {
  const [copiedFeed, setCopiedFeed] = useState<string | null>(null);

  const rssFeeds = [
    {
      id: "main",
      title: "All Articles",
      description: "Complete feed of all blog posts, updates, and insights from NINja Map",
      url: "https://ninjamap.ng/rss/all.xml",
      icon: BookOpen,
      color: "from-blue-500 to-purple-600",
      subscribers: "2.5K",
      frequency: "Daily",
      posts: 42
    },
    {
      id: "tech",
      title: "Technology Updates",
      description: "Latest in navigation technology, AI developments, and platform updates",
      url: "https://ninjamap.ng/rss/technology.xml",
      icon: Zap,
      color: "from-yellow-500 to-orange-600",
      subscribers: "1.8K",
      frequency: "Weekly",
      posts: 15
    },
    {
      id: "community",
      title: "Community Stories",
      description: "User stories, community highlights, and local business features",
      url: "https://ninjamap.ng/rss/community.xml",
      icon: Heart,
      color: "from-pink-500 to-red-600",
      subscribers: "1.2K",
      frequency: "Bi-weekly", 
      posts: 12
    },
    {
      id: "business",
      title: "Business Insights",
      description: "Industry analysis, business updates, and partnership announcements",
      url: "https://ninjamap.ng/rss/business.xml",
      icon: TrendingUp,
      color: "from-green-500 to-blue-600",
      subscribers: "950",
      frequency: "Weekly",
      posts: 8
    }
  ];

  const rssClients = [
    {
      name: "Feedly",
      description: "AI-powered news reader with smart curation",
      icon: "📱",
      users: "15M+",
      rating: 4.8,
      features: ["Smart categories", "AI insights", "Team sharing"],
      gradient: "from-green-500 to-blue-600"
    },
    {
      name: "Inoreader",
      description: "Professional RSS with advanced automation",
      icon: "⚡",
      users: "500K+", 
      rating: 4.7,
      features: ["Advanced filters", "API access", "Analytics"],
      gradient: "from-blue-500 to-purple-600"
    },
    {
      name: "NewsBlur",
      description: "Intelligent reader that learns your preferences",
      icon: "🧠",
      users: "100K+",
      rating: 4.5,
      features: ["ML training", "Story intelligence", "Social features"],
      gradient: "from-purple-500 to-pink-600"
    }
  ];

  const copyToClipboard = async (url: string, feedId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedFeed(feedId);
      setTimeout(() => setCopiedFeed(null), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const openInFeedly = (url: string) => {
    window.open(`https://feedly.com/i/subscription/feed/${encodeURIComponent(url)}`, '_blank');
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
              <Rss className="w-4 h-4 mr-2" />
              RSS Feeds
            </Badge>
            <h1 className="mb-6 text-auto-5xl font-bold tracking-tight font-display text-shimmer">
              Stay Connected with RSS
            </h1>
            <p className="text-auto-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
              Never miss an update from NINja Map. Subscribe to our RSS feeds and get the latest 
              navigation insights, technology updates, and community stories delivered directly to your feed reader.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {[
                { label: "Active Subscribers", value: "6.5K+", icon: Users },
                { label: "Articles Published", value: "150+", icon: BookOpen },
                { label: "Weekly Updates", value: "5-8", icon: Calendar },
                { label: "Average Read Time", value: "6 min", icon: Clock }
              ].map((stat, index) => (
                <AnimatedSection key={index} delay={0.1 * index}>
                  <Card className="border-0 shadow-lg glass">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-brand rounded-xl flex items-center justify-center mx-auto mb-4">
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-auto-2xl font-bold text-brand mb-1">
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

      {/* RSS Feeds - Modern Design */}
      <section className="section-padding">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-auto-3xl font-bold font-display text-brand mb-4">
              Choose Your Content Stream
            </h2>
            <p className="text-auto-lg text-muted-foreground max-w-2xl mx-auto">
              Subscribe to personalized RSS feeds tailored to your interests and stay informed with the content that matters to you
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {rssFeeds.map((feed, index) => (
              <AnimatedSection key={feed.id} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full glass-strong overflow-hidden group">
                    {/* Modern header */}
                    <div className={`relative p-8 bg-gradient-to-br ${feed.color} text-white overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                            <feed.icon className="h-8 w-8 text-white" />
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{feed.subscribers}</div>
                            <div className="text-sm opacity-80">subscribers</div>
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-bold mb-3 font-display">
                          {feed.title}
                        </h3>
                        
                        <div className="flex items-center gap-4 mb-4">
                          <Badge className="bg-white/20 text-white border-white/30">
                            {feed.frequency}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm opacity-90">
                            <BookOpen className="h-4 w-4" />
                            <span>{feed.posts} posts</span>
                          </div>
                        </div>
                        
                        <p className="opacity-90 text-sm leading-relaxed">
                          {feed.description}
                        </p>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {/* URL display */}
                      <div className="bg-muted/50 rounded-lg p-3 mb-6 font-mono text-xs text-muted-foreground break-all border border-border/40">
                        {feed.url}
                      </div>

                      {/* Action buttons */}
                      <div className="space-y-3">
                        <Button
                          onClick={() => copyToClipboard(feed.url, feed.id)}
                          variant="outline"
                          className="w-full h-12 group border-border/60 hover:border-brand/60 hover:bg-brand/5"
                        >
                          {copiedFeed === feed.id ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                              <span className="text-green-600">Copied to Clipboard!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2 group-hover:text-brand" />
                              <span className="group-hover:text-brand">Copy RSS URL</span>
                            </>
                          )}
                        </Button>
                        
                        <Button
                          onClick={() => openInFeedly(feed.url)}
                          className={`w-full h-12 bg-gradient-to-r ${feed.color} text-white hover:opacity-90 shadow-lg hover:shadow-xl`}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open in Feedly
                        </Button>
                      </div>

                      {/* Feature highlights */}
                      <div className="mt-6 pt-4 border-t border-border/30">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Radio className="h-4 w-4" />
                            <span>Auto-updates</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Wifi className="h-4 w-4" />
                            <span>Real-time sync</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            <span>Secure feed</span>
                          </div>
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

      {/* RSS Benefits */}
      <section className="section-padding bg-muted/20">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-auto-3xl font-bold font-display text-brand mb-4">
              Why RSS Over Social Media?
            </h2>
            <p className="text-auto-lg text-muted-foreground max-w-2xl mx-auto">
              RSS feeds offer a superior content consumption experience compared to algorithm-driven social platforms
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "No Algorithms",
                description: "Get content in chronological order without manipulation",
                color: "from-blue-500 to-purple-600"
              },
              {
                icon: Eye,
                title: "Privacy First",
                description: "No tracking, data collection, or behavioral profiling",
                color: "from-green-500 to-blue-600"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Instant updates without ads or unnecessary content",
                color: "from-yellow-500 to-orange-600"
              },
              {
                icon: Settings,
                title: "Full Control",
                description: "Organize, filter, and customize your content experience",
                color: "from-purple-500 to-pink-600"
              }
            ].map((benefit, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full glass text-center overflow-hidden">
                    <CardContent className="p-8">
                      <div className={`w-16 h-16 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                        <benefit.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg mb-4 font-display">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Modern RSS Clients */}
      <section className="section-padding">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-auto-3xl font-bold font-display text-brand mb-4">
              Recommended RSS Readers
            </h2>
            <p className="text-auto-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from these popular and reliable RSS readers to manage your NINja Map subscriptions
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {rssClients.map((client, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full glass-strong overflow-hidden">
                    {/* Client header */}
                    <div className={`p-8 bg-gradient-to-br ${client.gradient} text-white relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                      <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                      
                      <div className="relative z-10 text-center">
                        <div className="text-5xl mb-4">{client.icon}</div>
                        <h3 className="text-xl font-bold mb-2 font-display">
                          {client.name}
                        </h3>
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(client.rating)
                                    ? 'text-yellow-300 fill-current'
                                    : 'text-white/30'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{client.rating}</span>
                        </div>
                        <p className="text-sm opacity-90 mb-2">{client.users} users</p>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                        {client.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-3 mb-6">
                        {client.features.map((feature, fIndex) => (
                          <div key={fIndex} className="flex items-center gap-3">
                            <CheckCircle className="h-4 w-4 text-brand flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        className={`w-full bg-gradient-to-r ${client.gradient} text-white hover:opacity-90 shadow-lg`}
                      >
                        Try {client.name}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-bottom-padding">
        <div className="container">
          <AnimatedSection>
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-brand to-gradient-to text-white overflow-hidden">
              <CardContent className="p-16 text-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.1),transparent)]" />
                <div className="relative z-10 max-w-3xl mx-auto">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg backdrop-blur-sm">
                    <Rss className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-auto-4xl font-bold font-display mb-6">
                    Start Your RSS Journey Today
                  </h3>
                  <p className="text-auto-xl opacity-90 mb-10 leading-relaxed">
                    Join thousands of subscribers who stay updated with Nigeria's navigation revolution. 
                    Choose your preferred feed and never miss an important update.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button className="bg-white text-brand hover:bg-white/90 px-10 py-4 h-14 text-lg font-semibold">
                        <Download className="w-5 h-5 mr-2" />
                        Download OPML File
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/blog"
                        className="inline-flex items-center gap-3 border-2 border-white text-white px-10 py-4 rounded-lg hover:bg-white hover:text-brand transition-all duration-200 h-14 text-lg font-semibold"
                      >
                        <BookOpen className="w-5 h-5" />
                        Browse Blog
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
