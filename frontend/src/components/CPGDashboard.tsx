import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Store as StoreIcon,
  Package2,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { motion } from "framer-motion";

const currency = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(n);
const compactCurrency = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return currency(n);
};
const formatK = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`);

const monthlyTrend = [
  { mes: "Ene", ventas: 1200000, ordenes: 450 },
  { mes: "Feb", ventas: 1350000, ordenes: 480 },
  { mes: "Mar", ventas: 1280000, ordenes: 465 },
  { mes: "Abr", ventas: 1520000, ordenes: 520 },
  { mes: "May", ventas: 1690000, ordenes: 575 },
  { mes: "Jun", ventas: 1850000, ordenes: 620 }
];

const salesByRegion = [
  { region: "Norte", ventas: 450000, ordenes: 234 },
  { region: "Sur", ventas: 380000, ordenes: 198 },
  { region: "Este", ventas: 520000, ordenes: 287 },
  { region: "Oeste", ventas: 340000, ordenes: 156 }
];

const productDistribution = [
  { name: "Bebidas", value: 35 },
  { name: "Abarrotes", value: 28 },
  { name: "Lácteos", value: 22 },
  { name: "Snacks", value: 15 }
];

const topStores = [
  { name: "Tienda La Esquina", ventas: 45600, ordenes: 28, crecimiento: 12 },
  { name: "Super Mercado Central", ventas: 38900, ordenes: 24, crecimiento: 8 },
  { name: "Abarrotes El Sol", ventas: 32100, ordenes: 19, crecimiento: -3 },
  { name: "Minimarket Express", ventas: 28400, ordenes: 16, crecimiento: 5 },
  { name: "Tienda Doña María", ventas: 25800, ordenes: 14, crecimiento: 15 }
];

const PIE_COLORS = ["#29BF12", "#FFBA49", "#34d399", "#fbbf24"];

export function CPGDashboard() {
  return (
    <main className="relative min-h-screen pb-20">
      {/* Fondo atmosférico */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" aria-hidden>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #29BF12 1px, transparent 1px),
                           radial-gradient(circle at 80% 80%, #FFBA49 1px, transparent 1px)`,
          backgroundSize: "50px 50px"
        }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Encabezado */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-[#1a8a0a]">Panel CPG</h1>
                <p className="text-sm text-gray-600">Vista General de Distribución</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* KPIs */}
        <motion.div className="grid grid-cols-2 gap-3 sm:gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
          {/* Ventas Totales */}
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-[#FFBA49] font-medium">Ventas Totales</div>
                <div className="text-lg sm:text-xl font-semibold text-[#1a8a0a]">{compactCurrency(1850000)}</div>
                <div className="text-xs mt-1 text-[#1a8a0a] flex items-center gap-1"><ArrowUpRight size={14}/> +18%</div>
              </div>
              <TrendingUp className="text-[#29BF12]" size={20} />
            </div>
          </Card>

          {/* Órdenes del Mes */}
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-[#FFBA49] font-medium">Órdenes del Mes</div>
                <div className="text-lg sm:text-xl font-semibold text-[#1a8a0a]">875</div>
                <div className="text-xs mt-1 text-[#1a8a0a] flex items-center gap-1"><ArrowUpRight size={14}/> +12%</div>
              </div>
              <ShoppingBag className="text-[#29BF12]" size={20} />
            </div>
          </Card>

          {/* Tiendas Activas */}
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-[#FFBA49] font-medium">Tiendas Activas</div>
                <div className="text-lg sm:text-xl font-semibold text-[#1a8a0a]">342</div>
                <div className="text-xs mt-1 text-[#1a8a0a] flex items-center gap-1"><ArrowUpRight size={14}/> +5%</div>
              </div>
              <StoreIcon className="text-[#29BF12]" size={20} />
            </div>
          </Card>

          {/* Productos Vendidos */}
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-[#FFBA49] font-medium">Productos Vendidos</div>
                <div className="text-lg sm:text-xl font-semibold text-[#1a8a0a]">15.6K</div>
                <div className="text-xs mt-1 text-red-600 flex items-center gap-1"><ArrowDownRight size={14}/> -2%</div>
              </div>
              <Package2 className="text-[#29BF12]" size={20} />
            </div>
          </Card>
        </motion.div>

        {/* Tendencia Mensual */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card className="p-4">
            <div className="text-sm font-semibold text-[#1a8a0a] mb-2">Tendencia Mensual</div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ left: -16, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: any) => currency(Number(v))} />
                  <Line type="monotone" dataKey="ventas" stroke="#29BF12" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Ventas por Región */}
          <Card className="p-4">
            <div className="text-sm font-semibold text-[#1a8a0a] mb-2">Ventas por Región</div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByRegion} layout="vertical" margin={{ left: 0, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="region" type="category" width={60} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: any) => currency(Number(v))} />
                  <Bar dataKey="ventas" fill="#29BF12" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {salesByRegion.map(r => (
                <div key={r.region} className="flex items-center justify-between rounded-lg border border-white/60 bg-white/70 p-2">
                  <div className="flex items-center gap-2 text-sm text-gray-800"><MapPin size={16} className="text-[#29BF12]"/> {r.region}</div>
                  <div className="text-xs text-gray-600">{r.ordenes} órdenes</div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Distribución de Productos + Top 5 Tiendas */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
          <Card className="p-4">
            <div className="text-sm font-semibold text-[#1a8a0a] mb-2">Distribución de Productos</div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={productDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5}>
                    {productDistribution.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {productDistribution.map((pd, idx) => (
                <div key={pd.name} className="flex items-center gap-2 text-sm">
                  <span className="inline-block size-3 rounded" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="text-gray-800">{pd.name}</span>
                  <span className="text-[#FFBA49] text-xs ml-auto">{pd.value}%</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-[#1a8a0a]">Top 5 Tiendas</div>
              <Badge variant="gradient">Este Mes</Badge>
            </div>
            <div className="space-y-2">
              {topStores.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between rounded-xl border border-white/60 bg-white/80 p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="inline-flex items-center justify-center size-6 rounded-full bg-[#29BF12] text-white text-xs font-semibold">{i + 1}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{s.name}</div>
                      <div className="text-xs text-gray-600">{s.ordenes} órdenes</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-[#1a8a0a]">{formatK(s.ventas)}</div>
                    <div className={`text-xs flex items-center justify-end gap-1 ${s.crecimiento >= 0 ? 'text-[#1a8a0a]' : 'text-red-600]'}`}>
                      {s.crecimiento >= 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                      {s.crecimiento >= 0 ? `+${s.crecimiento}%` : `${s.crecimiento}%`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Resumen de Órdenes */}
        <motion.div className="grid grid-cols-2 gap-3 sm:gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card className="p-4">
            <div className="text-xs text-[#FFBA49] font-medium">Órdenes Pendientes</div>
            <div className="text-lg sm:text-xl font-semibold text-[#1a8a0a]">24</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-[#FFBA49] font-medium">Órdenes Completadas</div>
            <div className="text-lg sm:text-xl font-semibold text-[#1a8a0a]">851</div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
