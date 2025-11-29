import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, Monitor, Download, FileText } from "lucide-react";

const Downloads = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              Download Kerabie Email Apps
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Experience Kerabie across mobile and desktop. Stay connected, productive, and
              organized anywhere.
            </p>
          </div>

          <div className="mb-16">
            <h2 className="mb-8 text-center text-3xl font-bold text-foreground">Mobile Apps</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="p-8">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-muted text-primary">
                  <Smartphone size={32} />
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-foreground">Android</h3>
                <p className="mb-6 text-muted-foreground">
                  Get Kerabie Email for Android devices. Full-featured mobile experience with
                  offline access and push notifications.
                </p>
                <Button className="w-full bg-primary hover:bg-primary-hover">
                  <Download className="mr-2" size={20} />
                  Download for Android
                </Button>
              </Card>

              <Card className="p-8">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-muted text-primary">
                  <Smartphone size={32} />
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-foreground">iOS</h3>
                <p className="mb-6 text-muted-foreground">
                  Get Kerabie Email for iPhone and iPad. Seamlessly integrated with iOS features
                  for the best mobile experience.
                </p>
                <Button className="w-full bg-primary hover:bg-primary-hover">
                  <Download className="mr-2" size={20} />
                  Download for iOS
                </Button>
              </Card>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="mb-8 text-center text-3xl font-bold text-foreground">Desktop Setup</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="p-8">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-muted text-primary">
                  <Monitor size={32} />
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-foreground">Desktop App</h3>
                <p className="mb-6 text-muted-foreground">
                  Native desktop application for Windows, macOS, and Linux. Full-featured email
                  client with offline support.
                </p>
                <Button className="w-full bg-primary hover:bg-primary-hover">
                  <Download className="mr-2" size={20} />
                  Download Desktop App
                </Button>
              </Card>

              <Card className="p-8">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-muted text-primary">
                  <FileText size={32} />
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-foreground">
                  IMAP/SMTP Configuration
                </h3>
                <p className="mb-6 text-muted-foreground">
                  Use Kerabie with your favorite email client. Step-by-step setup guides for
                  popular email applications.
                </p>
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2" size={20} />
                  View Setup Guides
                </Button>
              </Card>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted p-8 text-center">
            <h3 className="mb-3 text-xl font-semibold text-foreground">Need Help?</h3>
            <p className="mb-4 text-muted-foreground">
              Our support team is here to assist you with installation and setup.
            </p>
            <Button variant="outline">Contact Support</Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Downloads;
