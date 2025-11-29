import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, MessageSquare, FileText } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              We&apos;re Here to Help
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Whether you need support, have a question about setup, or want to explore partnership
              opportunities, we&apos;re ready to assist.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="p-8">
                <h2 className="mb-6 text-2xl font-semibold text-foreground">Send us a message</h2>
                <form className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
                        Name
                      </label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                        Email
                      </label>
                      <Input id="email" type="email" placeholder="your@email.com" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="mb-2 block text-sm font-medium text-foreground">
                      Subject
                    </label>
                    <Input id="subject" placeholder="How can we help?" />
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary-hover">
                    Send Message
                  </Button>
                </form>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-muted text-primary">
                  <Mail size={24} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Email Support</h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  Get help from our support team
                </p>
                <a href="mailto:support@kerabie.email" className="text-sm font-medium text-primary hover:underline">
                  support@kerabie.email
                </a>
              </Card>

              <Card className="p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-muted text-primary">
                  <MessageSquare size={24} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Live Chat</h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  Chat with us during business hours
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Start Chat
                </Button>
              </Card>

              <Card className="p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-muted text-primary">
                  <FileText size={24} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Documentation</h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  Browse our help articles and guides
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Docs
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
