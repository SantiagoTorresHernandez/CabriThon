import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import svgPaths from "../imports/svg-wo6k4hq2bk";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function Logo() {
  return (
    <div
      className="max-w-full"
      style={{ width: "clamp(120px, 24vw, 220px)", height: "auto" }}
      data-name="Logo"
    >
      <svg className="block w-full h-auto" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 334 113">
        <g id="Logo">
          <g id="Vector">
            <path d={svgPaths.pfa8f670} fill="#29BF12" />
            <path d={svgPaths.p195d1480} fill="#29BF12" />
            <path d={svgPaths.p55f0880} fill="#29BF12" />
            <path d={svgPaths.p30278680} fill="#29BF12" />
            <path d={svgPaths.p3dab7760} fill="url(#paint0_radial_1_16)" />
            <path d={svgPaths.p10e97d00} fill="url(#paint1_linear_1_16)" />
          </g>
        </g>
        <defs>
          <radialGradient cx="0" cy="0" gradientTransform="translate(167 10.2965) rotate(90) scale(118.41 303.237)" gradientUnits="userSpaceOnUse" id="paint0_radial_1_16" r="1">
            <stop stopColor="#FFBA49" />
            <stop offset="1" stopColor="#29BF12" />
          </radialGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_16" x1="55.2351" x2="55.2351" y1="82.8527" y2="111.95">
            <stop stopColor="#228A12" />
            <stop offset="1" stopColor="#29BF12" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function FloatingLeaf({ index }: { index: number }) {
  // Dense, all-around positions for desktop/tablet
  const desktopPositions = [
    { left: "2%", top: "6%", rotation: 12 },
    { left: "12%", top: "18%", rotation: -18 },
    { left: "6%", top: "42%", rotation: 8 },
    { left: "4%", top: "78%", rotation: -26 },
    { left: "20%", top: "8%", rotation: 20 },
    { left: "22%", top: "85%", rotation: 32 },
    { left: "36%", top: "10%", rotation: -10 },
    { left: "40%", top: "88%", rotation: 18 },
    { left: "58%", top: "8%", rotation: -22 },
    { left: "62%", top: "86%", rotation: 14 },
    { left: "78%", top: "12%", rotation: -16 },
    { left: "82%", top: "40%", rotation: -8 },
    { left: "90%", top: "18%", rotation: 24 },
    { left: "92%", top: "72%", rotation: -28 },
  ];

  // Mobile: more leaves than before but kept off center content
  const mobilePositions = [
    { left: "2%", top: "6%", rotation: 12 },
    { left: "6%", top: "78%", rotation: -22 },
    { left: "92%", top: "10%", rotation: -15 },
    { left: "94%", top: "70%", rotation: 20 },
    { left: "8%", top: "42%", rotation: 10 },
    { left: "88%", top: "42%", rotation: -12 },
    { left: "4%", top: "90%", rotation: 26 },
    { left: "96%", top: "88%", rotation: -26 },
  ];

  const pos = desktopPositions[index % desktopPositions.length];
  const mobilePos = mobilePositions[index % mobilePositions.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: pos.rotation }}
      animate={{ opacity: 0.6, scale: 1, rotate: pos.rotation }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      className="absolute hidden sm:block"
      style={{ left: pos.left, top: pos.top }}
    >
      <motion.div
        animate={{ 
          y: [0, -15, 0],
          rotate: [pos.rotation, pos.rotation + 5, pos.rotation]
        }}
        transition={{ 
          duration: 3 + index * 0.3, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg width="60" height="80" viewBox="0 0 60 80" fill="none" className="sm:w-[60px] sm:h-[80px] md:w-[70px] md:h-[90px]">
          <defs>
            <linearGradient id={`leafGradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#29BF12" />
              <stop offset="100%" stopColor="#FFBA49" />
            </linearGradient>
          </defs>
          {/* Tropical leaf shape */}
          <path
            d="M30 5 C 40 10, 50 25, 52 40 C 53 50, 50 60, 45 68 C 42 72, 35 75, 30 75 C 25 75, 18 72, 15 68 C 10 60, 7 50, 8 40 C 10 25, 20 10, 30 5 Z"
            fill={`url(#leafGradient${index})`}
            opacity="0.9"
          />
          {/* Leaf vein */}
          <path d="M30 5 L 30 75" stroke="#1a8a0a" strokeWidth="1.5" opacity="0.5" />
          {/* Side veins */}
          <path d="M30 20 L 20 25" stroke="#1a8a0a" strokeWidth="1" opacity="0.3" />
          <path d="M30 20 L 40 25" stroke="#1a8a0a" strokeWidth="1" opacity="0.3" />
          <path d="M30 35 L 18 40" stroke="#1a8a0a" strokeWidth="1" opacity="0.3" />
          <path d="M30 35 L 42 40" stroke="#1a8a0a" strokeWidth="1" opacity="0.3" />
          <path d="M30 50 L 20 55" stroke="#1a8a0a" strokeWidth="1" opacity="0.3" />
          <path d="M30 50 L 40 55" stroke="#1a8a0a" strokeWidth="1" opacity="0.3" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

function MobileFloatingLeaf({ index }: { index: number }) {
  const mobilePositions = [
    { left: "2%", top: "8%", rotation: 15 },
    { left: "5%", top: "75%", rotation: -25 },
    { left: "92%", top: "12%", rotation: -15 },
    { left: "95%", top: "70%", rotation: 35 },
  ];

  const pos = mobilePositions[index % mobilePositions.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: pos.rotation }}
      animate={{ opacity: 0.4, scale: 1, rotate: pos.rotation }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      className="absolute sm:hidden"
      style={{ left: pos.left, top: pos.top }}
    >
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotate: [pos.rotation, pos.rotation + 5, pos.rotation]
        }}
        transition={{ 
          duration: 3 + index * 0.3, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg width="40" height="55" viewBox="0 0 60 80" fill="none">
          <defs>
            <linearGradient id={`leafGradientMobile${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#29BF12" />
              <stop offset="100%" stopColor="#FFBA49" />
            </linearGradient>
          </defs>
          {/* Tropical leaf shape */}
          <path
            d="M30 5 C 40 10, 50 25, 52 40 C 53 50, 50 60, 45 68 C 42 72, 35 75, 30 75 C 25 75, 18 72, 15 68 C 10 60, 7 50, 8 40 C 10 25, 20 10, 30 5 Z"
            fill={`url(#leafGradientMobile${index})`}
            opacity="0.9"
          />
          {/* Leaf vein */}
          <path d="M30 5 L 30 75" stroke="#1a8a0a" strokeWidth="1.5" opacity="0.5" />
          {/* Side veins */}
          <path d="M30 20 L 20 25" stroke="#1a8a0a" strokeWidth="1" opacity="0.3" />
          <path d="M30 20 L 40 25" stroke="#1a8a0a" strokeWidth="1" opacity="0.3" />
          <path d="M30 35 L 18 40" stroke="#1a8a0a" strokeWidth="1" opacity="0.3" />
          <path d="M30 35 L 42 40" stroke="#1a8a0a" strokeWidth="1" opacity="0.3" />
          <path d="M30 50 L 20 55" stroke="#1a8a0a" strokeWidth="1" opacity="0.3" />
          <path d="M30 50 L 40 55" stroke="#1a8a0a" strokeWidth="1" opacity="0.3" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

interface SplashLoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
}

export default function SplashLogin({ onLogin, isLoading = false }: SplashLoginProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogin(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    }
  };

  return (
    <div
      className="bg-gradient-to-br from-white via-green-50/30 to-yellow-50/30 relative min-h-screen flex items-center justify-center overflow-hidden px-3 sm:px-6 lg:px-8"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(240,253,244,0.6) 50%, rgba(254,252,232,0.6) 100%)",
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #29BF12 1px, transparent 1px),
                           radial-gradient(circle at 80% 80%, #FFBA49 1px, transparent 1px)`,
          backgroundSize: "50px 50px"
        }} />
      </div>

      {/* Floating jungle leaves - Desktop */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 14 }).map((_, i) => (
          <FloatingLeaf key={i} index={i} />
        ))}
      </div>

      {/* Floating jungle leaves - Mobile (more, but smaller) */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <MobileFloatingLeaf key={`mobile-${i}`} index={i} />
        ))}
      </div>

      {/* Logo and Login Container */}
      <div className="flex flex-col items-center gap-6 sm:gap-8 z-10 w-full max-w-md">
        {/* Logo with entrance animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: showLogin ? -16 : 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="sm:translate-y-0"
          style={{ translateY: showLogin ? "-24px" : "0px" }}
        >
          <Logo />
        </motion.div>

        {/* Login Box */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={showLogin ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="w-full max-w-[320px] sm:max-w-[360px] md:max-w-[400px]"
        >
          <div className="relative group">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-green-400/60 via-yellow-300/40 to-green-600/60 opacity-80 group-hover:opacity-100 blur-[2px] transition" style={{ pointerEvents: 'none' }} />
            <div className="relative rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md shadow-2xl ring-1 ring-black/5 p-5 sm:p-6" style={{ backgroundColor: 'rgba(255,255,255,0.75)', boxShadow: '0 20px 45px rgba(0,0,0,0.12)', borderRadius: '16px' }}>
              <div className="mb-4 sm:mb-5 text-center">
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900">Bienvenido</h2>
                <p className="text-xs sm:text-sm text-gray-600">Inicia sesión para continuar</p>
              </div>

              {error && (
                <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 border border-red-200" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs sm:text-sm">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/90 h-9 sm:h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs sm:text-sm">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/90 h-9 sm:h-10 text-sm"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-gray-600 select-none">
                    <input type="checkbox" className="h-3.5 w-3.5 rounded border-gray-300 text-[#29BF12] focus:ring-[#29BF12]" />
                    recuerdame
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 sm:h-11 text-white shadow-lg hover:opacity-95 transition"
                  style={{ background: 'linear-gradient(90deg, #29BF12 0%, #FFBA49 100%)' }}
                >
                  Iniciar sesión
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
