"use client";

import { useRouter } from "next/navigation";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-soft/10 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-lg text-center space-y-10 animate-in fade-in zoom-in duration-700">
        {/* Icon with Animation */}
        <div className="flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/30 rounded-[2.5rem] blur-3xl group-hover:bg-primary/40 transition-colors duration-500" />
            <div className="relative h-40 w-40 bg-surface border border-border/50 rounded-[2.5rem] flex items-center justify-center shadow-2xl glass transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
              <FileQuestion className="h-20 w-20 text-primary animate-float" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-2">
            Error 404
          </div>
          <h1 className="text-5xl font-[var(--font-space-grotesk)] font-bold text-foreground">
            Lost in <span className="gradient-text">Translation?</span>
          </h1>
          <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
            The page you're searching for seems to have vanished into the digital void. 
            Don't worry, we'll help you find your way back.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => router.back()}
            className="w-full sm:w-auto gap-2 px-8 rounded-2xl border-2 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          
          <Button 
            href="/"
            size="lg" 
            className="w-full sm:w-auto gap-2 px-8 rounded-2xl shadow-xl shadow-primary/20"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Support Section */}
        <div className="pt-10">
          <p className="text-sm text-muted-foreground/60 mb-4 italic">
            "Searching is half the fun: finding is the other half."
          </p>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-border to-transparent mx-auto" />
        </div>
      </div>
    </div>
  );
}
