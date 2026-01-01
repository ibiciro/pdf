import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { signUpAction } from "@/app/actions";
import Navbar from "@/components/navbar";
import { UrlProvider } from "@/components/url-provider";
import { BookOpen, PenTool, BookMarked } from "lucide-react";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center p-4 sm:max-w-md">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-[128px] opacity-10" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-violet-500 rounded-full filter blur-[128px] opacity-10" />
      </div>
      
      <Navbar />
      
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 pt-24">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </Link>
          </div>
          
          <UrlProvider>
            <form className="flex flex-col space-y-6">
              <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold text-gray-900 font-display">Create Account</h1>
                <p className="text-sm text-gray-500">
                  Already have an account?{" "}
                  <Link
                    className="text-blue-600 font-medium hover:text-blue-700 transition-all"
                    href="/sign-in"
                  >
                    Sign in
                  </Link>
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="John Doe"
                    required
                    className="w-full border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

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
                    className="w-full border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Your password"
                    minLength={6}
                    required
                    className="w-full border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                {/* Account Type Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    I want to
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="account_type"
                        value="reader"
                        defaultChecked
                        className="peer sr-only"
                      />
                      <div className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 bg-gray-50 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all">
                        <BookMarked className="w-6 h-6 text-gray-500 peer-checked:text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Read Content</span>
                      </div>
                    </label>
                    <label className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="account_type"
                        value="creator"
                        className="peer sr-only"
                      />
                      <div className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 bg-gray-50 peer-checked:border-violet-500 peer-checked:bg-violet-50 transition-all">
                        <PenTool className="w-6 h-6 text-gray-500 peer-checked:text-violet-600" />
                        <span className="text-sm font-medium text-gray-700">Create Content</span>
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    You can change this later in your settings
                  </p>
                </div>
              </div>

              <SubmitButton
                formAction={signUpAction}
                pendingText="Creating account..."
                className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 py-3 rounded-xl text-white font-semibold shadow-lg transition-all"
              >
                Create Account
              </SubmitButton>

              <FormMessage message={searchParams} />
            </form>
          </UrlProvider>
        </div>
        <SmtpMessage />
      </div>
    </div>
  );
}
