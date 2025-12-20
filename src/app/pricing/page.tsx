import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Reader",
    description: "For readers who want to access premium content",
    price: "Free",
    priceDetail: "Pay per session",
    features: [
      "Access to all content",
      "Pay only for what you read",
      "Leave reviews and ratings",
      "Save favorites",
      "Reading history",
    ],
    cta: "Start Reading",
    href: "/browse",
    popular: false,
  },
  {
    name: "Creator",
    description: "For creators who want to monetize their content",
    price: "Free",
    priceDetail: "15% platform fee",
    features: [
      "Unlimited content uploads",
      "Set your own prices",
      "Custom session durations",
      "Analytics dashboard",
      "Direct payouts",
      "Content protection",
      "Reader insights",
    ],
    cta: "Start Creating",
    href: "/sign-up",
    popular: true,
  },
  {
    name: "Creator Pro",
    description: "For professional creators and publishers",
    price: "$29",
    priceDetail: "per month, 10% fee",
    features: [
      "Everything in Creator",
      "Lower platform fee (10%)",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
      "API access",
      "Team collaboration",
      "Bulk upload tools",
    ],
    cta: "Go Pro",
    href: "/sign-up",
    popular: false,
  },
];

const faqs = [
  {
    question: "How does the pricing work for readers?",
    answer: "Readers pay per session to access content. Each piece of content has its own price set by the creator, typically ranging from $1.99 to $9.99 for a timed reading session.",
  },
  {
    question: "What percentage does PayPerRead take?",
    answer: "For free Creator accounts, we take a 15% platform fee. Creator Pro accounts pay only 10%. This covers payment processing, hosting, and platform maintenance.",
  },
  {
    question: "How do payouts work?",
    answer: "Creators receive payouts weekly via Stripe. Once your earnings reach $50, you can request a payout. Funds typically arrive within 2-3 business days.",
  },
  {
    question: "Can I change my pricing anytime?",
    answer: "Yes! You can adjust your content pricing and session durations at any time. Changes take effect immediately for new purchases.",
  },
  {
    question: "Is there a limit to how much content I can upload?",
    answer: "No limits! Both free and Pro creators can upload unlimited content. We want you to share as much valuable content as possible.",
  },
  {
    question: "What happens when a reader's session expires?",
    answer: "When the timer runs out, the content becomes blurred. Readers can choose to purchase another session to continue reading or exit and leave a review.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-[128px] opacity-20" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[128px] opacity-20" />
        </div>
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-white font-display mb-6">
              Simple, Transparent{" "}
              <span className="gradient-text">Pricing</span>
            </h1>
            <p className="text-xl text-gray-400">
              No hidden fees. No surprises. Just fair pricing for creators and readers.
            </p>
          </div>
        </div>
      </section>
      
      {/* Pricing Cards */}
      <section className="py-12 relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? 'glass-strong border-2 border-cyan-400/50 glow-cyan'
                    : 'glass'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full text-sm font-semibold text-white">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold font-mono gradient-text">{plan.price}</span>
                    {plan.price !== "Free" && <span className="text-gray-400">/mo</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{plan.priceDetail}</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  href={plan.href}
                  className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    plan.popular
                      ? 'btn-glow text-white'
                      : 'glass text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white font-display mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400">Everything you need to know about PayPerRead pricing</p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent" />
        <div className="container mx-auto px-6 text-center relative">
          <h2 className="text-4xl font-bold text-white font-display mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of creators and readers on PayPerRead today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="btn-glow inline-flex items-center justify-center px-8 py-4 text-white rounded-xl text-lg font-semibold"
            >
              Create Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/browse"
              className="inline-flex items-center justify-center px-8 py-4 text-gray-300 glass rounded-xl hover:bg-white/10 transition-all text-lg font-medium"
            >
              Browse Content
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
