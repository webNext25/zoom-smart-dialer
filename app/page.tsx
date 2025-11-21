import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Mic, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="#">
          <Phone className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold text-lg">Zoom Smart Dialer</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Sign In
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  AI Voice Agents for Zoom
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Seamlessly integrate AI voice assistants into your Zoom calls.
                  Bridge the gap between automated intelligence and human connection.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/login">
                  <Button size="lg" className="h-12 px-8">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="h-12 px-8">
                    Admin Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Mic className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Smart Audio Bridging</h2>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Route AI audio directly into Zoom meetings with zero latency.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Shield className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Admin Controls</h2>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Manage usage limits, voice permissions, and customer access.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Phone className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Dual Monitoring</h2>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Hear both the AI and the Zoom participants simultaneously.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 Zoom Smart Dialer. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
