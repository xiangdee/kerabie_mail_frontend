import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <h1 className="mb-8 text-4xl font-bold text-foreground">Privacy Policy</h1>

          <div className="space-y-8 text-muted-foreground">
            <div>
              <p className="mb-4 text-lg">
                Your privacy matters. This policy explains how Kerabie collects, stores, and uses
                your information.
              </p>
              <p className="text-sm">Last updated: January 2025</p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                What Data We Collect
              </h2>
              <p className="mb-4">
                We collect information necessary to provide and improve our email services,
                including:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Account information (name, email address, company details)</li>
                <li>Email content and metadata (for delivery and storage)</li>
                <li>Usage data (login times, feature usage, device information)</li>
                <li>Payment information (processed securely through third-party providers)</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-semibold text-foreground">How We Use Your Data</h2>
              <p className="mb-4">Your data is used to:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Provide, maintain, and improve our email services</li>
                <li>Process and deliver your emails reliably</li>
                <li>Communicate important service updates and changes</li>
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Detect and prevent fraud and abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                How We Protect Your Data
              </h2>
              <p className="mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>End-to-end encryption for email transmission</li>
                <li>Encrypted data storage at rest</li>
                <li>Regular security audits and updates</li>
                <li>Strict access controls and authentication</li>
                <li>Secure data centers with physical protection</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-semibold text-foreground">Data Retention</h2>
              <p>
                We retain your data for as long as your account is active or as needed to provide
                services. You can request deletion of your data at any time by contacting our
                support team. Some data may be retained for legal compliance purposes.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-semibold text-foreground">Your Rights (GDPR)</h2>
              <p className="mb-4">Under GDPR, you have the right to:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Request data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                Third-Party Services
              </h2>
              <p>
                We may use trusted third-party services for payment processing, analytics, and
                infrastructure. These providers are contractually obligated to protect your data and
                use it only for the specified purposes.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                Changes to This Policy
              </h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of
                significant changes via email or through our service. Continued use of Kerabie after
                changes constitutes acceptance of the updated policy.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-semibold text-foreground">Contact Us</h2>
              <p className="mb-2">
                If you have questions about this privacy policy or your data, please contact us:
              </p>
              <ul className="ml-6 list-none space-y-1">
                <li>Email: privacy@kerabie.email</li>
                <li>Support: support@kerabie.email</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;
