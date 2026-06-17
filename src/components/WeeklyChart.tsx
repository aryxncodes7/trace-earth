import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartDay } from '../store/useStore.js';

interface WeeklyChartProps {
  data: ChartDay[];
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-slate-400">
        <p className="text-sm">Not enough data to load trend lines yet.</p>
      </div>
    );
  }

  // Format date labels nicely (e.g. "Jun 12")
  const formattedData = data.map((item) => {
    const rawDate = new Date(item.date);
    const dayName = rawDate.toLocaleDateString('en-US', { weekday: 'short' });
    const shortDate = rawDate.toLocaleDateString('en-US', { day: 'numeric' });
    return {
      ...item,
      label: `${dayName} ${shortDate}`,
    };
  });

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          {/* Subtle grid lines */}
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
          
          <XAxis 
            dataKey="label" 
            stroke="var(--chart-axis)" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="var(--chart-axis)" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft', style: { fill: 'var(--chart-axis)', fontSize: 10, textAnchor: 'middle' }, offset: 5 }}
          />
          
          {/* Custom clean Tooltip styling */}
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg)',
              color: 'var(--tooltip-text)',
              border: '1px solid var(--tooltip-border)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif',
            }}
            labelStyle={{ color: 'var(--tooltip-text)', fontWeight: 'bold' }}
            itemStyle={{ padding: '2px 0', color: 'var(--tooltip-text)' }}
          />

          {/* Lines without under-fills, matching Linear-style clean outlines */}
          <Line
            name="Total CO₂"
            type="monotone"
            dataKey="total"
            stroke="#16a34a" // Solid emerald green
            strokeWidth={3}
            activeDot={{ r: 6 }}
            dot={{ r: 3, strokeWidth: 1 }}
          />
          <Line
            name="Transport"
            type="monotone"
            dataKey="transport"
            stroke="#3b82f6" // Sky Blue
            strokeWidth={1.5}
            dot={false}
          />
          <Line
            name="Home Energy"
            type="monotone"
            dataKey="energy"
            stroke="#f59e0b" // Amber
            strokeWidth={1.5}
            dot={false}
          />
          <Line
            name="Diet Factor"
            type="monotone"
            dataKey="diet"
            stroke="#10b981" // Teal Green
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
