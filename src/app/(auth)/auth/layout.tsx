import Image from "next/image";
import { Corners } from "@/components/ui/corners";
import { blackblazebucket } from "@/lib/constants/links";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-muted p-4 sm:p-7">
      <div className="blueprint relative grid w-full max-w-[1180px] grid-cols-1 overflow-hidden bg-white shadow-[0_24px_70px_rgba(26,31,30,.14)] lg:grid-cols-[1.05fr_.95fr]">
        <Corners />

        {/* Form side */}
        <div className="order-1 flex min-h-0 flex-col p-7 sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <Image src={blackblazebucket + "/assets/images/logo.png"} alt="Kerabie" width={32} height={20} />
          </div>
          <div className="flex flex-1 items-center py-8">
            <div className="w-full max-w-[430px]">{children}</div>
          </div>
        </div>

        {/* Decorative side */}
        <div className="relative order-2 flex flex-col justify-between overflow-hidden bg-[#2E4A3F] p-7 text-[#E8EDEB] sm:p-9">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(232,237,235,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(232,237,235,.055) 1px,transparent 1px)",
              backgroundSize: "46px 46px",
            }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 w-[36%] animate-[k-sweep_8s_ease-in-out_infinite]"
            style={{ background: "linear-gradient(90deg,transparent,rgba(90,138,120,.26),transparent)" }}
          />

          <div className="relative">
            <span className="inline-flex items-center gap-2 border border-white/30 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-[#B7CEC5]">
              10,000+ businesses
            </span>
            <h2 className="mt-4 max-w-[22ch] text-[26px] leading-[1.18] tracking-tight text-white">
              Email that lands, on the domain your customers trust.
            </h2>
            <p className="mt-2 max-w-[36ch] text-[13.5px] leading-relaxed text-[#B7CEC5]">
              99.9% uptime, 24/7 human support, and deliverability handled for you from the first send.
            </p>
          </div>

          <div className="blueprint duotone relative my-5 hidden h-[190px] sm:block">
            <Corners className="text-white/50" />
            <Image
              src={blackblazebucket + "/assets/images/misc/team-roundtable.jpg"}
              alt="A team working together around a table"
              fill
              className="object-cover"
            />
          </div>

          <div className="relative grid gap-2.5">
            <div className="blueprint relative animate-[k-float_7s_ease-in-out_infinite] border-white/25 p-3.5">
              <Corners className="text-white/45" />
              <span className="block font-mono text-[10px] tracking-[.1em] text-[#8FB3A6]">INBOX RATE</span>
              <span className="block text-[22px] font-bold tracking-tight text-white">99.2%</span>
              <span className="mt-1.5 block h-1 bg-white/15">
                <span className="block h-1 w-[92%] origin-left bg-[#4CAF80]" />
              </span>
            </div>
            <p className="text-[12.5px] leading-relaxed text-[#8FB3A6]">
              &ldquo;Professional email hosting that just works. Fast delivery, rock-solid
              reliability, and the privacy controls we needed from day one.&rdquo;
              <span className="mt-1 block text-[#B7CEC5]">— Amara O., CTO, Buildfast Labs</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
