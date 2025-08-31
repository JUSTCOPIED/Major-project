import { ExternalLink, Play, TestTube2, Shield, BarChart3 } from "lucide-react";
import { cn } from "../../lib/utils";
import Link from "next/link";

// Professional button variant utility for consistent styling
const getButtonVariants = (variant = "default") => {
  const base = "inline-flex items-center justify-center font-medium rounded-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:pointer-events-none transition";
  const variants = {
    default: "bg-primary text-primary-foreground shadow hover:opacity-90",
    outline: "border border-border hover:bg-accent/10",
    ghost: "hover:bg-accent/10",
    destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
  };
  return `${base} ${variants[variant]} h-9 px-4 text-sm`;
};

const EnhancedHero = () => {
  return (
    <section id="hero" className="relative overflow-hidden py-24 sm:py-28 lg:py-32 scroll-mt-24">
      <div className="absolute inset-x-0 top-0 flex h-full w-full items-center justify-center opacity-100">
        <img
          alt="background pattern"
          src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/square-alt-grid.svg"
          className="[mask-image:radial-gradient(75%_75%_at_center,white,transparent)] opacity-90"
        />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="rounded-xl bg-background/30 p-4 shadow-sm backdrop-blur-sm">
              <TestTube2 className="h-16 w-16 text-primary" />
            </div>
            <div>
              <h1 className="mb-6 text-2xl font-bold tracking-tight text-pretty lg:text-5xl">
                Professional Test Runner & Analytics Platform for{" "}
                <span className="text-primary">Modern Teams</span>
              </h1>
              <p className="mx-auto max-w-3xl text-muted-foreground lg:text-xl">
                Execute comprehensive test suites with detailed analytics, environment management, 
                and real-time reporting. Built for developers who demand reliability and insights.
              </p>
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <Link 
                href="/test"
                className="h-11 px-8 inline-flex items-center justify-center rounded-sm bg-primary text-primary-foreground font-semibold shadow hover:opacity-90 transition-shadow hover:shadow focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Start Testing
              </Link>
              <Link 
                href="/Home"
                className="h-11 px-8 inline-flex items-center justify-center rounded-sm border border-border hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-ring group"
              >
                View Dashboard{" "}
                <BarChart3 className="ml-2 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="mt-20 flex flex-col items-center gap-5">
              <p className="font-medium text-muted-foreground lg:text-left">
                Built with enterprise-grade technologies
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <div
                  className={cn(
                    getButtonVariants("outline"),
                    "group flex aspect-square h-12 items-center justify-center p-0",
                  )}
                >
                  <Shield className="h-6 text-muted-foreground transition-all group-hover:text-primary" />
                </div>
                <div
                  className={cn(
                    getButtonVariants("outline"),
                    "group flex aspect-square h-12 items-center justify-center p-0",
                  )}
                >
                  <img
                    src="https://cdn.simpleicons.org/javascript/F7DF1E"
                    alt="JavaScript"
                    className="h-6 saturate-0 transition-all group-hover:saturate-100"
                  />
                </div>
                <div
                  className={cn(
                    getButtonVariants("outline"),
                    "group flex aspect-square h-12 items-center justify-center p-0",
                  )}
                >
                  <img
                    src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/tailwind-icon.svg"
                    alt="Tailwind CSS"
                    className="h-6 saturate-0 transition-all group-hover:saturate-100"
                  />
                </div>
                <div
                  className={cn(
                    getButtonVariants("outline"),
                    "group flex aspect-square h-12 items-center justify-center p-0",
                  )}
                >
                  {/* Light mode: black icon; Dark mode: white icon */}
                  <img
                    src="https://cdn.simpleicons.org/nextdotjs/000000"
                    alt="Next.js"
                    className="h-6 dark:hidden"
                  />
                  <img
                    src="https://cdn.simpleicons.org/nextdotjs/ffffff"
                    alt=""
                    aria-hidden="true"
                    className="h-6 hidden dark:block"
                  />
                </div>
                <div
                  className={cn(
                    getButtonVariants("outline"),
                    "group flex aspect-square h-12 items-center justify-center p-0",
                  )}
                >
                  <img
                    src="https://cdn.simpleicons.org/firebase"
                    alt="Firebase"
                    className="h-6 saturate-0 transition-all group-hover:saturate-100"
                  />
                </div>
                <div
                  className={cn(
                    getButtonVariants("outline"),
                    "group flex aspect-square h-12 items-center justify-center p-0",
                  )}
                >
                  <img
                    src="https://cdn.simpleicons.org/docker"
                    alt="Docker"
                    className="h-6 saturate-0 transition-all group-hover:saturate-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { EnhancedHero };
