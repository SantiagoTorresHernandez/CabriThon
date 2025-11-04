import React, { useMemo, useState } from 'react';
import { motion } from "framer-motion";

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

// Decorative floating leaf (hidden on mobile)
function DecoLeaf({ left, top, rotation, delay = 0 }: { left: string; top: string; rotation: number; delay?: number }) {
  return (
    <div className="hidden sm:block absolute z-0" style={{ left, top, opacity: 0.15 }}>
      <motion.div
        initial={{ y: 0, rotate: rotation }}
        animate={{ y: [0, -12, 0], rotate: [rotation, rotation + 4, rotation] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
      >
        <svg width="60" height="80" viewBox="0 0 60 80" fill="none">
          <defs>
            <linearGradient id="leafGradStore" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#29BF12" />
              <stop offset="100%" stopColor="#FFBA49" />
            </linearGradient>
          </defs>
          <path d="M30 5 C 40 10, 50 25, 52 40 C 53 50, 50 60, 45 68 C 42 72, 35 75, 30 75 C 25 75, 18 72, 15 68 C 10 60, 7 50, 8 40 C 10 25, 20 10, 30 5 Z" fill="url(#leafGradStore)" />
          <path d="M30 5 L 30 75" stroke="#1a8a0a" strokeWidth="1.2" opacity="0.5" />
        </svg>
      </motion.div>
    </div>
  );
}

const Store: React.FC = () => {
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartState>({});
  const [showCart, setShowCart] = useState(false);
  const [showPromo, setShowPromo] = useState(true);

  const suggested = useMemo(() => DATA.filter(p => p.suggested), []);
  const filteredAll = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DATA;
    return DATA.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [query]);
  const isSearching = query.trim().length > 0;
  const listAll = isSearching ? filteredAll : DATA;

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
    <main className="relative min-h-screen bg-gradient-to-br from-white via-green-50/30 to-yellow-50/30">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0" aria-hidden>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #29BF12 1px, transparent 1px),
                           radial-gradient(circle at 80% 80%, #FFBA49 1px, transparent 1px)`,
          backgroundSize: "50px 50px"
        }} />
      </div>
      {/* Floating leaves */}
      <DecoLeaf left="4%" top="8%" rotation={10} />
      <DecoLeaf left="90%" top="12%" rotation={-12} delay={0.4} />
      <DecoLeaf left="8%" top="78%" rotation={18} delay={0.8} />
      <DecoLeaf left="88%" top="72%" rotation={-18} delay={1.2} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Search + Cart Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative group z-50">
          <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-[#29BF12]/40 via-[#FFBA49]/30 to-[#29BF12]/40 opacity-80 blur-[2px]" />
          <div className="relative bg-white/90 border border-white/50 rounded-xl px-4 sm:px-6 py-3 shadow-sm flex items-center justify-between gap-3 backdrop-blur-md">
            <div className="flex items-center gap-3 w-full">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
                <input
                  value={query}
                  onChange={(e)=>setQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full pl-9 pr-9 h-10 rounded-lg border border-gray-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                {query && (
                  <button
                    type="button"
                    onClick={()=>setQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 h-6 w-6 flex items-center justify-center rounded"
                    aria-label="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}

                {query.trim() && (
                  <div className="absolute left-0 right-0 mt-2 z-50">
                    <div className="rounded-lg border border-white/60 bg-white/95 backdrop-blur-md shadow-2xl divide-y max-h-72 overflow-auto">
                      {filteredAll.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-600">resultado no encontrado, cambia tu busqueda.</div>
                      ) : (
                        filteredAll.map(p => (
                          <button
                            key={`sugg-${p.id}`}
                            type="button"
                            onClick={()=>{ addToCart(p.id,1); setQuery(''); }}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left"
                          >
                            <img src={p.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                              <div className="text-xs text-gray-500 truncate">{p.category} · {currency(p.price)} · Disp: {p.stock}</div>
                            </div>
                            <span className="text-xs text-[#1a8a0a]">Agregar</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={()=>setShowCart(v=>!v)} className="relative inline-flex items-center justify-center h-10 w-12 rounded-lg border border-gray-200 bg-white shadow-sm">
                <span className="text-lg">🛒</span>
                {countItems>0 && (
                  <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5">{countItems}</span>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search Results (on top) */}
        {isSearching && (
          <motion.section className="mt-6 relative z-30" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Resultados de búsqueda</h3>
            {listAll.length === 0 ? (
              <div className="text-sm text-gray-600">No hay resultados para "{query}"</div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {listAll.map(p => (
                  <motion.div
                    key={p.id}
                    className="group rounded-lg overflow-hidden border border-gray-100 bg-white/90 backdrop-blur-sm shadow-sm"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="relative h-32 overflow-hidden">
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    </div>
                    <div className="p-3">
                      <div className="text-xs text-gray-500">{p.category}</div>
                      <div className="text-sm font-semibold text-gray-900 min-h-[2.5rem]" style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{p.name}</div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[#1a8a0a] font-semibold">{currency(p.price)}</span>
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
                          <button className="h-9 px-3 rounded-lg bg-[#29BF12] text-white text-sm" onClick={()=>addToCart(p.id,1)}>Agregar</button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        )}

        <div className="grid gap-6 sm:gap-8 mt-6 relative z-10">
          {/* Suggested Order */}
          <div className="relative group rounded-xl">
            <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-[#29BF12]/60 via-[#29BF12]/40 to-[#FFBA49]/50 opacity-80 blur-[2px]" />
            <div className="relative rounded-xl p-4 sm:p-5 bg-white/85 backdrop-blur-md text-green-900 border border-white/60 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm opacity-90">✨ Pedido Sugerido</div>
                <div className="text-xs opacity-80">Basado en tu historial y niveles de inventario</div>
              </div>
              <button onClick={applySuggested} className="bg-gradient-to-r from-[#29BF12] to-[#FFBA49] text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-md hover:opacity-95">
                Aplicar Pedido Sugerido
              </button>
            </div>
          </div>
          </div>

          {/* Promotion */}
          {showPromo && (
          <div className="relative group">
            <div className="absolute -inset-[1px] rounded-lg bg-gradient-to-br from-[#29BF12]/50 via-[#29BF12]/30 to-[#FFBA49]/40 opacity-80 blur-[2px]" />
            <div className="relative rounded-lg border border-white/60 bg-white/80 backdrop-blur-md px-4 py-3 flex items-start gap-2 text-red-700">
              <button
                type="button"
                aria-label="Ocultar promoción"
                onClick={()=>setShowPromo(false)}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
              <span className="mt-0.5">📈</span>
              <div>
                <div className="font-medium">Promoción Especial</div>
                <div className="text-sm">15% de descuento en productos de baja rotación. ¡Aprovecha!</div>
              </div>
            </div>
          </div>
          )}

          {/* Recommended */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Productos Recomendados</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {suggested.map(p => (
                <div key={`rec-${p.id}`} className="relative group rounded-lg overflow-hidden">
                  <div className="absolute -inset-[1px] rounded-lg bg-gradient-to-br from-[#29BF12]/40 via-[#29BF12]/25 to-[#FFBA49]/35 opacity-80 blur-[2px]" />
                  <div className="relative border border-white/60 bg-white/85 backdrop-blur-md shadow-sm rounded-lg overflow-hidden">
                  <div className="relative h-32 overflow-hidden">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    <span className="absolute top-2 right-2 text-[10px] bg-[#29BF12] text-white px-2 py-0.5 rounded-full">Sugerido</span>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-gray-500">{p.category}</div>
<div className="text-sm font-semibold text-gray-900 min-h-[2.5rem]" style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{p.name}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[#1a8a0a] font-semibold">{currency(p.price)}</span>
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
                        <button className="h-9 px-3 rounded-lg bg-[#29BF12] text-white text-sm" onClick={()=>addToCart(p.id,1)}>Agregar</button>
                      )}
                    </div>
                  </div>
                </div>
                </div>
              ))}
            </div>
          </section>

          {/* Todos los Productos */}
          {!isSearching ? (
            <section className="pb-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Todos los Productos</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {DATA.map(p => (
                  <div key={p.id} className="group rounded-lg overflow-hidden border border-gray-100 bg-white/90 backdrop-blur-sm shadow-sm">
                    <div className="relative h-32 overflow-hidden">
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    </div>
                    <div className="p-3">
                      <div className="text-xs text-gray-500">{p.category}</div>
                      <div className="text-sm font-semibold text-gray-900 min-h-[2.5rem]" style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{p.name}</div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[#1a8a0a] font-semibold">{currency(p.price)}</span>
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
                          <button className="h-9 px-3 rounded-lg bg-[#29BF12] text-white text-sm" onClick={()=>addToCart(p.id,1)}>Agregar</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </section>
          ) : null}
        </div>
      </div>

      {/* Sticky Cart Summary */}
      {countItems>0 && (
        <div className="fixed left-0 right-0 bottom-16 z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="relative group">
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-[#29BF12]/50 via-[#29BF12]/30 to-[#FFBA49]/40 opacity-80 blur-[2px]" />
              <div className="relative flex items-center justify-between bg-white/90 backdrop-blur border border-white/60 rounded-xl shadow-xl px-4 py-3">
                <div className="text-sm font-medium text-gray-900">{countItems} artículos · Total {currency(total)}</div>
                <button onClick={()=>setShowCart(true)} className="h-10 px-4 rounded-lg bg-gradient-to-r from-[#29BF12] to-[#FFBA49] text-white text-sm font-semibold shadow-md">Confirmar Pedido</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={()=>setShowCart(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[400px] p-4">
            <div className="relative h-full group">
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-[#29BF12]/50 via-[#29BF12]/30 to-[#FFBA49]/40 opacity-80 blur-[2px]" />
              <div className="relative h-full bg-white/85 backdrop-blur-md border border-white/60 rounded-xl shadow-2xl flex flex-col">
                <div className="p-4 border-b border-white/60 flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">Carrito</h4>
                  <button className="h-8 px-3 rounded-lg bg-gray-100" onClick={()=>setShowCart(false)}>Cerrar</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {Object.keys(cart).length===0 ? (
                    <div className="text-sm text-gray-600">Tu carrito está vacío</div>
                  ) : (
                    Object.entries(cart).map(([id, qty]) => {
                      const p = DATA.find(x=>x.id===id)!;
                      return (
                        <div key={id} className="flex items-center gap-3 border border-white/60 bg-white/70 rounded-lg p-3">
                          <img src={p.imageUrl} alt={p.name} className="h-12 w-12 rounded object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                            <div className="text-xs text-gray-500">{currency(p.price)} · Disp: {p.stock}</div>
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <button className="h-8 w-8 rounded bg-gray-100" onClick={()=>setQty(id, qty-1)}>-</button>
                            <span className="text-sm w-6 text-center">{qty}</span>
                            <button className="h-8 w-8 rounded bg-gray-100" onClick={()=>setQty(id, qty+1)}>+</button>
                          </div>
                          <button className="text-xs text-red-600" onClick={()=>remove(id)}>Quitar</button>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="p-4 border-t border-white/60 flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900">Total: {currency(total)}</div>
                  <button className="h-10 px-4 rounded-lg bg-gradient-to-r from-[#29BF12] to-[#FFBA49] text-white text-sm font-semibold shadow-md">Confirmar Pedido</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Store;

