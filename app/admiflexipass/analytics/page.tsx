"use client";

import React, { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Label, Bar, BarChart } from "recharts";
import { TrendingUp, Users, DollarSign, Package } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type CustomerStat = {
  email: string;
  name: string;
  totalSpent: number;
  orderCount: number;
};

type ProductStat = {
  id: string;
  title: string;
  quantity: number;
};

type RevenueStat = {
  month: string;
  revenue: number;
  orders: number;
};

export default function AnalyticsPage() {
  const [topCustomers, setTopCustomers] = useState<CustomerStat[]>([]);
  const [topProducts, setTopProducts] = useState<ProductStat[]>([]);
  const [revenueChart, setRevenueChart] = useState<RevenueStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        if (res.ok) {
          const data = await res.json();
          setTopCustomers(data.topCustomers || []);
          setTopProducts(data.topProducts || []);
          setRevenueChart(data.revenueChart || []);
        }
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-[#ff8a00] border-t-transparent rounded-full mb-4"></div>
        <p className="text-zinc-500 font-medium animate-pulse">Chargement des statistiques...</p>
      </div>
    );
  }

  // Config for Revenue Area Chart
  const revenueChartConfig = {
    revenue: {
      label: "Chiffre d'Affaires",
      color: "#ff8a00", // Flexipass Orange
    },
  } satisfies ChartConfig;

  // Formatting products for Donut & Bar Charts
  const colors = ["#ff8a00", "#ff6a1a", "#ffa84d", "#ffd5a6", "#ffeddb"];
  
  // Sliced to 5 for the Donut chart
  const donutChartData = topProducts.slice(0, 5).map((p, index) => {
    const shortName = p.title.slice(0, 15) + (p.title.length > 15 ? "..." : "");
    const cleanKey = shortName.replace(/[^a-zA-Z0-9]/g, '');
    const color = colors[index % colors.length];
    return {
      productName: shortName,
      visitors: p.quantity,
      fill: color,
      cleanKey,
    };
  });

  // Sliced to 8 for the Bar chart to show more detail
  const barChartData = topProducts.slice(0, 8).map((p, index) => {
    const shortName = p.title.slice(0, 15) + (p.title.length > 15 ? "..." : "");
    const cleanKey = shortName.replace(/[^a-zA-Z0-9]/g, '');
    const color = colors[index % colors.length];
    return {
      productName: shortName,
      visitors: p.quantity,
      fill: color,
      cleanKey,
    };
  });

  // Merged config for top products config map
  const productChartConfig = topProducts.slice(0, 10).reduce((acc, curr, index) => {
    const shortName = curr.title.slice(0, 15) + (curr.title.length > 15 ? "..." : "");
    const cleanKey = shortName.replace(/[^a-zA-Z0-9]/g, '');
    acc[cleanKey] = {
      label: shortName,
      color: colors[index % colors.length],
    };
    return acc;
  }, { visitors: { label: "Ventes" } } as Record<string, any>) satisfies ChartConfig;

  const totalProductSales = donutChartData.reduce((acc, curr) => acc + curr.visitors, 0);

  // Maximum values for progress bars
  const maxSpent = Math.max(...topCustomers.map((c) => c.totalSpent), 1);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2f2a33] tracking-tight">Analyses & Stats</h1>
          <p className="text-sm sm:text-base text-zinc-500 font-medium mt-1">
            Performances de vos ventes et comportements de vos clients.
          </p>
        </div>
      </div>

      <div className="grid-cols-1 lg:grid-cols-2 gap-6 w-full" style={{ display: "grid" }}>
        {/* REVENUE CHART */}
        <div className="bg-white p-5 sm:p-6 rounded-[2rem] border border-[#efe5d9] flex flex-col min-w-0 min-h-[400px]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#2f2a33]">Chiffre d'Affaires</h3>
              <p className="text-sm text-zinc-500">Évolution sur les 6 derniers mois</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-50 text-[#ff8a00] flex items-center justify-center shrink-0">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[300px] w-full">
            {revenueChart.length > 0 ? (
              <ChartContainer className="h-[300px] w-full" config={revenueChartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={revenueChart}
                  margin={{ left: 10, right: 10, top: 10, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    tickFormatter={(value) => value}
                    style={{ fontSize: "12px", fill: "#71717a", fontWeight: 500 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toLocaleString(undefined, {maximumFractionDigits: 1})}k` : value}
                    style={{ fontSize: "11px", fill: "#71717a", fontWeight: 500 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent hideLabel indicator="dot" />} cursor={false} />
                  <Area
                    dataKey="revenue"
                    type="monotone"
                    fill="#ff8a00"
                    fillOpacity={0.2}
                    stroke="#ff8a00"
                    strokeWidth={4}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <p className="text-zinc-400">Aucune donnée disponible</p>
            )}
          </div>
        </div>

        {/* PRODUCTS DONUT CHART */}
        <div className="bg-white p-5 sm:p-6 rounded-[2rem] border border-[#efe5d9] flex flex-col min-w-0 min-h-[400px]">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#2f2a33]">Top Produits</h3>
              <p className="text-sm text-zinc-500">Répartition des ventes (Donut)</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-zinc-50 text-zinc-500 flex items-center justify-center shrink-0">
              <Package size={24} />
            </div>
          </div>
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6 w-full min-h-[300px]">
            {donutChartData.length > 0 ? (
              <>
                <div className="relative flex items-center justify-center shrink-0">
                  <ChartContainer className="aspect-square w-[200px] sm:w-[220px]" config={productChartConfig}>
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
                      <Pie
                        data={donutChartData}
                        dataKey="visitors"
                        nameKey="cleanKey"
                        innerRadius="65%"
                        outerRadius="90%"
                        strokeWidth={5}
                      >
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-[#2f2a33] text-4xl sm:text-5xl font-extrabold"
                                  >
                                    {totalProductSales.toLocaleString()}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-zinc-500 text-xs sm:text-sm font-bold"
                                  >
                                    Ventes Totales
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </div>
                
                {/* Responsive legend panel beside the donut chart */}
                <div className="flex flex-col gap-3 w-full xl:w-auto max-w-xs xl:max-w-md bg-zinc-50/50 p-5 rounded-2xl border border-zinc-100/80">
                  <h4 className="text-xs font-bold text-[#2f2a33]/80 uppercase tracking-widest mb-1">Détails des Ventes</h4>
                  <div className="space-y-2.5">
                    {donutChartData.map((item, index) => {
                      const percent = totalProductSales > 0 ? ((item.visitors / totalProductSales) * 100).toFixed(0) : 0;
                      return (
                        <div key={index} className="flex items-center justify-between gap-4 text-xs sm:text-sm">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                            <span className="font-semibold text-zinc-700 truncate">{item.productName}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 font-bold">
                            <span className="text-[#2f2a33]">{item.visitors}</span>
                            <span className="text-zinc-400 font-medium">({percent}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-zinc-400">Aucune donnée disponible</p>
            )}
          </div>
        </div>

        {/* TOP CUSTOMERS LIST */}
        <div className="bg-white p-5 sm:p-6 rounded-[2rem] border border-[#efe5d9] flex flex-col min-w-0 min-h-[400px]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#2f2a33]">Meilleurs Clients</h3>
              <p className="text-sm text-zinc-500">Ceux qui commandent le plus</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <Users size={24} />
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-2 max-h-[280px] scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
            {topCustomers.length > 0 ? (
              topCustomers.map((customer, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#2f2a33] truncate">{customer.name}</p>
                      <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">{customer.orderCount} Commandes</p>
                    </div>
                    <span className="shrink-0 font-extrabold text-[#ff6a1a] text-right whitespace-nowrap">{customer.totalSpent.toLocaleString()} HTG</span>
                  </div>
                  <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-[#ff8a00] via-[#ff6a1a] to-[#ff4500] rounded-full transition-all duration-1000 hover:opacity-90"
                      style={{ width: `${Math.max((customer.totalSpent / maxSpent) * 100, 2)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-400 text-center py-8">Aucun client trouvé.</p>
            )}
          </div>
        </div>

        {/* TOP PRODUCTS BAR MIXED CHART */}
        <div className="bg-white p-5 sm:p-6 rounded-[2rem] border border-[#efe5d9] flex flex-col min-w-0 min-h-[400px]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#2f2a33]">Palmarès des Ventes</h3>
              <p className="text-sm text-zinc-500">Produits les plus vendus (Barres)</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <DollarSign size={24} />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[300px] w-full">
            {barChartData.length > 0 ? (
              <ChartContainer className="h-[300px] w-full" config={productChartConfig}>
                <BarChart
                  accessibilityLayer
                  data={barChartData}
                  layout="vertical"
                  margin={{ left: 10, right: 10 }}
                >
                  <YAxis
                    axisLine={false}
                    dataKey="productName"
                    tickFormatter={(value) => productChartConfig[value.replace(/[^a-zA-Z0-9]/g, '')]?.label || value}
                    tickLine={false}
                    tickMargin={10}
                    type="category"
                    width={110}
                    style={{ fontSize: "11px", fill: "#2f2a33", fontWeight: 600 }}
                  />
                  <XAxis dataKey="visitors" hide type="number" />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
                  <Bar dataKey="visitors" radius={6} barSize={24} />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-zinc-400 text-center py-8">Aucun produit vendu.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
