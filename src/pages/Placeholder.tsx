import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface PlaceholderProps {
  title: string;
  description: string;
  feature?: string;
}

export default function Placeholder({
  title,
  description,
  feature,
}: PlaceholderProps) {
  const router = useRouter();

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full border-2 border-dashed">
          <CardHeader>
            <CardTitle className="text-center text-2xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">{description}</p>
            {feature && (
              <div className="bg-muted p-3 rounded-lg text-sm">
                <p className="font-semibold mb-2">Coming feature:</p>
                <p className="text-muted-foreground">{feature}</p>
              </div>
            )}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
