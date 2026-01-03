import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { signUpAction } from "@/app/actions";
import Navbar from "@/components/navbar";
import { UrlProvider } from "@/components/url-provider";
import { BookOpen, CheckCircle, Zap, Shield, DollarSign } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex min-h-screen pt-16">
        {/* Left side - Benefits */}
        <div className="hidden lg:flex flex-1 bg-gray-900 p-12 flex-col justify-center">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold text-white mb-6">
              Start monetizing your content today
            </h2>
            <p className="text-gray-400 mb-10">
              Join thousands of creators who earn from their knowledge.
            </p>
            
            <div className="space-y-6">
              {[
                { icon: <DollarSign className="w-5 h-5" />, title: 'Instant Payouts', desc: 'Get paid immediately when readers access your content' },
                { icon: <Shield className="w-5 h-5" />, title: 'Protected Content', desc: 'Your content is secure from copying and piracy' },
                { icon: <Zap className="w-5 h-5" />, title: 'Easy Setup', desc: 'Upload and start earning in under 5 minutes' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">PayPerRead</span>
              </Link>
            </div>
            
            <UrlProvider>
              <form className="flex flex-col space-y-6">
                <div className="space-y-2 text-center">
                  <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
                  <p className="text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link
                      className="text-gray-900 font-medium hover:underline"
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
                      className="w-full"
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
                      className="w-full"
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
                      placeholder="Min. 6 characters"
                      minLength={6}
                      required
                      className="w-full"
                  />
                </div>
              </div>

                <SubmitButton
                  formAction={signUpAction}
                  pendingText="Creating account..."
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Create account
                </SubmitButton>

                <FormMessage message={searchParams} />
                
                <p className="text-xs text-gray-500 text-center">
                  By signing up, you agree to our{' '}
                  <Link href="/terms" className="underline">Terms</Link> and{' '}
                  <Link href="/privacy" className="underline">Privacy Policy</Link>
                </p>
              </form>
            </UrlProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
