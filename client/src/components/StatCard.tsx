import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  delay?: number;
  className?: string;
}

export function StatCard({ title, value, subtext, icon, delay = 0, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card border border-border p-6 shadow-lg hover:border-primary/50 transition-colors group",
        className
      )}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      
      {/* Decorative gradient blob */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/20 blur-3xl rounded-full pointer-events-none" />

      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono mb-2">
        {title}
      </h3>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl md:text-4xl font-display font-bold text-foreground text-glow">
          {value}
        </span>
      </div>
      
      {subtext && (
        <p className="mt-2 text-sm text-muted-foreground border-t border-border/50 pt-2 inline-block">
          {subtext}
        </p>
      )}
    </motion.div>
  );
}
