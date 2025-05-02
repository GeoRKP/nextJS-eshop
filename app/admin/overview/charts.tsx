"use client";

import {BarChart, Bar, XAxis, YAxis, ResponsiveContainer} from 'recharts'

export default function Charts({
  data: { salesData },
}: {
  data: { salesData: { month: string; totalSales: number }[] };
}) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={salesData}>
        <XAxis 
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar dataKey="totalSales" fill="#adfa1d" radius={[4, 4, 0, 0]} className='fill-primary/70' />
      </BarChart>
    </ResponsiveContainer>
  );
}
