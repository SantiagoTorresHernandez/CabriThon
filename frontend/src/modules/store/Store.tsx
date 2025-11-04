import React, { useMemo, useState } from 'react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  suggested?: boolean;
  imageUrl: string;
}

interface CartState { [productId: string]: number }

const DATA: Product[] = [
  { id: '1', name: 'Aceite de Oliva Premium', category: 'Abarrotes', price: 145.0, stock: 24, suggested: true, imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
  { id: '2', name: 'Refresco Coca-Cola 2L', category: 'Bebidas', price: 28.0, stock: 48, suggested: true, imageUrl: 'https://images.unsplash.com/photo-1648569883125-d01072540b4c?w=400' },
  { id: '3', name: 'Galletas Marías 400g', category: 'Abarrotes', price: 32.0, stock: 36, suggested: true, imageUrl: 'https://images.unsplash.com/photo-1734018959142-cf239ce90c82?w=400' },
  { id: '4', name: 'Leche Entera 1L', category: 'Lácteos', price: 24.0, stock: 60, imageUrl: 'https://images.unsplash.com/photo-1576186726115-4d51596775d1?w=400' },
  { id: '5', name: 'Pan Integral 680g', category: 'Panadería', price: 45.0, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1598373182308-3270495d2f58?w=400' },
  { id: '6', name: 'Arroz Premium 1kg', category: 'Abarrotes', price: 38.0, stock: 48, imageUrl: 'https://images.unsplash.com/photo-1719532520316-4cc0d8886ab7?w=400' },
  { id: '7', name: 'Papas Fritas Naturales', category: 'Snacks', price: 22.0, stock: 42, imageUrl: 'https://images.unsplash.com/photo-1740993384870-0793845268e6?w=400' },
  { id: '8', name: 'Yogurt Natural 1L', category: 'Lácteos', price: 35.0, stock: 18, imageUrl: 'https://images.unsplash.com/photo-1709620044505-d7dc01c665d2?w=400' },
  { id: '9', name: 'Pasta Spaghetti 500g', category: 'Abarrotes', price: 28.0, stock: 52, imageUrl: 'https://images.unsplash.com/photo-1718043934012-380f4e72a1cf?w=400' },
  { id: '10', name: 'Jugo de Naranja 1L', category: 'Bebidas', price: 42.0, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=400' },
  { id: '11', name: 'Cereal Integral 400g', category: 'Abarrotes', price: 68.0, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1741521641159-41f82f656f75?w=400' },
  { id: '12', name: 'Café Premium 250g', category: 'Abarrotes', price: 95.0, stock: 34, imageUrl: 'https://images.unsplash.com/photo-1677443144837-e80ccaa9555f?w=400' },
];

const currency = (n: number) => `$${n.toFixed(2)}`;

const Store: React.FC = () => {
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartState>({});

  const suggested = useMemo(() => DATA.filter(p => p.suggested), []);
  const filteredAll = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DATA;
    return DATA.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [query]);

  const countItems = useMemo(() => Object.values(cart).reduce((a,b)=>a+b,0), [cart]);
  const total = useMemo(() => Object.entries(cart).reduce((sum,[id,qty]) => {
    const prod = DATA.find(p=>p.id===id); return prod ? sum + prod.price*qty : sum;
  }, 0), [cart]);

  const addToCart = (id: string, qty: number = 1) => {
    setCart(prev => ({ ...prev, [id]: Math.max(1, Math.min((prev[id]||0)+qty, DATA.find(p=>p.id===id)?.stock||999)) }));
  };
  const setQty = (id: string, qty: number) => {
    if (qty <= 0) { const { [id]:_, ...rest } = cart; setCart(rest); return; }
    const max = DATA.find(p=>p.id===id)?.stock || 999;
    setCart(prev => ({ ...prev, [id]: Math.min(qty, max) }));
  };
  const remove = (id: string) => { const { [id]:_, ...rest } = cart; setCart(rest); };

  const applySuggested = () => {
    const next: CartState = { ...cart };
    suggested.forEach(p => { next[p.id] = Math.floor(Math.random()*5)+3; });
    setCart(next);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-yellow-50/30">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="relative group">
          <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-green-400/50 via-yellow-300/40 to-green-600/50 opacity-80 group-hover:opacity-100 blur-[2px]" />
          <div className="relative bg-white/80 border rounded-xl px-4 sm:px-6 py-3 sm:py-4 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between backdrop-blur-md">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">SmartStore B2B</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
              <input
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full sm:w-80 pl-9 pr-3 h-10 rounded-lg border border-gray-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <button className="relative inline-flex items-center justify-center h-10 w-12 rounded-lg border border-gray-200 bg-white shadow-sm">
              <span className="text-lg">🛒</span>
              {countItems>0 && (
                <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5">{countItems}</span>
              )}
            </button>
          </div>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 mt-4">
          {/* Suggested Order */}
          <div className="rounded-xl p-4 sm:p-5 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm opacity-90">✨ Pedido Sugerido</div>
                <div className="text-xs opacity-80">Basado en tu historial y niveles de inventario</div>
              </div>
              <button onClick={applySuggested} className="bg-white text-[#6d28d9] rounded-lg px-3 py-2 text-sm font-medium shadow-md hover:opacity-95">
                Aplicar Pedido Sugerido
              </button>
            </div>
          </div>

          {/* Promotion */}
          <div className="rounded-lg border border-red-100 bg-[#fef2f2] text-red-700 px-4 py-3 flex items-start gap-2">
            <span className="mt-0.5">📈</span>
            <div>
              <div className="font-medium">Promoción Especial</div>
              <div className="text-sm">15% de descuento en productos de baja rotación. ¡Aprovecha!</div>
            </div>
          </div>

          {/* Recommended */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Productos Recomendados</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {suggested.map(p => (
                <div key={`rec-${p.id}`} className="group rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
                  <div className="relative h-32 overflow-hidden">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    <span className="absolute top-2 right-2 text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full">Sugerido</span>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-gray-500">{p.category}</div>
<div className="text-sm font-semibold text-gray-900 min-h-[2.5rem]" style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{p.name}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-purple-700 font-semibold">{currency(p.price)}</span>
                      <span className="text-xs text-gray-500">Disp: {p.stock}</span>
                    </div>
                    <div className="mt-2">
                      {cart[p.id] ? (
                        <div className="inline-flex items-center gap-2">
                          <button className="h-8 w-8 rounded bg-gray-100" onClick={()=>setQty(p.id, (cart[p.id]||0)-1)}>-</button>
                          <span className="text-sm w-6 text-center">{cart[p.id]}</span>
                          <button className="h-8 w-8 rounded bg-gray-100" onClick={()=>setQty(p.id, (cart[p.id]||0)+1)}>+</button>
                        </div>
                      ) : (
                        <button className="h-9 px-3 rounded-lg bg-green-600 text-white text-sm" onClick={()=>addToCart(p.id,1)}>Agregar</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* All Products */}
          <section className="pb-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Todos los Productos</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {filteredAll.map(p => (
                <div key={p.id} className="group rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
                  <div className="relative h-32 overflow-hidden">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-gray-500">{p.category}</div>
<div className="text-sm font-semibold text-gray-900 min-h-[2.5rem]" style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{p.name}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-purple-700 font-semibold">{currency(p.price)}</span>
                      <span className="text-xs text-gray-500">Disp: {p.stock}</span>
                    </div>
                    <div className="mt-2">
                      {cart[p.id] ? (
                        <div className="inline-flex items-center gap-2">
                          <button className="h-8 w-8 rounded bg-gray-100" onClick={()=>setQty(p.id, (cart[p.id]||0)-1)}>-</button>
                          <span className="text-sm w-6 text-center">{cart[p.id]}</span>
                          <button className="h-8 w-8 rounded bg-gray-100" onClick={()=>setQty(p.id, (cart[p.id]||0)+1)}>+</button>
                        </div>
                      ) : (
                        <button className="h-9 px-3 rounded-lg bg-green-600 text-white text-sm" onClick={()=>addToCart(p.id,1)}>Agregar</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Sticky Cart Summary */}
      {countItems>0 && (
        <div className="fixed left-0 right-0 bottom-16 z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between bg-white/95 backdrop-blur border border-gray-200 rounded-xl shadow-xl px-4 py-3">
<div className="text-sm font-medium text-gray-900">{countItems} artículos · Total {currency(total)}</div>
              <button className="h-10 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold">Confirmar Pedido</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Store;

