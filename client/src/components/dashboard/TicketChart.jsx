import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#6b7280', '#ef4444', '#f59e0b', '#06b6d4'];

const tooltipStyle = {
  contentStyle: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    fontSize: 12,
  },
};

const EmptyChart = ({ msg = 'No data yet' }) => (
  <div
    style={{
      height: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-muted)',
      fontSize: 13,
    }}
  >
    {msg}
  </div>
);

export function ActivityBarChart({ data }) {
  if (!data?.length) return <EmptyChart msg="No activity in the last 7 days" />;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
        <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="tickets" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Tickets" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart({ data }) {
  if (!data?.length) return <EmptyChart msg="No tickets yet" />;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={75}
          dataKey="value"
          label={({ name, percent }) =>
            percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
          }
          labelLine={false}
          fontSize={10}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function PriorityBarChart({ data }) {
  if (!data?.length) return <EmptyChart msg="No data yet" />;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis type="number" stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          stroke="var(--text-muted)"
          fontSize={11}
          width={65}
        />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Count" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ResolutionLineChart({ data }) {
  if (!data?.length) return <EmptyChart msg="No resolution data yet" />;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
        <YAxis stroke="var(--text-muted)" fontSize={11} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="avgTime"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          name="Avg. Resolution (h)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
