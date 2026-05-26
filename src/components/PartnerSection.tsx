import React from 'react'
import Link from 'next/link'
import { Button } from './ui/button'
import { CheckCircle2 } from 'lucide-react'

function PartnerSection() {
  return (
    <section className="relative bg-secondary-muted py-24">
  <div className="container mx-auto px-4">
    <div className="grid items-center gap-16 lg:grid-cols-2">

      {/* Left: Copy */}
      <div>
        <span className="mb-3 inline-block rounded-full bg-secondary/10 px-4 py-1 text-sm font-medium text-secondary">
          Partner Program
        </span>

        <h2 className="mt-4 mb-6 text-4xl font-bold text-foreground leading-tight">
          Partner with Kerabie
        </h2>

        <p className="mb-8 text-lg text-muted-foreground max-w-xl">
          Offer your customers a premium business email platform built for
          <strong className="text-foreground font-medium"> guaranteed deliverability</strong>,
          reliability, and scale. Kerabie integrates seamlessly into your
          hosting stack and elevates your service offering instantly.
        </p>

        <div className="flex flex-wrap gap-4">
          <Button
            size="lg"
            className="bg-secondary hover:bg-secondary-hover text-secondary-foreground"
            asChild
          >
            <Link href="/partner">Become a hosting partner</Link>
          </Button>

          <Button
            size="lg"
            variant="outline"
            asChild
          >
            <Link href="/contact">Talk to partnerships</Link>
          </Button>
        </div>
      </div>

      {/* Right: Benefits */}
      <div className="grid gap-6 sm:grid-cols-2">
        {[
          "Easy provisioning & fast onboarding",
          "High-deliverability email infrastructure",
          "White-label & co-branding options",
          "Powerful admin & billing tools",
          "Multi-domain & reseller support",
          "Built to scale for large customer bases",
        ].map((item) => (
          <div
            key={item}
            className="flex items-start gap-4 rounded-xl border border-border bg-background p-6"
          >
            <CheckCircle2 className="h-6 w-6 text-secondary shrink-0 mt-1" />
            <p className="font-medium text-foreground leading-snug">
              {item}
            </p>
          </div>
        ))}
      </div>

    </div>
  </div>
</section>

  )
}

export default PartnerSection