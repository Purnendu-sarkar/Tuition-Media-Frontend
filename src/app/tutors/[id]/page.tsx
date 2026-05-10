"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Star, 
  ShieldCheck, 
  BookOpen, 
  Clock, 
  Mail, 
  Phone, 
  Calendar,
  ArrowLeft,
  Share2,
  CheckCircle2,
  BrainCircuit,
  MessageSquare,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

import { publicApi, PublicTutor } from "@/lib/api/public";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicNavbar } from "@/components/layouts/public-navbar";
import { PublicFooter } from "@/components/layouts/public-footer";

export default function TutorPublicProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [tutor, setTutor] = useState<(PublicTutor & { reviewsReceived: any[], createdAt: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTutor();
  }, [id]);

  const fetchTutor = async () => {
    try {
      setIsLoading(true);
      const res = await publicApi.getTutorById(id);
      setTutor(res as any);
    } catch (err: any) {
      setError(err.message || "Tutor not found");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-red-500">{error || "Tutor not found"}</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PublicNavbar />
      {/* Hero Header */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-primary/20 via-primary/10 to-background border-b border-border overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-primary rounded-full blur-3xl animate-pulse delay-700" />
        </div>
        
        <div className="container mx-auto px-4 h-full flex items-end pb-8">
          <Button 
            variant="ghost" 
            className="absolute top-28 md:top-32 left-4 md:left-8 bg-background/50 backdrop-blur-md hover:bg-background/80"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button 
            variant="ghost" 
            className="absolute top-28 md:top-32 right-4 md:right-8 bg-background/50 backdrop-blur-md hover:bg-background/80"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard!");
            }}
          >
            <Share2 className="h-4 w-4 mr-2" /> Share Profile
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Avatar & Info */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-8 text-center border-border bg-surface shadow-2xl rounded-3xl">
              <div className="relative inline-block mb-6">
                <div className="h-40 w-40 rounded-full border-4 border-background overflow-hidden shadow-xl mx-auto ring-4 ring-primary/20">
                  {tutor.image ? (
                    <img src={tutor.image} alt={tutor.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground/30">
                      <BookOpen className="h-16 w-16" />
                    </div>
                  )}
                </div>
                {tutor.isVerified && (
                  <div className="absolute bottom-2 right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg border-2 border-background">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                )}
              </div>

              <h1 className="text-3xl font-black mb-2 tracking-tight">{tutor.name}</h1>
              <p className="text-muted-foreground font-medium mb-4 flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4" /> {tutor.tutorProfile.location || "Remote / Online"}
              </p>

              {/* Smart Badges */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {(tutor as any).badges?.map((badge: any) => (
                  <Badge 
                    key={badge.id}
                    className={`
                      ${badge.color === 'blue' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''}
                      ${badge.color === 'gold' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : ''}
                      ${badge.color === 'purple' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : ''}
                      font-bold text-[10px] px-2 py-0.5 rounded-full border shadow-sm
                    `}
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="text-primary font-black text-xl">৳{tutor.tutorProfile.hourlyRate || "0"}</div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Hourly Rate</div>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="text-emerald-600 font-black text-xl">{tutor.averageRating}</div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Avg Rating</div>
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full h-12 rounded-xl shadow-lg shadow-primary/20 gap-2">
                  <MessageSquare className="h-4 w-4" /> Send Message
                </Button>
                <Button variant="outline" className="w-full h-12 rounded-xl gap-2">
                  <Calendar className="h-4 w-4" /> Schedule Lesson
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full h-12 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-2"
                  onClick={() => router.push(`/support/report?reportedId=${tutor.id}`)}
                >
                  <AlertTriangle className="h-4 w-4" /> Report User
                </Button>
              </div>
            </Card>

            <Card className="p-6 border-border bg-surface rounded-3xl space-y-6">
              <h3 className="font-bold text-lg border-b border-border pb-3">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-5 w-5 text-primary" />
                  <span className="text-sm">Email hidden for privacy</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="text-sm">Phone hidden for privacy</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm">Response time: &lt; 2 hours</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Bio Section */}
            <Card className="p-8 border-border bg-surface rounded-3xl">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary" /> About Me
              </h2>
              <div className="prose prose-zinc dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-muted-foreground italic">
                  "{tutor.tutorProfile.bio || "This tutor hasn't written a bio yet."}"
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-muted-foreground">Expert Subjects</h3>
                <div className="flex flex-wrap gap-2">
                  {tutor.tutorProfile.subjects.map((sub, i) => (
                    <Badge key={i} className="py-2 px-4 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold">
                      {sub}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>

            {/* AI Analysis / Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border-border bg-gradient-to-br from-primary/5 to-transparent rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <BrainCircuit className="h-24 w-24" />
                </div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                   <BrainCircuit className="h-5 w-5 text-primary" /> Platform Insights
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> High completion rate
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Positive student feedback
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Active since {new Date(tutor.createdAt).getFullYear()}
                  </li>
                </ul>
              </Card>

              <Card className="p-6 border-border bg-surface rounded-3xl">
                <h3 className="font-bold text-lg mb-4">Availability</h3>
                <div className="grid grid-cols-7 gap-1">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground">{day}</span>
                      <div className={`h-6 w-full rounded-md ${i < 5 ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-muted'}`} />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-4 text-center">Regularly available on weekdays after 4 PM</p>
              </Card>
            </div>

            {/* Reviews Section */}
            <Card className="p-8 border-border bg-surface rounded-3xl">
              <h2 className="text-2xl font-black mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" /> Student Reviews
                </div>
                <div className="text-sm font-bold text-muted-foreground">{tutor.totalReviews} Total</div>
              </h2>

              <div className="space-y-8">
                {tutor.reviewsReceived.length > 0 ? (
                  tutor.reviewsReceived.map((review, i) => (
                    <div key={i} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted overflow-hidden border border-border">
                            {review.reviewer.image ? (
                              <img src={review.reviewer.image} alt={review.reviewer.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                                {review.reviewer.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sm">{review.reviewer.name}</div>
                            <div className="text-[10px] text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star 
                              key={starIndex} 
                              className={`h-3 w-3 ${starIndex < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed italic">
                        "{review.comment || "Great tutor, highly recommended!"}"
                      </p>
                      {i < tutor.reviewsReceived.length - 1 && <div className="border-b border-border/50 pt-4" />}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-4 opacity-10" />
                    <p>No reviews yet. Be the first to review this tutor!</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
