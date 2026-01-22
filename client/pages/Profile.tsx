import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  Shield, 
  MapPin, 
  Mail, 
  Phone,
  Calendar,
  Edit3,
  Key,
  Camera,
  Save,
  X,
  Loader2
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import UpdateProfileForm from "@/components/UpdateProfileForm";
import UpdatePasswordForm from "@/components/UpdatePasswordForm";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const { user, loading, error, refetch } = useLoggedInUser();

  // Format user data for display
  const userData = user ? {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    email: user.email,
    mobileNumber: user.mobileNumber,
    bio: user.bio,
    gender: user.gender,
    profilePicture: user.profilePicture,
    isActive: user.isActive,
    role: user.role,
    joiningDate: user.joiningDate,
    joinDate: new Date(user.joiningDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    })
  } : null;

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Security", icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      <Header />
      
      <main className="container py-12">
        <AnimatedSection>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-foreground mb-4"
              >
                My Profile
              </motion.h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Manage your account settings, update your profile information, and configure your preferences.
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-12"
              >
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
                <span className="ml-2 text-muted-foreground">Loading profile...</span>
              </motion.div>
            )}

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-destructive">
                      <X className="h-5 w-5" />
                      <span>Failed to load profile: {error}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Profile Content */}
            {userData && !loading && (
              <>
                {/* Profile Overview Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-8"
                >
                  <Card className="bg-gradient-to-r from-brand/5 via-brand/10 to-brand/5 border-brand/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        {/* Profile Picture */}
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand/20 to-brand/40 flex items-center justify-center">
                            {userData.profilePicture ? (
                              <img 
                                src={userData.profilePicture} 
                                alt="Profile" 
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-8 w-8 text-brand" />
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="outline"
                            className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-background border-2"
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                          <h2 className="text-xl font-semibold text-foreground mb-1">
                            {userData.firstName} {userData.lastName}
                          </h2>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {userData.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {userData.mobileNumber}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              Joined {userData.joinDate}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              {user?.isActive ? 'Active Member' : 'Inactive'}
                            </Badge>
                            {user?.role && (
                              <Badge variant="outline" className="text-xs">
                                {user.role}
                              </Badge>
                            )}
                            {userData.gender && (
                              <Badge variant="outline" className="text-xs">
                                {userData.gender === 'PREFER_NOT_TO_SAY' ? 'Gender: Private' : `Gender: ${userData.gender.charAt(0) + userData.gender.slice(1).toLowerCase()}`}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveTab("profile");
                              setIsEditing(true);
                            }}
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Tab Navigation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id as any);
                            setIsEditing(false);
                          }}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                            activeTab === tab.id
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Tab Content */}
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {activeTab === "profile" && (
                    <UpdateProfileForm 
                      userData={userData}
                      isEditing={isEditing}
                      onEditToggle={setIsEditing}
                      onProfileUpdate={refetch}
                    />
                  )}
                  
                  {activeTab === "password" && (
                    <UpdatePasswordForm />
                  )}
                </motion.div>
              </>
            )}
          </div>
        </AnimatedSection>
      </main>

      <Footer />
    </div>
  );
}