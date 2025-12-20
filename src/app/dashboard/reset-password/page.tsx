import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import Navbar from "@/components/navbar";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default async function ResetPassword(props: {
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
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[128px] opacity-20" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-[128px] opacity-20" />
      </div>
      
      <Navbar />
      
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 pt-24">
        <div className="w-full max-w-md glass-strong rounded-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center glow-cyan">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </Link>
          </div>
          
          <form className="flex flex-col space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold text-white font-display">Reset Password</h1>
              <p className="text-sm text-gray-400">
                Please enter your new password below.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                  New password
                </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="New password"
                  required
                  className="w-full glass border-white/10 bg-white/5 text-white placeholder-gray-500 focus:border-cyan-400/50 focus:ring-cyan-400/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                  Confirm password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  required
                  className="w-full glass border-white/10 bg-white/5 text-white placeholder-gray-500 focus:border-cyan-400/50 focus:ring-cyan-400/20"
                />
              </div>
            </div>

            <SubmitButton
              formAction={resetPasswordAction}
              pendingText="Resetting password..."
              className="w-full btn-glow py-3 rounded-xl text-white font-semibold"
            >
              Reset password
            </SubmitButton>

            <FormMessage message={searchParams} />
          </form>
        </div>
      </div>
    </div>
  );
}
