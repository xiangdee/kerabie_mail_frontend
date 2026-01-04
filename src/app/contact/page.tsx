 
'use client';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Mail, MapPin, Phone, Clock, Send, MessageSquare,
  Headphones, Users, Building, ArrowRight, Sparkles
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Our team typically responds within 24 hours",
    contact: "info@kerabie.email",
    link: "mailto:info@kerabie.email"
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "Mon-Fri from 8am to 6pm EST",
    contact: "+234 9031290387",
    link: "tel:+2349031290387"
  },
  {
    icon: MapPin,
    title: "Visit Us",
    description: "Come say hello at our office",
    contact: "123 Tech Boulevard, PH, NG 94105",
    link: "#"
  },
  {
    icon: Clock,
    title: "Office Hours",
    description: "We're here to help",
    contact: "Monday - Friday, 8am - 6pm EST",
    link: "#"
  }
];

const departments = [
  {
    icon: Headphones,
    title: "Customer Support",
    description: "Get help with your account or technical issues",
    email: "support@kerabie.com"
  },
  {
    icon: Building,
    title: "Enterprise Sales",
    description: "Discuss enterprise plans and custom solutions",
    email: "sales@kerabie.com"
  },
  {
    icon: Users,
    title: "Partnerships",
    description: "Explore partnership opportunities",
    email: "partners@kerabie.com"
  },
  {
    icon: MessageSquare,
    title: "Media & Press",
    description: "Press inquiries and media resources",
    email: "press@kerabie.com"
  }
];

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    inquiry: 'General Inquiry',
    message: ''
  });

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/10">
      <Header />
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden py-16 bg-white">
        <div className="max-w-5xl mx-auto text-center mb-2 relative">
          {/* Decorative stars */}
          <Sparkles className="absolute top-0 md:right-1/4 right-12 w-8 h-8 text-gray-800" />
          <Sparkles className="absolute top-10 md:left-1/4 left-12 w-6 h-6 text-gray-800" />
          
          <div className="max-w-6xl mx-auto mb-5 px-5 md:px-10">
            <div className="flex items-center justify-center mb-8">
              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                <Image src="/k-leaf-icon.png" width={20} height={20} alt="k-leaf-icon"/>
              </div>
              <span className="text-primary font-semibold text-sm tracking-wider uppercase bg-primary/10 px-4 py-2 rounded-full">
                Contact Us
              </span>
            </div>
          
            <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">
              <span className="text-gray-900">Let&apos;s start a </span>
              <span className="text-primary">conversation</span>
            </h1>
            <p className='text-gray-500 max-w-3xl mx-auto text-lg'>
              Have questions about Kerabie? Want to explore enterprise solutions? 
              Our team is here to help you succeed.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.link}
                className="group p-6 bg-card border rounded-2xl hover:shadow-lg transition-all hover:border-primary/50"
              >
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl mb-4 group-hover:bg-primary/20 transition-colors">
                  <method.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{method.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {method.contact}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Form + Departments */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="bg-card border rounded-3xl p-8 md:p-10">
              <h2 className="text-3xl font-bold mb-2">Send us a message</h2>
              <p className="text-muted-foreground mb-8">
                Fill out the form below and we&apos;ll get back to you as soon as possible.
              </p>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      className="w-full h-12 px-4 rounded-xl border-2 border-input bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className="w-full h-12 px-4 rounded-xl border-2 border-input bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@company.com"
                    className="w-full h-12 px-4 rounded-xl border-2 border-input bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Company (Optional)</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your Company"
                    className="w-full h-12 px-4 rounded-xl border-2 border-input bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">How can we help?</label>
                  <select 
                    name="inquiry"
                    value={formData.inquiry}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border-2 border-input bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option>General Inquiry</option>
                    <option>Customer Support</option>
                    <option>Enterprise Sales</option>
                    <option>Partnership Opportunity</option>
                    <option>Press & Media</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell us more about your inquiry..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <Button size="lg" className="w-full h-12 text-base" onClick={handleSubmit}>
                  Send Message <Send className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Departments */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Or reach out directly</h2>
                <p className="text-muted-foreground mb-8">
                  Contact the right team for faster assistance.
                </p>
              </div>

              <div className="space-y-4">
                {departments.map((dept, index) => (
                  <div
                    key={index}
                    className="p-6 bg-card border rounded-2xl hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl flex-shrink-0">
                        <dept.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-1">{dept.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{dept.description}</p>
                        <a
                          href={`mailto:${dept.email}`}
                          className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {dept.email}
                          <ArrowRight className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Looking for quick answers?</h2>
            <p className="text-muted-foreground mb-8">
              Check out our Help Center for guides, tutorials, and frequently asked questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" className="px-8">
                Visit Help Center
              </Button>
              <Button size="lg" variant="outline" className="px-8">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;