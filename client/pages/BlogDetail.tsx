import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ui/action-button";
import { UnifiedInput, UnifiedTextarea } from "@/components/ui/unified-input";
import { useSmartToast } from "@/hooks/use-smart-toast";
import { useFormValidation } from "@/components/ui/unified-input";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  User,
  Share2,
  Heart,
  MessageSquare,
  Eye,
  Bookmark,
  Twitter,
  Facebook,
  Linkedin,
  Link as LinkIcon,
  Tag,
  CheckCircle,
  ThumbsUp,
  Send,
  Quote,
  TrendingUp,
  Users,
  Target,
  MapPin,
  Sparkles,
  BookOpen,
  Coffee,
  Star,
  Award
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

export default function BlogDetail() {
  const { id } = useParams();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(145);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useSmartToast();
  const validation = useFormValidation();
  
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Emeka Okafor",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content: "This is exactly what Nigerian navigation needed! The AI integration sounds revolutionary. I can't wait to see how this transforms our daily commute experiences.",
      timestamp: "2 hours ago",
      likes: 12,
      role: "Software Engineer"
    },
    {
      id: 2,
      author: "Fatima Mohammed",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      content: "Looking forward to seeing how this impacts traffic in Abuja. The insights about local landmarks navigation are spot-on! This truly understands how we navigate in Nigeria.",
      timestamp: "4 hours ago",
      likes: 8,
      role: "Urban Planner"
    },
    {
      id: 3,
      author: "Chidi Eze",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "The offline functionality mentioned here is a game-changer for rural areas. This level of innovation is exactly what Nigeria needs for technological advancement.",
      timestamp: "6 hours ago",
      likes: 15,
      role: "Tech Entrepreneur"
    }
  ]);

  // Mock blog post data
  const blogPost = {
    id: parseInt(id || "1"),
    title: "The Future of Navigation in Nigeria: AI-Powered Mapping Revolution",
    subtitle: "How artificial intelligence is transforming Nigerian transportation and creating a truly local navigation experience",
    content: `
      Nigeria's transportation landscape is undergoing a revolutionary transformation, and at the heart of this change lies artificial intelligence. As we navigate the complexities of Africa's most populous nation, traditional mapping solutions have fallen short of addressing our unique challenges.

      For years, Nigerian drivers have struggled with navigation systems that simply don't understand our roads, our landmarks, or our way of life. From the bustling streets of Lagos to the emerging cities of the North, each region presents its own unique navigation challenges that require local intelligence and cultural understanding.

      Our artificial intelligence systems have been trained on millions of data points from Nigerian roads, incorporating everything from traffic patterns to local naming conventions. This isn't just adaptation of foreign technology—it's innovation built from the ground up for Nigerian needs.

      Using machine learning algorithms, we process real-time data from over 2.5 million Nigerian drivers to predict traffic patterns, identify optimal routes, and provide accurate arrival times. Our AI doesn't just react to traffic—it anticipates it.

      Nigerian drivers don't navigate by street numbers alone. We use landmarks, popular businesses, and cultural references. Our AI understands directions like "turn at the popular Suya spot" or "pass the third mosque on your right."

      The power of NINja Map lies not just in its technology, but in its community. Every report from our users helps train our AI to better understand Nigerian roads, making the system smarter and more accurate with each journey.

      As we expand across all 36 states, our AI continues to learn and adapt to the unique characteristics of each region. The future of navigation in Nigeria isn't just about technology—it's about understanding and serving the needs of Nigerian drivers, businesses, and communities.

      This is just the beginning. With continued innovation and community support, we're building a navigation platform that truly understands Nigeria and serves its people with the accuracy and reliability they deserve.
    `,
    author: "Dr. Adebayo Johnson",
    authorRole: "Chief Technology Officer",
    authorBio: "Dr. Johnson leads NINja Map's technology initiatives, bringing over 15 years of experience in AI and machine learning to Nigerian navigation challenges. He holds a PhD in Computer Science from the University of Lagos.",
    authorAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face",
    publishDate: "2024-01-15",
    readTime: "8 min read",
    category: "Technology",
    tags: ["AI", "Navigation", "Technology", "Nigeria", "Machine Learning", "Innovation"],
    views: 12500,
    likes: 145,
    commentsCount: 23,
    shareCount: 89,
    hero: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&h=600&fit=crop"
  };

  const relatedPosts = [
    {
      id: 2,
      title: "Building Smart Cities: Lagos Traffic Solution",
      excerpt: "How NINja Map is contributing to Lagos State's smart city initiative through intelligent traffic management systems.",
      author: "Sarah Adebisi",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop",
      category: "Smart Cities"
    },
    {
      id: 3,
      title: "The Psychology of Nigerian Navigation",
      excerpt: "Understanding cultural patterns in how Nigerians navigate and the role of community in wayfinding.",
      author: "Prof. Kemi Ogundimu",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1586880244386-8b3e34c8382c?w=400&h=250&fit=crop",
      category: "Research"
    },
    {
      id: 4,
      title: "Offline Navigation: Connecting Rural Nigeria",
      excerpt: "How offline capabilities in NINja Map are bridging the digital divide in remote Nigerian communities.",
      author: "Ibrahim Musa",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1541692641319-981cc10497fb?w=400&h=250&fit=crop",
      category: "Innovation"
    }
  ];

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    toast.success(isLiked ? "Removed from likes" : "Added to likes", "");
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks", "");
  };

  const validateCommentForm = () => {
    const formErrors: Record<string, string> = {};

    const nameError = validation.validateName(name, "Name");
    if (nameError) formErrors.name = nameError;

    const emailError = validation.validateEmail(email);
    if (emailError) formErrors.email = emailError;

    const commentError = validation.validateMessage(comment);
    if (commentError) formErrors.comment = commentError;

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCommentForm()) {
      return;
    }

    const newComment = {
      id: comments.length + 1,
      author: name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=150`,
      content: comment,
      timestamp: "Just now",
      likes: 0,
      role: "Reader"
    };

    setComments([newComment, ...comments]);
    setComment("");
    setName("");
    setEmail("");
    setErrors({});
    toast.success("Comment posted successfully!", "");
  };

  const handleFieldChange = (field: string, value: string) => {
    if (field === 'name') setName(value);
    if (field === 'email') setEmail(value);
    if (field === 'comment') setComment(value);

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this article: ${blogPost.title}`;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!", "");
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section - Consistent with other pages */}
      <section className="section-padding bg-gradient-to-br from-brand/5 via-background to-gradient-to/5 relative overflow-hidden">
        <div className="absolute inset-0 hero-pattern opacity-30" />
        <div className="container relative">
          <AnimatedSection className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-brand transition-colors mb-8 group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Blog
              </Link>

              <Badge
                variant="outline"
                className="mb-6 border-brand/30 bg-brand-50 dark:bg-brand-950 text-brand dark:text-white px-6 py-3 text-auto-sm font-medium"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {blogPost.category}
              </Badge>

              <h1 className="mb-6 text-auto-5xl font-bold tracking-tight font-display text-shimmer">
                {blogPost.title}
              </h1>

              <p className="text-auto-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
                {blogPost.subtitle}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12">
                {[
                  { icon: Calendar, label: "Published", value: new Date(blogPost.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  { icon: Clock, label: "Read Time", value: blogPost.readTime },
                  { icon: Eye, label: "Views", value: blogPost.views.toLocaleString() }
                ].map((stat, index) => (
                  <AnimatedSection key={index} delay={0.1 * index}>
                    <Card className="border-0 shadow-lg glass">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-gradient-brand rounded-xl flex items-center justify-center mx-auto mb-4">
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-auto-base font-bold text-brand mb-1">
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
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Article Content */}
      <section className="section-padding">
        <div className="container max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <AnimatedSection>
                <Card className="border-0 shadow-2xl glass">
                  <CardContent className="p-8 lg:p-12">
                    {/* Author Info */}
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border/40">
                      <img
                        src={blogPost.authorAvatar}
                        alt={blogPost.author}
                        className="w-16 h-16 rounded-full object-cover shadow-lg"
                        loading="lazy"
                      />
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{blogPost.author}</h3>
                        <p className="text-brand font-medium">{blogPost.authorRole}</p>
                        <p className="text-sm text-muted-foreground mt-1">{blogPost.authorBio}</p>
                      </div>
                    </div>

                    {/* Article Content */}
                    <div className="prose prose-lg max-w-none">
                      {blogPost.content.split('\n\n').map((paragraph, index) => (
                        <motion.p
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className="text-foreground leading-relaxed mb-6 text-lg"
                        >
                          {paragraph.trim()}
                        </motion.p>
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="mt-12 pt-8 border-t border-border/40">
                      <div className="flex items-center gap-3 mb-4">
                        <Tag className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium text-foreground">Tags:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {blogPost.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="px-3 py-1 hover:bg-brand/10 hover:text-brand transition-colors cursor-pointer">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Social Actions */}
                    <div className="mt-8 pt-8 border-t border-border/40">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <Button
                            variant={isLiked ? "default" : "outline"}
                            onClick={handleLike}
                            className="flex items-center gap-2"
                          >
                            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                            {likeCount}
                          </Button>
                          <Button
                            variant={isBookmarked ? "default" : "outline"}
                            onClick={handleBookmark}
                            className="flex items-center gap-2"
                          >
                            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                            Save
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground mr-2">Share:</span>
                          <Button variant="ghost" size="sm" onClick={() => handleShare('twitter')}>
                            <Twitter className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleShare('facebook')}>
                            <Facebook className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleShare('linkedin')}>
                            <Linkedin className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleShare('copy')}>
                            <LinkIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>

              {/* Comments Section */}
              <AnimatedSection delay={0.2}>
                <Card className="mt-12 border-0 shadow-2xl glass">
                  <CardContent className="p-8 lg:p-12">
                    <div className="flex items-center gap-3 mb-8">
                      <MessageSquare className="h-6 w-6 text-brand" />
                      <h3 className="text-2xl font-bold font-display">Comments ({comments.length})</h3>
                    </div>

                    {/* Comment Form */}
                    <form onSubmit={handleCommentSubmit} className="mb-12 p-6 bg-muted/20 rounded-xl border border-border/40">
                      <h4 className="text-lg font-semibold mb-6">Join the Discussion</h4>
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <UnifiedInput
                          label="Your Name"
                          value={name}
                          onChange={(value) => handleFieldChange('name', value)}
                          icon={User}
                          placeholder="Enter your name"
                          required
                          error={errors.name}
                        />
                        <UnifiedInput
                          label="Email Address"
                          type="email"
                          value={email}
                          onChange={(value) => handleFieldChange('email', value)}
                          icon={MessageSquare}
                          placeholder="your.email@example.com"
                          required
                          error={errors.email}
                        />
                      </div>
                      <UnifiedTextarea
                        label="Your Comment"
                        value={comment}
                        onChange={(value) => handleFieldChange('comment', value)}
                        placeholder="Share your thoughts on this article..."
                        rows={4}
                        required
                        error={errors.comment}
                      />
                      <ActionButton type="submit" icon={Send} className="mt-6">
                        Post Comment
                      </ActionButton>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-8">
                      {comments.map((comment, index) => (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="flex gap-4 p-6 bg-background/50 rounded-xl border border-border/30"
                        >
                          <img
                            src={comment.avatar}
                            alt={comment.author}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                            loading="lazy"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h5 className="font-semibold text-foreground">{comment.author}</h5>
                              <Badge variant="secondary" className="text-xs">
                                {comment.role}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{comment.timestamp}</span>
                            </div>
                            <p className="text-foreground leading-relaxed mb-3">
                              {comment.content}
                            </p>
                            <div className="flex items-center gap-4">
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-brand">
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                {comment.likes}
                              </Button>
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-brand">
                                Reply
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                {/* Article Stats */}
                <AnimatedSection delay={0.3}>
                  <Card className="border-0 shadow-xl glass">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-brand" />
                        Article Stats
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            Views
                          </div>
                          <span className="font-semibold">{blogPost.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Heart className="h-4 w-4" />
                            Likes
                          </div>
                          <span className="font-semibold">{likeCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MessageSquare className="h-4 w-4" />
                            Comments
                          </div>
                          <span className="font-semibold">{comments.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Share2 className="h-4 w-4" />
                            Shares
                          </div>
                          <span className="font-semibold">{blogPost.shareCount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>

                {/* Related Articles */}
                <AnimatedSection delay={0.4}>
                  <Card className="border-0 shadow-xl glass">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-brand" />
                        Related Articles
                      </h4>
                      <div className="space-y-6">
                        {relatedPosts.map((post) => (
                          <Link
                            key={post.id}
                            to={`/blog/${post.id}`}
                            className="block group"
                          >
                            <div className="relative overflow-hidden rounded-xl mb-3">
                              <img
                                src={post.image}
                                alt={post.title}
                                className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <Badge className="absolute bottom-2 left-2 bg-brand/90 text-white text-xs">
                                {post.category}
                              </Badge>
                            </div>
                            <h5 className="font-semibold text-sm leading-tight mb-2 group-hover:text-brand transition-colors">
                              {post.title}
                            </h5>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{post.readTime}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
