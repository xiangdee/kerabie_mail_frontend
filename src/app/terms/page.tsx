import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  FileText, Shield, AlertCircle, Scale, Lock, Users, Ban, Zap, Calendar, Sparkles
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const TermsOfService = () => {
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
                Terms of Service
              </span>
            </div>
          
            <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">
              <span className="text-gray-900">Clear terms for </span>
              <span className="text-primary">better service</span>
            </h1>
            <p className='text-gray-500 max-w-3xl mx-auto text-lg'>
              These terms govern your use of Kerabie&apos;s email services. By using Kerabie, you agree to these terms.
            </p>
          </div>
        </div>
      </section>

      {/* Last Updated */}
      <section className="py-8 border-t border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Last Updated: December 31, 2025</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Effective Date: January 1, 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-16">

            {/* Introduction */}
            <div>
              <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold mb-2">Agreement to Terms</h2>
                <p className="text-muted-foreground">
                  By accessing or using Kerabie, you agree to be bound by these Terms of Service. If you do not agree, please discontinue use immediately.
                </p>
              </div>
            </div>

            {/* Account Terms */}
            <div>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                Account Terms
              </h2>
              
              <div className="space-y-6">
                <div className="bg-card border rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Registration & Responsibility</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="font-semibold text-foreground">•</span>
                      <span>You must provide accurate information during registration</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-foreground">•</span>
                      <span>You must be at least 18 years old</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-foreground">•</span>
                      <span>You are responsible for account security and all activities</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-foreground">•</span>
                      <span>One person may maintain only one Free account</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Acceptable Use */}
            <div>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                Acceptable Use Policy
              </h2>
              
              <div className="space-y-6">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                  <p className="font-semibold text-red-900  mb-4">You may not use our Services to:</p>
                  <ul className="space-y-3 text-red-800 ">
                    <li className="flex gap-3">
                      <Ban className="h-5 w-5 shrink-0 mt-0.5" />
                      <span>Send spam, unsolicited bulk email, or violate CAN-SPAM Act</span>
                    </li>
                    <li className="flex gap-3">
                      <Ban className="h-5 w-5 shrink-0 mt-0.5" />
                      <span>Distribute malware, viruses, or harmful code</span>
                    </li>
                    <li className="flex gap-3">
                      <Ban className="h-5 w-5 shrink-0 mt-0.5" />
                      <span>Engage in phishing, fraud, or impersonation</span>
                    </li>
                    <li className="flex gap-3">
                      <Ban className="h-5 w-5 shrink-0 mt-0.5" />
                      <span>Harass, threaten, or abuse others</span>
                    </li>
                    <li className="flex gap-3">
                      <Ban className="h-5 w-5 shrink-0 mt-0.5" />
                      <span>Violate intellectual property rights or share illegal content</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-card border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-4 font-semibold">Plan</th>
                        <th className="text-left p-4 font-semibold">Daily Sending Limit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="p-4 font-medium">Free</td>
                        <td className="p-4 text-muted-foreground">100 emails/day per mailbox</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium">Pro</td>
                        <td className="p-4 text-muted-foreground">1,000 emails/day per mailbox</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium">Premium</td>
                        <td className="p-4 text-muted-foreground">10,000 emails/day per mailbox</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Zap className="h-8 w-8 text-primary" />
                Payment Terms
              </h2>
              
              <div className="space-y-6">
                <div className="bg-card border rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Pricing & Billing</h3>
                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="font-semibold mb-1">Pro Plan</p>
                      <p className="text-sm text-muted-foreground">$2/mailbox/month or $28.80/year</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Premium Plan</p>
                      <p className="text-sm text-muted-foreground">$5/mailbox/month or $19.80/year</p>
                    </div>
                  </div>
                  <ul className="space-y-3 text-muted-foreground border-t pt-4">
                    <li className="flex gap-3">
                      <span className="font-semibold text-foreground">•</span>
                      <span>Subscriptions automatically renew unless canceled</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-foreground">•</span>
                      <span>All fees are non-refundable except as stated in our Refund Policy</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-foreground">•</span>
                      <span>We may change pricing with 30 days&apos; notice</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Privacy & Data */}
            <div>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Lock className="h-8 w-8 text-primary" />
                Privacy & Data Protection
              </h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                  <div className="flex gap-3">
                    <Lock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Your Data Rights</h4>
                      <p className="text-sm text-blue-800">
                        You retain all rights to your email content. We never sell your data. You can export or delete your data anytime.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Data Retention</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="font-semibold text-foreground">•</span>
                      <span>Active accounts: Data retained while account is active</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-foreground">•</span>
                      <span>Canceled accounts: 30-day grace period, then permanent deletion</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-foreground">•</span>
                      <span>Backups: Up to 90 days for disaster recovery</span>
                    </li>
                  </ul>
                </div>

                <p className="text-muted-foreground">
                  Kerabie complies with GDPR, CCPA, and is SOC 2 Type II certified. See our Privacy Policy for details.
                </p>
              </div>
            </div>

            {/* Service Level */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Service Level & Support</h2>
              
              <div className="space-y-6">
                <div className="bg-card border rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Uptime & Support</h3>
                  <p className="text-muted-foreground mb-4">We guarantee 99.9% uptime for paid plans. Service credits available for downtime violations.</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="font-medium">Free Plan</span>
                      <span className="text-sm text-muted-foreground">48h response</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="font-medium">Pro Plan</span>
                      <span className="text-sm text-muted-foreground">24h priority</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Premium Plan</span>
                      <span className="text-sm text-muted-foreground">12h dedicated</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Termination */}
            <div>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Scale className="h-8 w-8 text-primary" />
                Termination
              </h2>
              
              <div className="space-y-6">
                <p className="text-muted-foreground">You may cancel anytime. We may suspend or terminate accounts that violate these Terms.</p>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Upon termination:</h4>
                      <p className="text-sm text-amber-800 ">
                        You have 30 days to export your data. After this period, all data is permanently deleted.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimers */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Disclaimers & Limitations</h2>
              
              <div className="space-y-6">
                <div className="bg-card border-2 rounded-xl p-6">
                  <p className="text-muted-foreground text-sm mb-4">
                    THE SERVICES ARE PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES. WE ARE NOT LIABLE FOR INDIRECT DAMAGES, LOST PROFITS, OR DATA LOSS.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Total liability is limited to amounts paid in the preceding 12 months, or $100, whichever is greater.
                  </p>
                </div>
              </div>
            </div>

            {/* General */}
            <div>
              <h2 className="text-3xl font-bold mb-6">General Provisions</h2>
              
              <div className="space-y-4">
                <div className="bg-card border rounded-xl p-6">
                  <h3 className="font-semibold mb-3">Governing Law</h3>
                  <p className="text-muted-foreground text-sm">These Terms are governed by the laws of Delaware, USA, without regard to conflict of law provisions.</p>
                </div>

                <div className="bg-card border rounded-xl p-6">
                  <h3 className="font-semibold mb-3">Changes to Terms</h3>
                  <p className="text-muted-foreground text-sm">We may update these Terms with 30 days&apos; notice. Continued use after changes constitutes acceptance.</p>
                </div>

                <div className="bg-card border rounded-xl p-6">
                  <h3 className="font-semibold mb-3">Contact</h3>
                  <p className="text-muted-foreground text-sm">For questions about these Terms, contact us at <a href="mailto:legal@kerabie.com" className="text-primary hover:underline">legal@kerabie.com</a></p>
                </div>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="bg-linear-to-br from-primary/10 to-blue-500/10 border rounded-2xl p-8 text-center">
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Questions About These Terms?</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Our legal team is here to help clarify anything in our Terms of Service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="mailto:legal@kerabie.com">Contact Legal Team</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">General Support</Link>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsOfService;