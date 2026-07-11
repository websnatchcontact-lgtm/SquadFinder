import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";
import { ROUTES } from "@/constants";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-8">
          <Compass className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">404 - Page Not Found</h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href={ROUTES.home}>Return Home</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8">
            <Link href={ROUTES.search}>Search Students</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}