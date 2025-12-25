import { useEdaStats } from "@/hooks/use-passengers";
import Layout from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { Users, Activity, Orbit, BrainCircuit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: stats, isLoading } = useEdaStats();

  if (isLoading) {
    return (
      <Layout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl bg-card/50" />
          ))}
        </div>
      </Layout>
    );
  }

  if (!stats) return null;

  return (
    <Layout>
      <div className="space-y-2 mb-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
          MISSION CONTROL
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Overview of passenger data and survival predictions for the Spaceship Titanic disaster.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Passengers"
          value={stats.totalPassengers.toLocaleString()}
          icon={<Users className="w-24 h-24" />}
          delay={0}
        />
        <StatCard
          title="Transported Rate"
          value={`${(stats.transportedRate * 100).toFixed(1)}%`}
          subtext={`${stats.transportedCount} survivors confirmed`}
          icon={<Activity className="w-24 h-24" />}
          className="border-primary/30 bg-primary/5"
          delay={1}
        />
        <StatCard
          title="Data Features"
          value="14"
          subtext="Analyzed variables"
          icon={<BrainCircuit className="w-24 h-24" />}
          delay={2}
        />
        <StatCard
          title="Origin Planets"
          value="3"
          subtext="Earth, Europa, Mars"
          icon={<Orbit className="w-24 h-24" />}
          delay={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <Link href="/eda">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-card to-background border border-border hover:border-primary/50 cursor-pointer shadow-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&q=80')] bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative z-10">
              <h3 className="text-2xl font-display font-bold mb-4 text-primary">EXPLORATORY ANALYSIS</h3>
              <p className="text-muted-foreground mb-6">
                Deep dive into passenger demographics, cryogenic sleep patterns, and spending habits to understand survival factors.
              </p>
              <span className="text-sm font-mono text-primary group-hover:underline">VIEW DATA VISUALIZATIONS →</span>
            </div>
          </motion.div>
        </Link>

        <Link href="/engineering">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-card to-background border border-border hover:border-secondary/50 cursor-pointer shadow-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-[url('https://pixabay.com/get/g72ebb726ea0ae2fcf63cbc0257b30e6552c8fe00753030a63e047e984adc620df390d2f9035cb24c41709199b25b5144e73049ddef1ef7966b55504ef48096ab_1280.jpg')] bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative z-10">
              <h3 className="text-2xl font-display font-bold mb-4 text-secondary">FEATURE ENGINEERING</h3>
              <p className="text-muted-foreground mb-6">
                Advanced analysis of engineered features like Cabin Deck, Group Size, and Total Spending to improve predictive models.
              </p>
              <span className="text-sm font-mono text-secondary group-hover:underline">VIEW FEATURE INSIGHTS →</span>
            </div>
          </motion.div>
        </Link>
      </div>
    </Layout>
  );
}
