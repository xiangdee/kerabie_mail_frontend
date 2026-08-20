import Image from "next/image";
import { Corners } from "@/components/ui/corners";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

type LucideLikeIcon = ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

interface FeatureCardProps {
  icon: LucideLikeIcon | string;
  title: string;
  description: string;
  className?: string;
  isImage?: boolean;
  tint?: boolean;
}

export const FeatureCard = ({
  icon,
  title,
  description,
  className,
  isImage = false,
  tint = false,
}: FeatureCardProps) => {
  const Icon = icon as LucideLikeIcon;

  return (
    <div
      className={cn(
        "blueprint relative p-[26px] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(26,31,30,.08)]",
        tint && "bg-muted",
        className,
      )}
    >
      <Corners />
      {isImage ? (
        <Image src={icon as string} alt={title} width={20} height={20} className="object-contain" />
      ) : (
        <Icon size={20} className="text-primary" strokeWidth={1.5} />
      )}
      <h3 className="mb-1.5 mt-3.5 text-[19px]">{title}</h3>
      <p className="text-[13.5px] leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
};
