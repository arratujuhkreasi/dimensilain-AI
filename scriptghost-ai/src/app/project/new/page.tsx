import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { Ghost } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  return (
    <main className="flex-1 flex flex-col py-12 px-4">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <Ghost className="h-5 w-5 text-blood" />
          <span className="font-semibold">ScriptGhost AI</span>
        </Link>
      </div>
      <OnboardingWizard />
    </main>
  );
}
