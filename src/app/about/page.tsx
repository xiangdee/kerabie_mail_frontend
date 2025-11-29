import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Shield, Zap, Lock, Users } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h1 className="mb-6 text-4xl font-bold text-foreground md:text-5xl">
              Focused on delivering the best business email experience.
            </h1>
            <div className="mx-auto max-w-3xl space-y-6 text-lg text-muted-foreground">
              <p>
                Kerabie was founded on a simple idea: business email should be fast, reliable, and
                effortless. We build tools that help teams communicate clearly, stay organized, and
                maintain trust with every message they send.
              </p>
              <p>
                Our platform is engineered for security, performance, and scale—ensuring that every
                user, from freelancers to enterprises, gets an email solution they can depend on.
              </p>
            </div>
          </div>

          <div className="mb-20">
            <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Our Values</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-muted text-primary">
                  <Shield size={32} />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">Security First</h3>
                <p className="text-muted-foreground">
                  Your data is protected with enterprise-grade encryption and security protocols.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-muted text-primary">
                  <Zap size={32} />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">Performance</h3>
                <p className="text-muted-foreground">
                  Lightning-fast email delivery and sync across all your devices.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-muted text-primary">
                  <Lock size={32} />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">Privacy</h3>
                <p className="text-muted-foreground">
                  We respect your privacy and never sell or share your data with third parties.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-muted text-primary">
                  <Users size={32} />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">Customer Focus</h3>
                <p className="text-muted-foreground">
                  Every feature we build is designed with your success in mind.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-primary-muted p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Our Mission</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              To provide businesses with reliable, professional email services that enable clear
              communication, build trust, and support growth at every stage.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
