import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Clock, 
  Search, 
  ArrowRight,
  Filter,
  TrendingUp,
  Heart,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { get } from "@/lib/http";
import { BlogResponse, BlogArticle } from "@shared/api";
import Loader from "@/components/Loader";

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
  const [loading, setLoading] = useState(true);
  const [featuredArticle, setFeaturedArticle] = useState<BlogArticle | null>(null);
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [allCategories, setAllCategories] = useState<Array<{ id: string; name: string; count: number }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all categories on mount
    fetchAllCategories();
  }, []);

  useEffect(() => {
    // Fetch blog data when category changes
    fetchBlogData(selectedCategory);
  }, [selectedCategory]);

  const fetchAllCategories = async () => {
    try {
      // Fetch all posts to get category counts
      const response = await get<BlogResponse>(
        "/api/blogs/get-all?pageSize=100&pageNumber=0&sortDirection=ASC&sortKey=createdDate"
      );

      if (response.success && response.data) {
        const allArticles = [...response.data.featuredArticles, ...response.data.latestArticles];
        const categoryMap = new Map<string, number>();
        
        allArticles.forEach(article => {
          const cat = article.category;
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
        });

        const cats = [
          { id: "all", name: "All Posts", count: allArticles.length },
          ...Array.from(categoryMap.entries()).map(([cat, count]) => ({
            id: cat.toLowerCase(),
            name: cat.charAt(0) + cat.slice(1).toLowerCase().replace(/_/g, ' '),
            count
          }))
        ];
        
        setAllCategories(cats);
      }
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchBlogData = async (category?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params - if category is "all" or not provided, don't include category filter
      const categoryParam = category && category !== "all" ? `&category=${category.toUpperCase()}` : "";
      const response = await get<BlogResponse>(
        `/api/blogs/get-all?pageSize=10&pageNumber=0&sortDirection=DESC&sortKey=createdDate${categoryParam}`
      );

      if (response.success && response.data) {
        // Set featured article (first one from featuredArticles array)
        if (response.data.featuredArticles.length > 0) {
          setFeaturedArticle(response.data.featuredArticles[0]);
        } else {
          setFeaturedArticle(null);
        }
        
        // Set latest articles
        setArticles(response.data.latestArticles);
      }
    } catch (err: any) {
      console.error("Failed to fetch blog data:", err);
      setError(err.message || "Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get author initials
  const getAuthorInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to get image type based on category
  const getImageType = (category: string) => {
    const typeMap: Record<string, string> = {
      "NAVIGATION": "ai-tech",
      "TECHNOLOGY": "traffic-ai",
      "COMMUNITY": "community",
      "UPDATES": "business"
    };
    return typeMap[category] || "ai-tech";
  };

  // Filter by search only (category filtering is done via API)
  const filteredPosts = articles.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.previewContent.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader isVisible={true} />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Blog</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => fetchBlogData(selectedCategory)}>Try Again</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
            {allCategories.map((category, index) => (
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
      {featuredArticle && (
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
                  <div className="relative overflow-hidden">
                    <BlogImage 
                      type={getImageType(featuredArticle.category)} 
                      className="w-full h-[450px] group-hover:scale-105 transition-transform duration-700" 
                    />
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
                              {featuredArticle.category}
                            </Badge>
                            <span className="text-sm opacity-90">
                              {new Date(featuredArticle.postDate).toLocaleDateString()}
                            </span>
                            <span className="text-sm opacity-90">•</span>
                            <span className="text-sm opacity-90">{featuredArticle.readTimeMinutes} min read</span>
                          </div>

                          <h3 className="text-auto-3xl lg:text-auto-4xl font-bold font-display my-6 leading-tight">
                            {featuredArticle.title}
                          </h3>

                          <p className="text-auto-lg opacity-90 leading-relaxed mb-8 line-clamp-2">
                            {featuredArticle.previewContent}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {featuredArticle.author.profilePicture ? (
                                <img 
                                  src={featuredArticle.author.profilePicture} 
                                  alt={featuredArticle.author.name}
                                  className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-white/30"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border border-white/30">
                                  {getAuthorInitials(featuredArticle.author.name)}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-auto-base">{featuredArticle.author.name}</div>
                                <div className="text-auto-sm opacity-80">{featuredArticle.author.designation}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-4 text-sm opacity-90">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  <span>{featuredArticle.views.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-4 w-4" />
                                  <span>{featuredArticle.likes}</span>
                                </div>
                              </div>
                              
                              <Link
                                to={`/blog/${featuredArticle.id}`}
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
      )}

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
                      <BlogImage type={getImageType(post.category)} className="w-full h-full" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* Top badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <Badge className="bg-white/95 text-gray-900 text-xs font-medium shadow-md px-2 py-1">
                          {post.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-white bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
                          <Clock className="h-3 w-3" />
                          {post.readTimeMinutes} min
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
                            {new Date(post.postDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                        {post.previewContent}
                      </p>

                      {/* Bottom section */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/30">
                        <div className="flex items-center gap-2">
                          {post.author.profilePicture ? (
                            <img 
                              src={post.author.profilePicture} 
                              alt={post.author.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-r from-[#036A38] to-[#00984E] rounded-full flex items-center justify-center text-white font-bold text-xs">
                              {getAuthorInitials(post.author.name)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-xs text-foreground">{post.author.name}</div>
                            <div className="text-xs text-muted-foreground">{post.author.designation}</div>
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
                    <Link to={"/"} className=" inline-flex items-center gap-2 bg-white text-[#00984E] dark:bg-[#00984E] dark:text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all font-medium text-auto-sm shadow-lg hover:shadow-xl">
                      Subscribe
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
