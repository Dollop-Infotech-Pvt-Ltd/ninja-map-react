import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MapPin,
  Building,
  Crown,
  Award,
  ArrowRight,
  Heart,
} from "lucide-react";

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

export default function Footer() {
  return (
    <footer
      className="glass-strong section-padding"
    
    >
      <div className="container">
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="sm:col-span-2 col-span-1">
            <AnimatedSection>
              <div className="mb-6 flex items-center gap-3">
                                         <Link
                  to="/"
                  className="flex items-center overflow-visible transition-opacity hover:opacity-80"
                  aria-label="NINja Map"
                >
                  <img
                    src="/logo/logo2.png"
                    alt="NINja Map"
                    loading="lazy"
                    decoding="async"
                    className="h-12 w-auto md:h-16"
                  />
                </Link> 
       
              </div>
              <p className="mb-6 max-w-md text-sm text-muted-foreground leading-relaxed">
                Nigeria's premier AI-powered navigation platform. Experience
                the future of mapping technology designed exclusively for
                Nigerian roads, culture, and communities.
              </p>
              <div className="text-sm text-muted-foreground space-y-2">
                {/* <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-[#036A38]" />
                  <span>
                    Developed by{" "}
                    <span className="font-medium text-[#036A38]">
                      Dollop Infotech Pvt. Ltd.
                    </span>
                  </span>
                </div> */}
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-[#036A38]" />
                  <span>Proudly serving Nigeria since 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Crown className="h-4 w-4 text-[#036A38]" />
                  <span>Trusted by 2.5M+ Nigerian drivers</span>
                </div>
              </div>
            </AnimatedSection>
          </div>

          <div className="col-span-1">
            <AnimatedSection delay={0.1}>
              <h3 className="mb-4 font-bold text-base font-display">
                Support & Resources
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                {[
                  { text: "All Features", href: "/features" },
                  { text: "24/7 Help Center", href: "/faqs" },
                  { text: "Contact Support", href: "/contact" },
                  { text: "Privacy Policy", href: "/privacy" },
                  { text: "Terms of Service", href: "/terms" },
                  { text: "Community Guidelines", href: "/community-guidelines" },
                  { text: "Status Page", href: "/status" },
                ].map((item, index) => (
                  <motion.div
                    key={item.text}
                    className="hover:text-[#036A38] transition-colors cursor-pointer group flex items-center space-x-2 -ms-4"
                    whileHover={{ x: 3 }}
                  >
                    <ArrowRight className="h-3 w-3 text-[#036A38] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Link to={item.href} className="hover:text-[#036A38] transition-colors">
                      {item.text}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>
          </div>

          <div className="col-span-1">
            <AnimatedSection delay={0.2}>
              <h3 className="mb-4 font-bold text-base font-display">
                Company
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                {[
                  { text: "About Us", href: "/about" },
                  { text: "Customer Stories", href: "/testimonials" },
                  { text: "Blog", href: "/blog" },
                  { text: "RSS Feed", href: "/rss" },
                  { text: "FAQs", href: "/faqs" },
                  { text: "Contact Us", href: "/contact" },
                  { text: "Delete Account", href: "/delete-account" },
                ].map((item, index) => (
                  <motion.div
                    key={item.text}
                    className="hover:text-[#036A38] transition-colors cursor-pointer group flex items-center space-x-2 -ms-4"
                    whileHover={{ x: 3 }}
                  >
                    <ArrowRight className="h-3 w-3 text-[#036A38] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Link to={item.href} className="hover:text-[#036A38] transition-colors">
                      {item.text}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>

        <AnimatedSection delay={0.3}>
          <div className="border-t border-border/40">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-1">
              <p className="text-sm text-muted-foreground">
                &copy; 2025 NINja Map. All rights
                reserved.
              </p>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <span>Crafted with</span>
                  <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                  <span>in Nigeria</span>
                  <span className="text-lg">🇳🇬</span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </footer>
  );
}
