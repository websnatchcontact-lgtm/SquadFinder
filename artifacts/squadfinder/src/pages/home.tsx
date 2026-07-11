import { motion } from "framer-motion";
import { Link } from "wouter";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { Search, Users, Database, Sparkles, Shield, Compass, ArrowRight, Activity, Filter, Lock } from "lucide-react";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:32px]" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/20 blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute top-40 -left-40 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl opacity-50 pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              GLS University Capstone Teams
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance mb-6"
            >
              Stop stressing about <span className="text-gradient">capstone groups.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl text-balance mb-10"
            >
              SquadFinder gives you instant visibility into every team, available student, and open seat for the final year project.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <Button asChild size="lg" className="w-full sm:w-auto rounded-full px-8 h-14 text-base font-semibold group">
                <Link href={ROUTES.search}>
                  Find Your Status
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-8 h-14 text-base font-medium">
                <Link href={ROUTES.dashboard}>
                  <LayoutDashboardIcon className="w-5 h-5 mr-2 text-muted-foreground" />
                  View Dashboard
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need to form a team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A transparent, real-time look at the entire student cohort. No more asking around in chat groups.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard 
              icon={<Search className="w-6 h-6 text-blue-500" />}
              title="Instant Lookup"
              description="Type your enrollment number and instantly see your assigned group and all your teammates."
              delay={0.1}
            />
            <FeatureCard 
              icon={<Compass className="w-6 h-6 text-purple-500" />}
              title="Discover Talent"
              description="Browse students who are looking for a team. Filter by specialization to fill your skill gaps."
              delay={0.2}
            />
            <FeatureCard 
              icon={<Activity className="w-6 h-6 text-emerald-500" />}
              title="Live Statistics"
              description="See how many groups are full, how many seats remain, and branch distributions in real-time."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight mb-16 text-center">How to use SquadFinder</h2>
            
            <div className="space-y-12">
              <Step 
                number="01"
                title="Search your enrollment"
                description="Use the search bar to check your current status. The data is pre-loaded from the university roster."
                icon={<Lock className="w-5 h-5" />}
              />
              <Step 
                number="02"
                title="If you have a group..."
                description="You'll see your Group ID and all your assigned teammates in one clean view. Verify everything is correct."
                icon={<Users className="w-5 h-5" />}
              />
              <Step 
                number="03"
                title="If you need a group..."
                description="Register yourself as 'Looking for a Team'. Your profile will appear in the Available section for other groups to find you."
                icon={<Filter className="w-5 h-5" />}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold tracking-tight mb-6">Ready to find your squad?</h2>
          <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-10 text-balance">
            Stop worrying about the logistics and focus on building an amazing capstone project.
          </p>
          <Button asChild size="lg" variant="secondary" className="rounded-full px-8 h-14 text-base font-bold shadow-lg hover:shadow-xl transition-shadow">
            <Link href={ROUTES.search}>Get Started Now</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

function Step({ number, title, description, icon }: { number: string, title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="flex gap-6 md:gap-8">
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md z-10">
          {number}
        </div>
        <div className="w-px h-full bg-border -my-2"></div>
      </div>
      <div className="pt-2 pb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-muted text-foreground">
            {icon}
          </div>
          <h3 className="text-2xl font-bold">{title}</h3>
        </div>
        <p className="text-lg text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

// Simple icon for the button to avoid an extra import block
function LayoutDashboardIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}