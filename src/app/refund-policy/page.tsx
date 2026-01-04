import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Shield, Clock, CheckCircle, XCircle, AlertCircle,
  RefreshCw, Mail, Calendar, Sparkles, DollarSign
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const refundEligibility = [
  {
    icon: CheckCircle,
    title: "7-Day Money-Back Guarantee",
    description: "Try any paid plan risk-free. Cancel within 7 days for a full refund, no questions asked."
  },
  {
    icon: Clock,
    title: "Pro-Rated Annual Refunds",
    description: "For yearly plans canceled after 7 days, receive a refund for the unused months."
  },
  {
    icon: Shield,
    title: "Service Downtime Credits",
    description: "If we fail to meet our 99.9% uptime guarantee, you're eligible for service credits."
  }
];

const notEligible = [
  "Free plan users (no payment, no refund applicable)",
  "Monthly subscriptions canceled after the 7-day guarantee period",
  "Partial month refunds for monthly plans",
  "Add-on purchases (extra storage, extra mailboxes) bought separately",
  "Domain registrations or third-party service fees",
  "Accounts terminated for violating our Terms of Service",
  "Refunds requested more than 60 days after the billing date"
];

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/10">
      <Header />
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden py-16 bg-white">
        <div className="max-w-5xl mx-auto text-center mb-2 relative">
          <Sparkles className="absolute top-0 md:right-1/4 right-12 w-8 h-8 text-gray-800" />
          <Sparkles className="absolute top-10 md:left-1/4 left-12 w-6 h-6 text-gray-800" />
          
          <div className="max-w-6xl mx-auto mb-5 px-5 md:px-10">
            <div className="flex items-center justify-center mb-8">
              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                <Image src="/k-leaf-icon.png" width={20} height={20} alt="k-leaf-icon"/>
              </div>
              <span className="text-primary font-semibold text-sm tracking-wider uppercase bg-primary/10 px-4 py-2 rounded-full">
                Refund Policy
              </span>
            </div>
          
            <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">
              <span className="text-gray-900">Fair and </span>
              <span className="text-primary">transparent</span>
              <span className="text-gray-900"> refunds</span>
            </h1>
            <p className='text-gray-500 max-w-3xl mx-auto text-lg'>
              We want you to love Kerabie. If we&apos;re not the right fit for your business, 
              we&apos;ll make the refund process simple and straightforward.
            </p>
          </div>
        </div>
      </section>

      {/* Last Updated */}
      <section className="py-8 border-t border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Last Updated: December 31, 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Effective Date: January 1, 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-6 mb-12">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Our Commitment
              </h2>
              <p className="text-muted-foreground">
                At Kerabie, we stand behind our email service. We offer a fair refund policy 
                because we believe you should only pay for services that deliver value. If you&apos;re 
                not satisfied with our Pro or Premium plans, we want to make things right.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Refund Eligibility */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">When You Can Get a Refund</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              We&apos;ve designed our refund policy to be fair and flexible for different situations.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {refundEligibility.map((item, index) => (
                <div key={index} className="bg-card border rounded-2xl p-6 text-center">
                  <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Policy */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* 7-Day Money Back */}
            <div>
              <h2 className="text-2xl font-bold mb-4">7-Day Money-Back Guarantee</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground mb-4">
                  We offer a full refund if you cancel your Pro or Premium plan within 7 days of your 
                  initial purchase. This applies to both monthly and annual subscriptions.
                </p>
                <div className="bg-card border rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-3">How it works:</h3>
                  <ol className="space-y-2 text-muted-foreground ml-5 list-decimal">
                    <li>Cancel your subscription within 7 days of your first payment</li>
                    <li>Email our support team at <a href="mailto:refunds@kerabie.com" className="text-primary hover:underline font-medium">refunds@kerabie.com</a> with your account email</li>
                    <li>Receive your full refund within 5-7 business days to your original payment method</li>
                  </ol>
                  <p className="text-sm text-muted-foreground mt-4 italic">
                    Note: This guarantee only applies to your first subscription. Resubscribing after cancellation is not eligible.
                  </p>
                </div>
              </div>
            </div>

            {/* Annual Plans */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Annual Plan Refunds</h2>
              <p className="text-muted-foreground mb-4">
                For annual subscriptions canceled after the 7-day guarantee period, we offer pro-rated 
                refunds based on complete unused months remaining in your subscription.
              </p>
              <div className="bg-card border rounded-xl p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Pro Plan Example:</h3>
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Annual Pro plan: <span className="font-semibold text-foreground">$28.80/year</span> ($0.24/mailbox/month × 12 months)
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      If you cancel after 4 months with 8 months remaining:
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      Refund: $19.20 (8 months × $2.40 per month)
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Premium Plan Example:</h3>
                  <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Annual Premium plan: <span className="font-semibold text-foreground">$19.80/year</span> ($1.65/mailbox/month × 12 months)
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      If you cancel after 6 months with 6 months remaining:
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      Refund: $9.90 (6 months × $1.65 per month)
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground italic pt-2 border-t">
                  Refunds are calculated per complete month. Partial months are not refundable.
                </p>
              </div>
            </div>

            {/* Monthly Plans */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Monthly Plan Cancellations</h2>
              <p className="text-muted-foreground mb-4">
                Monthly subscriptions can be canceled at any time. You&apos;ll retain full access to Kerabie 
                until the end of your current billing period, but no refund will be issued for the current 
                month beyond the 7-day guarantee.
              </p>
              <div className="bg-card border rounded-xl p-6 space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Pro Monthly: $2/mailbox/month</h3>
                    <p className="text-sm text-muted-foreground">
                      Cancel anytime. Continue using until your billing date. No mid-month refunds after 7 days.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Premium Monthly: $5/mailbox/month</h3>
                    <p className="text-sm text-muted-foreground">
                      Cancel anytime. Continue using until your billing date. No mid-month refunds after 7 days.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mt-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      Important for Monthly Subscribers
                    </h3>
                    <p className="text-sm text-amber-800 ">
                      To avoid being charged for the next billing cycle, cancel at least 24 hours before 
                      your renewal date. Your subscription will remain active until the current period ends.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Add-ons */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Add-on Purchases</h2>
              <p className="text-muted-foreground mb-4">
                Add-ons (extra storage at $1/10GB or extra mailboxes at $1.50 each) follow the same refund 
                policy as your base plan but are calculated separately.
              </p>
              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3">Add-on Refund Rules:</h3>
                <ul className="space-y-2 text-muted-foreground ml-5 list-disc">
                  <li>7-day money-back guarantee applies to new add-on purchases</li>
                  <li>For annual add-ons, pro-rated refunds available based on unused months</li>
                  <li>Monthly add-ons follow the same rules as monthly plan subscriptions</li>
                  <li>Add-ons purchased mid-cycle are pro-rated from purchase date</li>
                </ul>
              </div>
            </div>

            {/* Service Credits */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Service Credits for Downtime</h2>
              <p className="text-muted-foreground mb-4">
                We guarantee 99.9% uptime for all paid plans. If we fail to meet this commitment, 
                you&apos;re entitled to service credits based on the duration of the outage.
              </p>
              <div className="bg-card border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-semibold">Monthly Uptime</th>
                      <th className="text-left p-4 font-semibold">Service Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-4 text-muted-foreground">Less than 99.9% but ≥ 99.0%</td>
                      <td className="p-4 font-medium">10% of monthly fee</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-muted-foreground">Less than 99.0% but ≥ 95.0%</td>
                      <td className="p-4 font-medium">25% of monthly fee</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-muted-foreground">Less than 95.0%</td>
                      <td className="p-4 font-medium">50% of monthly fee</td>
                    </tr>
                  </tbody>
                </table>
                <div className="p-4 bg-muted/50 border-t">
                  <p className="text-sm text-muted-foreground">
                    Service credits are automatically applied to your next billing cycle. They cannot be 
                    redeemed for cash. Scheduled maintenance and outages beyond our control are excluded.
                  </p>
                </div>
              </div>
            </div>

            {/* Free Plan */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Free Plan Policy</h2>
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900  mb-2">
                      No Refunds for Free Plan
                    </h3>
                    <p className="text-sm text-blue-800 ">
                      Since the Free plan has no cost, no refunds are applicable. You can cancel your 
                      Free account at any time without any charges or obligations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Not Eligible */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <XCircle className="h-6 w-6 text-muted-foreground" />
                What&apos;s Not Eligible for Refund
              </h2>
              <p className="text-muted-foreground mb-4">
                The following situations are not eligible for refunds:
              </p>
              <div className="bg-card border rounded-xl p-6">
                <ul className="space-y-3">
                  {notEligible.map((item, index) => (
                    <li key={index} className="flex gap-3 text-muted-foreground">
                      <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* How to Request */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <RefreshCw className="h-6 w-6 text-primary" />
                How to Request a Refund
              </h2>
              <div className="bg-linear-to-br from-primary/5 to-blue-500/5 border rounded-2xl p-8">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Contact Our Refund Team</h3>
                      <p className="text-sm text-muted-foreground">
                        Email us at <a href="mailto:refunds@kerabie.com" className="text-primary hover:underline font-medium">refunds@kerabie.com</a> with 
                        your account email, plan type, and reason for the refund request.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Review & Approval</h3>
                      <p className="text-sm text-muted-foreground">
                        Our team will review your request within 1-2 business days and confirm eligibility 
                        based on this refund policy.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Receive Your Refund</h3>
                      <p className="text-sm text-muted-foreground">
                        Approved refunds are processed within 5-7 business days to your original payment 
                        method (credit card, PayPal, etc.).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-card border rounded-xl p-6">
                <h3 className="font-semibold mb-3">Information to Include in Your Request:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground ml-5 list-disc">
                  <li>Your account email address</li>
                  <li>Current plan (Pro or Premium)</li>
                  <li>Billing frequency (Monthly or Annual)</li>
                  <li>Date of purchase or last billing date</li>
                  <li>Brief reason for refund (optional but helpful)</li>
                </ul>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-card border rounded-2xl p-8 text-center">
              <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Questions About Refunds?</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Our support team is here to help. Reach out if you have questions about our refund policy 
                or need assistance with a refund request.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="mailto:refunds@kerabie.com">
                    Email Refunds Team
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">
                    Contact Support
                  </Link>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Policy Changes */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-3">Changes to This Policy</h2>
            <p className="text-muted-foreground text-sm mb-4">
              We may update this refund policy from time to time to reflect changes in our services or 
              business practices. When we make significant changes, we&apos;ll update the &quot;Last Updated&quot; date 
              at the top of this page and notify active subscribers via email at least 30 days before 
              the changes take effect.
            </p>
            <p className="text-muted-foreground text-sm">
              Your continued use of Kerabie after changes to this policy constitutes acceptance of the 
              updated terms. If you don&apos;t agree with the changes, you may cancel your subscription and 
              request a pro-rated refund within 30 days of the notification.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RefundPolicy;