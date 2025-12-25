import { Lightbulb } from "lucide-react";

interface InsightBoxProps {
  title: string;
  children: React.ReactNode;
}

export function InsightBox({ title, children }: InsightBoxProps) {
  return (
    <div className="h-full bg-secondary/5 border border-secondary/20 rounded-xl p-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent pointer-events-none" />
      <div className="flex items-start gap-3 relative z-10">
        <div className="p-2 bg-secondary/20 rounded-lg shrink-0">
          <Lightbulb className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h4 className="text-secondary font-display font-bold text-sm uppercase tracking-wide mb-1">
            Analysis Insight: {title}
          </h4>
          <div className="text-sm text-muted-foreground leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
