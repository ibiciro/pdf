import { ArrowUpRight, InfoIcon } from "lucide-react";
import Link from "next/link";

export function SmtpMessage() {
  return (
    <div className="glass px-5 py-3 mt-[2rem] rounded-xl flex gap-4 max-w-md">
      <InfoIcon size={16} className="mt-0.5 text-cyan-400 flex-shrink-0" />
      <div className="flex flex-col gap-1">
        <small className="text-sm text-gray-400">
          <strong className="text-gray-300"> Note:</strong> Emails are rate limited. Enable Custom SMTP to
          increase the rate limit.
        </small>
        <div>
          <Link
            href="https://supabase.com/docs/guides/auth/auth-smtp"
            target="_blank"
            className="text-cyan-400/70 hover:text-cyan-400 flex items-center text-sm gap-1 transition-colors"
          >
            Learn more <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
