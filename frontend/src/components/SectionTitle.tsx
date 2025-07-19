
import { cn } from "@/lib/utils";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

const SectionTitle = ({ title, subtitle, centered = true, className }: SectionTitleProps) => {
  return (
    <div className={cn(
      "mb-12",
      centered ? "text-center" : "text-left",
      className
    )}>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;
