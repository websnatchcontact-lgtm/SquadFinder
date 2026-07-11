import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">About SquadFinder</h1>
        </div>
        
        <div className="prose prose-lg dark:prose-invert prose-headings:font-bold max-w-none">
          <p className="text-xl text-muted-foreground mb-8 text-balance">
            SquadFinder is a purpose-built tool designed exclusively for GLS University students to simplify the stressful process of forming capstone project teams.
          </p>

          <div className="bg-card border rounded-2xl p-8 mb-12 shadow-sm">
            <h3 className="mt-0 text-2xl">The Problem</h3>
            <p>
              Every year, final-year students spend weeks trying to find teammates, verify who is in what group, and figure out which groups still have open seats. The process usually involves chaotic WhatsApp groups, outdated spreadsheets, and endless confusion.
            </p>
            
            <h3 className="text-2xl">The Solution</h3>
            <p>
              SquadFinder aggregates the student roster into a clean, searchable dashboard. It provides instant visibility into:
            </p>
            <ul>
              <li>Which students are already assigned to a group</li>
              <li>Which groups have open seats remaining</li>
              <li>Which students are actively looking for a team</li>
              <li>The specialization mix of every group</li>
            </ul>
          </div>

          <h2>Privacy & Data</h2>
          <p>
            This application uses a static, pre-loaded dataset of student enrollment numbers. No sensitive personal information (phone numbers, emails, grades) is stored or displayed. The "Looking for a Group" feature is stored locally on your device to demonstrate functionality without requiring a backend database.
          </p>

          <h2>Technical Details</h2>
          <p>
            SquadFinder is a modern Single Page Application (SPA) built with React, Vite, Tailwind CSS, and Framer Motion. It demonstrates premium frontend design patterns including responsive layouts, accessible components, and optimistic UI updates.
          </p>

          <div className="mt-12 pt-8 border-t flex gap-4">
            <Button asChild size="lg" className="rounded-full">
              <Link href={ROUTES.search}>Go to Search</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link href={ROUTES.dashboard}>View Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}