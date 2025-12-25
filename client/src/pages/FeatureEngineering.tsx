import { useEdaStats } from "@/hooks/use-passengers";
import Layout from "@/components/Layout";
import { InsightBox } from "@/components/InsightBox";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function FeatureEngineering() {
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

  // Assuming backend provides these specific engineered feature stats
  // If not in the mock, we simulate or map existing ones for demo purposes
  const groupSizeData = stats.features.find(f => f.feature === 'GroupSize')?.data || [];
  const cabinDeckData = stats.features.find(f => f.feature === 'CabinDeck')?.data || [];
  const spendingData = stats.features.find(f => f.feature === 'SpendingFlag')?.data || [];

  return (
    <Layout>
      <div className="space-y-2 mb-8">
        <h2 className="text-3xl font-display font-bold text-foreground">FEATURE ENGINEERING</h2>
        <div className="h-1 w-20 bg-secondary rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GROUP SIZE */}
        <div className="lg:col-span-2">
          <Card className="bg-card/50 border-border h-full">
            <CardHeader>
              <CardTitle className="font-display">Group Size Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={groupSizeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" label={{ value: 'Group Size', position: 'insideBottom', offset: -5 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))' }} />
                    <Legend />
                    <Bar dataKey="rate" name="Survival Rate" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <InsightBox title="Social Units Matter">
            <p className="mb-2">
              <strong>Solo travelers</strong> have the lowest survival rate (~30-40%).
            </p>
            <p>
              Groups of <strong>2-4 people</strong> survive more often. However, very large groups (over 6) see survival rates drop again. This non-linear relationship is a critical feature for the model.
            </p>
          </InsightBox>
        </div>

        {/* CABIN DECK */}
        <div className="lg:col-span-3">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="font-display">Cabin Deck Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cabinDeckData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))' }} />
                    <Legend />
                    <Bar dataKey="transported" name="Transported" stackId="a" fill="hsl(var(--primary))" />
                    <Bar dataKey="notTransported" name="Lost" stackId="a" fill="hsl(var(--muted))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <p className="text-sm text-muted-foreground p-3 bg-card rounded-lg border border-border">
                   <strong>Deck B & C</strong> (Europa/Conference decks) have higher survival rates.
                 </p>
                 <p className="text-sm text-muted-foreground p-3 bg-card rounded-lg border border-border">
                   <strong>Decks F & G</strong> have the largest populations but lower survival rates.
                 </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SPENDING */}
        <div className="lg:col-span-1">
          <InsightBox title="The Cost of Living">
            <p>
              Interestingly, passengers who spent <strong>$0</strong> (Zero Spend) had a dramatically higher survival rate compared to those who spent any amount.
            </p>
            <p className="mt-2 text-xs opacity-70">
              This likely correlates with CryoSleep passengers who couldn't spend money.
            </p>
          </InsightBox>
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="font-display">Spending Flag (Zero vs Spenders)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendingData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" hide />
                    <YAxis dataKey="label" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))' }} />
                    <Bar dataKey="rate" name="Survival Rate" fill="hsl(var(--secondary))" barSize={40} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: 'white' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </Layout>
  );
}
