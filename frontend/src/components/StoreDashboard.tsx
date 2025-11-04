import React from 'react';
import { TrendingUp, Package, DollarSign, Receipt, AlertCircle, Sparkles, Clock } from "lucide-react";
import { Card, CardHeader, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { motion } from "framer-motion";

const currency = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(n);

const salesData = [
  { day: "Lun", ventas: 12500 },
  { day: "Mar", ventas: 15800 },
  { day: "Mié", ventas: 13200 },
  { day: "Jue", ventas: 18900 },
  { day: "Vie", ventas: 21400 },
  { day: "Sáb", ventas: 25600 },
  { day: "Dom", ventas: 19800 }
];

const productPerformance = [
  { product: "Bebidas", ventas: 35 },
  { product: "Abarrotes", ventas: 28 },
  { product: "Lácteos", ventas: 22 },
  { product: "Snacks", ventas: 15 }
];

const lowStockItems = [
  { name: "Leche Entera 1L", stock: 8, min: 20 },
  { name: "Pan Integral", stock: 5, min: 15 },
  { name: "Refresco 2L", stock: 12, min: 30 }
];

const activePromotions = [
  { name: "15% OFF Galletas", status: "Activa", end: "5 días" },
  { name: "2x1 Refrescos", status: "Activa", end: "3 días" }
];

const suggestedPromotions = [
  {
    product: "Pan Integral",
    reason: "Producto perecedero con bajo stock",
    suggestion: "20% OFF antes de vencimiento",
    urgency: "Alta",
    potentialSales: "$675",
    rotation: "Baja rotación - 3 días restantes"
  },
  {
    product: "Yogurt Natural",
    reason: "Baja rotación y próximo a vencer",
    suggestion: "2x1 en Yogurt",
    urgency: "Alta",
    potentialSales: "$560",
    rotation: "Baja rotación - 5 días restantes"
  },
  {
    product: "Galletas Marías",
    reason: "Alta demanda según historial",
    suggestion: "3x2 para aumentar volumen",
    urgency: "Media",
    potentialSales: "$1,280",
    rotation: "Alta demanda en temporada"
  }
];

export function StoreDashboard() {
  return (
    <main className="relative min-h-screen pb-20">
      {/* Fondo atmosférico consistente */}
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
          <Card>
            <CardHeader className="pb-1">
              <h1 className="text-2xl font-semibold text-[#1a8a0a]">Panel</h1>
              <p className="text-sm text-gray-600">Tienda La Esquina - Dashboard</p>
            </CardHeader>
          </Card>
        </motion.div>

        {/* KPIs */}
        <motion.div className="grid grid-cols-2 gap-3 sm:gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
          {[{
            label: 'Ventas del Mes', value: currency(127400), icon: DollarSign, trend: '+12%'
          }, {
            label: 'Productos en Stock', value: '245', icon: Package, trend: '-3'
          }, {
            label: 'Pedidos del Mes', value: '156', icon: TrendingUp, trend: '+8%'
          }, {
            label: 'Ticket Promedio', value: currency(817), icon: Receipt, trend: '+5%'
          }].map((kpi, idx) => (
            <Card key={kpi.label} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-[#FFBA49] font-medium">{kpi.label}</div>
                  <div className="text-lg sm:text-xl font-semibold text-[#1a8a0a]">{kpi.value}</div>
                  <div className="text-xs mt-1 text-gray-500">Tendencia: {kpi.trend}</div>
                </div>
                <kpi.icon className="text-[#29BF12]" size={20} />
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Ventas de la Semana + Rendimiento por Categoría */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-2">
              <div className="text-sm font-semibold text-[#1a8a0a]">Ventas de la Semana</div>
            </CardHeader>
            <CardContent>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData} margin={{ left: -16, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: any) => currency(Number(v))} />
                    <Bar dataKey="ventas" fill="#29BF12" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="text-sm font-semibold text-[#1a8a0a]">Rendimiento por Categoría</div>
            </CardHeader>
            <CardContent className="space-y-3">
              {productPerformance.map((c) => (
                <div key={c.product}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-700">{c.product}</span>
                    <span className="text-[#FFBA49] font-medium">{c.ventas}%</span>
                  </div>
                  <Progress value={c.ventas} />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Bajo stock */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
          <Card>
            <CardHeader className="pb-2 flex items-center gap-2">
              <AlertCircle className="text-[#FFBA49]" size={18} />
              <div className="text-sm font-semibold text-[#1a8a0a]">Productos con Bajo Stock</div>
            </CardHeader>
            <CardContent className="space-y-2">
              {lowStockItems.map((p) => (
                <div key={p.name} className="flex items-center justify-between rounded-xl border border-white/50 bg-white/70 p-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-600">Actual: {p.stock} · Mínimo: {p.min}</div>
                  </div>
                  <button className="h-9 px-3 rounded-lg bg-[#29BF12] text-white text-sm shadow-md">Reordenar</button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Promociones sugeridas por IA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card>
            <CardHeader className="pb-1 flex items-center gap-2">
              <Sparkles className="text-[#29BF12]" size={18} />
              <div>
                <div className="text-sm font-semibold text-[#1a8a0a]">Promociones Sugeridas por IA</div>
                <div className="text-xs text-gray-600">Basadas en rotación y demanda</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestedPromotions.map((sp) => (
                <div key={sp.product} className="relative p-3 rounded-xl border border-white/60 bg-white/80">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-gray-900">{sp.product}</div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${sp.urgency === 'Alta' ? 'bg-gradient-to-r from-[#29BF12] to-[#FFBA49]' : 'bg-[#29BF12]'}`}>{sp.urgency}</span>
                      </div>
                      <div className="text-xs text-gray-700">{sp.reason}</div>
                      <div className="text-xs text-[#1a8a0a] font-medium">{sp.suggestion}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock size={14} className="text-[#29BF12]" />
                        <span>{sp.rotation}</span>
                      </div>
                      <div className="text-xs text-gray-700">Ventas potenciales: <span className="font-semibold text-[#1a8a0a]">{sp.potentialSales}</span></div>
                    </div>
                    <button className="h-9 px-3 rounded-lg bg-gradient-to-r from-[#29BF12] to-[#FFBA49] text-white text-sm shadow-md">Aplicar</button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Promociones activas y tendencia */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
          <Card>
            <CardHeader className="pb-2">
              <div className="text-sm font-semibold text-[#1a8a0a]">Promociones Activas</div>
            </CardHeader>
            <CardContent className="space-y-2">
              {activePromotions.map((ap) => (
                <div key={ap.name} className="flex items-center justify-between rounded-xl border border-white/50 bg-white/70 p-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{ap.name}</div>
                    <div className="text-xs text-gray-600">Termina en {ap.end}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#29BF12] text-white">{ap.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="text-sm font-semibold text-[#1a8a0a]">Tendencia de Ventas (30 días)</div>
            </CardHeader>
            <CardContent>
              <div style={{ height: 150 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData} margin={{ left: -16, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: any) => currency(Number(v))} />
                    <Line type="monotone" dataKey="ventas" stroke="#29BF12" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
