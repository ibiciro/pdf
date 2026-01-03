import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import Navbar from "@/components/navbar";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";

interface LoginProps {
  searchParams: Promise<Message>;
}

export default async function SignInPage({ searchParams }: LoginProps) {
  const message = await searchParams;

  if ("message" in message) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center p-4 sm:max-w-md">
        <FormMessage message={message} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex min-h-screen pt-16">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-1 bg-gray-900 p-12 flex-col justify-center">
          <div className="max-w-md">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-8">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Welcome back
            </h2>
            <p className="text-gray-400 text-lg">
              Continue creating and earning from your premium content.
            </p>
            
            <div className="mt-16 p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold">
                  SC
                </div>
                <div>
                  <div className="font-semibold text-white">Sarah Chen</div>
                  <div className="text-sm text-gray-400">Finance Writer</div>
                </div>
              </div>
              <p className="text-gray-300 italic text-sm">
                "PayPerRead has transformed how I monetize my content. Highly recommended for any creator."
              </p>
            </div>
          </div>
        </div>
        
        {/* Right side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex justify-center mb-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">PayPerRead</span>
              </Link>
            </div>
            
            <form className="flex flex-col space-y-6">
              <div className="space-y-2 text-center lg:text-left">
                <h1 className="text-2xl font-bold text-gray-900">Sign in to your account</h1>
                <p className="text-sm text-gray-500">
                  Don't have an account?{" "}
                  <Link
                    className="text-gray-900 font-medium hover:underline"
                    href="/sign-up"
                  >
                    Create one
                  </Link>
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <Link
                      className="text-xs text-gray-500 hover:text-gray-900 transition-all"
                      href="/forgot-password"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Your password"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <SubmitButton
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                pendingText="Signing in..."
                formAction={signInAction}
              >
                Sign in
                <ArrowRight className="w-4 h-4" />
              </SubmitButton>

              <FormMessage message={message} />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
