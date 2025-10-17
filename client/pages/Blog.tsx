import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  User, 
  Search, 
  Tag,
  ArrowRight,
  Filter,
  TrendingUp,
  MapPin,
  Zap,
  Users,
  Heart,
  MessageSquare,
  Share2,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

// Real image component for blog posts
const BlogImage = ({ type, className }: { type: string; className?: string }) => {
  const imageUrls = {
    "ai-tech": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    "community": "https://images.unsplash.com/photo-1529390079861-591de354faf5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    "offline-tech": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    "business": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    "traffic-ai": "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    "safety": "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
  };

  const overlayGradients = {
    "ai-tech": "from-[#036A38]/80 to-[#00984E]/80",
    "community": "from-[#036A38]/80 to-[#00984E]/80",
    "offline-tech": "from-[#036A38]/80 to-[#00984E]/80",
    "business": "from-[#036A38]/80 to-[#00984E]/80",
    "traffic-ai": "from-[#036A38]/80 to-[#00984E]/80",
    "safety": "from-[#036A38]/80 to-[#00984E]/80"
  };

  const imageUrl = imageUrls[type as keyof typeof imageUrls] || imageUrls["ai-tech"];
  const gradient = overlayGradients[type as keyof typeof overlayGradients] || overlayGradients["ai-tech"];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={imageUrl}
        alt="Blog post image"
        className="w-full aspect-3/2 object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
};

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Posts", count: 42 },
    { id: "navigation", name: "Navigation", count: 15 },
    { id: "technology", name: "Technology", count: 12 },
    { id: "community", name: "Community", count: 8 },
    { id: "updates", name: "Updates", count: 7 }
  ];

  const featuredPost = {
    id: 1,
    title: "The Future of Navigation in Nigeria: AI-Powered Mapping Revolution",
    excerpt: "Discover how artificial intelligence is transforming the way Nigerians navigate their cities, from Lagos traffic optimization to rural pathway mapping.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    author: "Dr. Adebayo Johnson",
    authorRole: "Chief Technology Officer",
    authorAvatar: "AJ",
    publishDate: "2024-01-15",
    readTime: "8 min read",
    category: "Technology",
    imageType: "ai-tech",
    tags: ["AI", "Navigation", "Technology", "Nigeria"],
    views: 12500,
    likes: 145,
    comments: 23
  };

  const blogPosts = [
    {
      id: 2,
      title: "Community-Driven Mapping: How Nigerian Drivers Shape Our Platform",
      excerpt: "Learn how real-time reports from over 2.5 million Nigerian drivers help create the most accurate navigation experience.",
      author: "Kemi Okafor",
      authorRole: "Community Manager",
      authorAvatar: "KO",
      publishDate: "2024-01-12",
      readTime: "5 min read",
      category: "Community",
      imageType: "community",
      tags: ["Community", "Mapping", "Real-time"],
      views: 8200,
      likes: 89,
      comments: 15
    },
    {
      id: 3,
      title: "Offline Navigation: Staying Connected When Networks Fail",
      excerpt: "Explore how NINja Map's offline capabilities ensure you never get lost, even in areas with poor network coverage.",
      author: "Ibrahim Musa",
      authorRole: "Product Manager",
      authorAvatar: "IM",
      publishDate: "2024-01-10",
      readTime: "6 min read",
      category: "Technology",
      imageType: "offline-tech",
      tags: ["Offline", "Technology", "Mobile"],
      views: 6800,
      likes: 72,
      comments: 12
    },
    {
      id: 4,
      title: "Supporting Local Businesses Through Better Navigation",
      excerpt: "How accurate mapping and local business integration help boost Nigeria's economy one route at a time.",
      author: "Folake Adeniyi",
      authorRole: "Business Development",
      authorAvatar: "FA",
      publishDate: "2024-01-08",
      readTime: "4 min read",
      category: "Community",
      imageType: "business",
      tags: ["Business", "Economy", "Local"],
      views: 5200,
      likes: 65,
      comments: 8
    },
    {
      id: 5,
      title: "Traffic Intelligence: Predicting Lagos Rush Hour with AI",
      excerpt: "Deep dive into how machine learning algorithms analyze traffic patterns to predict optimal travel times.",
      author: "David Okonkwo",
      authorRole: "Data Scientist",
      authorAvatar: "DO",
      publishDate: "2024-01-05",
      readTime: "7 min read",
      category: "Technology",
      imageType: "traffic-ai",
      tags: ["AI", "Traffic", "Lagos", "Prediction"],
      views: 9500,
      likes: 112,
      comments: 18
    },
    {
      id: 6,
      title: "Safety First: Real-Time Incident Reporting Across Nigeria",
      excerpt: "Learn how community-reported incidents help keep Nigerian roads safer for everyone.",
      author: "Aisha Suleiman",
      authorRole: "Safety Coordinator",
      authorAvatar: "AS",
      publishDate: "2024-01-03",
      readTime: "5 min read",
      category: "Community",
      imageType: "safety",
      tags: ["Safety", "Reporting", "Community"],
      views: 4100,
      likes: 58,
      comments: 9
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || post.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
              <BookOpen className="w-4 h-4 mr-2" />
              NINja Map Blog
            </Badge>
            <h1 className="mb-6 text-auto-5xl font-bold tracking-tight font-display text-shimmer">
              Navigation Insights & Stories
            </h1>
            <p className="text-auto-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-12">
              Discover the latest in Nigerian navigation technology, community stories, and insights
              from the team building Africa's most advanced mapping platform.
            </p>

            {/* Compact Search Section */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                <Input
                  placeholder="Search articles, topics, or authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-28 h-12 text-auto-base bg-white/80 dark:bg-card/80 backdrop-blur-lg border border-white/40 dark:border-border/40 rounded-full shadow-lg hover:shadow-xl transition-all focus:shadow-xl focus:scale-[1.02] focus:bg-white dark:focus:bg-card"
                />
                <Button
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-4 bg-[#036A38] text-white rounded-full shadow-md hover:shadow-lg transition-all text-xs"
                >
                  <Filter className="w-3 h-3 mr-1" />
                  Filter
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Enhanced Categories Section */}
      <section className="section-padding bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-auto-3xl font-bold font-display text-[#00984E] mb-4">
              Explore by Category
            </h2>
            <p className="text-auto-lg text-muted-foreground max-w-2xl mx-auto">
              Browse our curated content across different aspects of Nigerian navigation
            </p>
          </AnimatedSection>

          <div className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto">
            {categories.map((category, index) => (
              <AnimatedSection key={category.id} delay={index * 0.1}>
                <motion.button
                  onClick={() => setSelectedCategory(category.id)}
                  className={`group flex items-center gap-3 px-6 py-4 rounded-xl font-medium text-auto-sm transition-all shadow-lg hover:shadow-xl border ${
                    selectedCategory === category.id
                      ? 'bg-[#036A38] text-white border-transparent scale-105'
                      : 'bg-white dark:bg-card text-muted-foreground hover:text-[#00984E] border-border/40 hover:border-[#00984E]/40 hover:bg-[#00984E]/5'
                  }`}
                  whileHover={{ scale: selectedCategory === category.id ? 1.05 : 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {category.name}
                  <Badge
                    variant={selectedCategory === category.id ? "secondary" : "outline"}
                    className={`text-xs transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-white/20 text-white border-white/30'
                        : 'group-hover:border-[#00984E]/40 group-hover:text-[#00984E]'
                    }`}
                  >
                    {category.count}
                  </Badge>
                </motion.button>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post - Redesigned */}
      <section className="section-padding">
        <div className="container">
          <AnimatedSection className="mb-16">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="h-5 w-5 text-[#00984E]" />
              <h2 className="text-auto-2xl font-bold font-display text-[#00984E]">Featured Article</h2>
            </div>
            
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="border-0 shadow-2xl overflow-hidden glass-strong hover-glow group relative">
                {/* Full-width image background */}
                <div className="relative  overflow-hidden">
                  <BlogImage type={featuredPost.imageType} className="w-full h-[450px] group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
                  
                  {/* Featured badge */}
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-gradient-to-r from-[#036A38] to-[#00984E] text-white shadow-xl backdrop-blur-sm px-4 py-2 text-sm font-medium border-0">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Featured Article
                    </Badge>
                  </div>

                  {/* Content overlay */}
                  <div className="absolute inset-0 flex items-end">
                    <div className="p-8 lg:p-12 text-white w-full">
                        <div className="flex items-center gap-3 mb-4">
                          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1">
                            {featuredPost.category}
                          </Badge>
                          <span className="text-sm opacity-90">
                            {new Date(featuredPost.publishDate).toLocaleDateString()}
                          </span>
                          <span className="text-sm opacity-90">•</span>
                          <span className="text-sm opacity-90">{featuredPost.readTime}</span>
                        </div>

                        <h3 className="text-auto-3xl lg:text-auto-4xl font-bold font-display my-6 leading-tight">
                          {featuredPost.title}
                        </h3>

                        <p className="text-auto-lg opacity-90 leading-relaxed mb-8 line-clamp-2">
                          {featuredPost.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border border-white/30">
                              {featuredPost.authorAvatar}
                            </div>
                            <div>
                              <div className="font-bold text-auto-base">{featuredPost.author}</div>
                              <div className="text-auto-sm opacity-80">{featuredPost.authorRole}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4 text-sm opacity-90">
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>{featuredPost.views.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                <span>{featuredPost.likes}</span>
                              </div>
                            </div>
                            
                            <Link
                              to={`/blog/${featuredPost.id}`}
                              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white hover:text-gray-900 text-white px-6 py-3 rounded-full transition-all font-medium backdrop-blur-sm border border-white/30 group-hover:scale-105"
                            >
                              Read Article
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="section-padding bg-muted/20">
        <div className="container">
          <AnimatedSection className="mb-16">
            <h2 className="text-auto-3xl font-bold font-display text-[#00984E] mb-4">Latest Articles</h2>
            <p className="text-auto-lg text-muted-foreground">
              Stay updated with the latest insights, technology updates, and community stories
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPosts.map((post, index) => (
              <AnimatedSection key={post.id} delay={index * 0.05}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="h-full"
                >
                  <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 h-full glass overflow-hidden group">
                    {/* Modern image section */}
                    <div className="relative overflow-hidden h-48">
                      <BlogImage type={post.imageType} className="w-full h-full" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* Top badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <Badge className="bg-white/95 text-gray-900 text-xs font-medium shadow-md px-2 py-1">
                          {post.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-white bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </div>
                      </div>

                      {/* Bottom stats */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center justify-between text-white text-xs">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span className="font-medium">{post.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              <span className="font-medium">{post.likes}</span>
                            </div>
                          </div>
                          <span className="opacity-90 font-medium">
                            {new Date(post.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Streamlined content */}
                    <CardContent className="p-5 flex flex-col flex-grow">
                      {/* Title */}
                      <h3 className="font-bold text-base leading-tight font-display mb-3 line-clamp-2 group-hover:text-[#00984E] transition-colors">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-grow">
                        {post.excerpt}
                      </p>

                      {/* Bottom section */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/30">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-[#036A38] to-[#00984E] rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {post.authorAvatar}
                          </div>
                          <div>
                            <div className="font-medium text-xs text-foreground">{post.author}</div>
                            <div className="text-xs text-muted-foreground">{post.authorRole}</div>
                          </div>
                        </div>

                        <Link
                          to={`/blog/${post.id}`}
                          className="inline-flex items-center gap-1 bg-[#00984E]/10 hover:bg-[#00984E] hover:text-white text-[#00984E] px-3 py-1.5 rounded-full transition-all font-medium text-xs group/btn"
                        >
                          Read
                          <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-auto-lg font-medium mb-2">No articles found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="section-padding">
        <div className="container">
          <AnimatedSection>
            <Card className="border-0 shadow-2xl text-white overflow-hidden panel-metrics" >
              <CardContent className="p-12 text-center relative">
                <div className="absolute inset-0 bg-pattern opacity-20" />
                <div className="relative z-10">
                  <h3 className="text-auto-3xl font-bold font-display mb-4">
                    Stay Updated with NINja Map
                  </h3>
                  <p className="text-auto-lg opacity-90 mb-8 max-w-2xl mx-auto">
                    Get the latest navigation insights, technology updates, and community stories 
                    delivered to your inbox every week.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                    <Input
                      placeholder="Enter your email"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/70 h-12"
                    />
                    <Button className="bg-white text-[#00984E] hover:bg-white/90 h-12 px-6">
                      Subscribe
                    </Button>
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
