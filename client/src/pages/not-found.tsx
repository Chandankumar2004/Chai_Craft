import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 text-destructive font-bold text-xl items-center justify-center">
            <AlertCircle className="h-8 w-8" />
            <h1>404 Page Not Found</h1>
          </div>
          
          <p className="mt-4 text-center text-muted-foreground pb-6">
            The page you are looking for does not exist. It might have been moved or deleted.
          </p>

          <Link href="/">
            <Button className="w-full">Return Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
