import { useEdaStats } from "@/hooks/use-passengers";
import Layout from "@/components/Layout";
import { InsightBox } from "@/components/InsightBox";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = ['#0ea5e9', '#1e293b', '#8b5cf6', '#f472b6'];

export default function EdaAnalysis() {
  const { data: stats, isLoading } = useEdaStats();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!stats) return null;

  // Extract data for specific charts
  const cryoData = stats.features.find(f => f.feature === 'CryoSleep')?.data || [];
  const planetData = stats.features.find(f => f.feature === 'HomePlanet')?.data || [];
  const destData = stats.features.find(f => f.feature === 'Destination')?.data || [];
  const ageData = stats.features.find(f => f.feature === 'Age')?.data || []; // Assuming backend bins ages
  const vipData = stats.features.find(f => f.feature === 'VIP')?.data || [];

  return (
    <Layout>
      <div className="space-y-2 mb-8">
        <h2 className="text-3xl font-display font-bold text-foreground">EXPLORATORY DATA ANALYSIS</h2>
        <div className="h-1 w-20 bg-primary rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* CRYO SLEEP SECTION - Most Important */}
        <Card className="col-span-1 lg:col-span-2 bg-card/50 border-border backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-display">CryoSleep Hypothesis</CardTitle>
            <CardDescription>Impact of suspended animation on survival probability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cryoData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="label" type="category" stroke="hsl(var(--muted-foreground))" width={80} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Bar dataKey="transported" name="Transported" stackId="a" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="notTransported" name="Lost" stackId="a" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="col-span-1">
          <InsightBox title="CryoSleep Significance">
            <p className="mb-2">
              Passengers in CryoSleep had a significantly <strong>higher survival rate</strong> compared to active passengers.
            </p>
            <p>
              This suggests that being confined to cabins (where pods are likely located) might have been safer during the anomaly, or that the anomaly targeted active biological signatures.
            </p>
          </InsightBox>
        </div>
      </div>

      {/* PLANET & DESTINATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="font-display">Home Planet Origin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="total"
                  >
                    {planetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))' }} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-primary/5 rounded-lg text-sm text-muted-foreground border border-primary/10">
              <strong className="text-primary block mb-1">Observation:</strong>
              Europa passengers show higher transport rates (likely due to correlation with CryoSleep).
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="font-display">Destination Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={destData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12}} />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'hsl(var(--card))' }} />
                  <Bar dataKey="rate" name="Survival Rate" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-secondary/5 rounded-lg text-sm text-muted-foreground border border-secondary/10">
              <strong className="text-secondary block mb-1">Observation:</strong>
              55 Cancri e passengers had slightly better odds, possibly due to demographic makeup (richer/Europa).
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AGE DISTRIBUTION */}
      <Card className="bg-card/50 border-border mb-8">
        <CardHeader>
          <CardTitle className="font-display">Age Distribution & Survival</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ageData}>
                <defs>
                  <linearGradient id="colorTransported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--muted))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--muted))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))' }} />
                <Legend />
                <Area type="monotone" dataKey="total" stroke="hsl(var(--muted))" fillOpacity={1} fill="url(#colorTotal)" name="Total Passengers" />
                <Area type="monotone" dataKey="transported" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorTransported)" name="Transported" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 text-sm text-muted-foreground text-center">
            Children (0-10 years) had a markedly higher chance of being transported.
          </p>
        </CardContent>
      </Card>
    </Layout>
  );
}
