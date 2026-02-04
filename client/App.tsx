import { useState, useEffect } from "react";
import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import FAQs from "./pages/FAQs";
import Contact from "./pages/Contact";
import DeleteAccount from "./pages/DeleteAccount";
import About from "./pages/About";
import Testimonials from "./pages/Testimonials";
import Features from "./pages/Features";
import Status from "./pages/Status";
import CommunityGuidelines from "./pages/CommunityGuidelines";
import Map from "./pages/Map";
import Blog from "./pages/Blog";
import RSS from "./pages/RSS";
import BlogDetail from "./pages/BlogDetail";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MyContribution from "./pages/MyContribution";
import MyPlaces from "./pages/MyPlaces";
import AddPlace from "./pages/AddPlace";
import SavedPlaces from "./pages/SavedPlaces";
import LocationTest from "./pages/LocationTest";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            
            <Route path="/" element={<Index />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/delete-account" element={<DeleteAccount />} />
            <Route path="/about" element={<About />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/features" element={<Features />} />
            <Route path="/status" element={<Status />} />
            <Route path="/community-guidelines" element={<CommunityGuidelines />} />
            <Route path="/map" element={<Map />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/rss" element={<RSS />} />
            <Route path="/location-test" element={<LocationTest />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/my-contribution" element={<ProtectedRoute><MyContribution /></ProtectedRoute>} />
            <Route path="/my-places" element={<ProtectedRoute><MyPlaces /></ProtectedRoute>} />
            <Route path="/add-place" element={<ProtectedRoute><AddPlace /></ProtectedRoute>} />
            <Route path="/saved-places" element={<ProtectedRoute><SavedPlaces /></ProtectedRoute>} />
            <Route path="/saved-routes" element={<ProtectedRoute><SavedPlaces /></ProtectedRoute>} />
            <Route path="/dropped-pins" element={<ProtectedRoute><SavedPlaces /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
