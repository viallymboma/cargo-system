"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Package, Search, ArrowLeft, Ship } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-amber-50 flex flex-col items-center justify-center px-4 overflow-hidden relative">
      {/* Animated waves at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
        <svg
          className="absolute bottom-0 w-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            fill="#0284c7"
            fillOpacity="0.3"
            d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          >
            <animate
              attributeName="d"
              dur="10s"
              repeatCount="indefinite"
              values="
                M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z;
                M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,69.3C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z;
                M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z
              "
            />
          </path>
          <path
            fill="#0369a1"
            fillOpacity="0.5"
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,85.3C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          >
            <animate
              attributeName="d"
              dur="8s"
              repeatCount="indefinite"
              values="
                M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,85.3C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z;
                M0,48L48,53.3C96,59,192,69,288,74.7C384,80,480,80,576,74.7C672,69,768,59,864,53.3C960,48,1056,48,1152,53.3C1248,59,1344,69,1392,74.7L1440,80L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z;
                M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,85.3C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z
              "
            />
          </path>
          <path
            fill="#075985"
            d="M0,96L48,90.7C96,85,192,75,288,74.7C384,75,480,85,576,90.7C672,96,768,96,864,90.7C960,85,1056,75,1152,74.7C1248,75,1344,85,1392,90.7L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          />
        </svg>
      </div>

      {/* Flying seagulls */}
      <div className="absolute top-20 left-10 animate-bounce" style={{ animationDuration: "3s" }}>
        <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
          <path d="M0 10 Q10 0 20 10 Q30 0 40 10" stroke="#64748b" strokeWidth="2" fill="none" />
        </svg>
      </div>
      <div className="absolute top-32 right-20 animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }}>
        <svg width="30" height="15" viewBox="0 0 40 20" fill="none">
          <path d="M0 10 Q10 0 20 10 Q30 0 40 10" stroke="#64748b" strokeWidth="2" fill="none" />
        </svg>
      </div>
      <div className="absolute top-16 right-1/3 animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "0.5s" }}>
        <svg width="25" height="12" viewBox="0 0 40 20" fill="none">
          <path d="M0 10 Q10 0 20 10 Q30 0 40 10" stroke="#94a3b8" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Main content */}
      <div className="text-center z-10 max-w-2xl mx-auto">
        {/* Cargo Ship with confused sailor */}
        <div className="relative mb-8 flex justify-center">
          {/* The Cargo Ship */}
          <svg
            width="320"
            height="200"
            viewBox="0 0 320 200"
            fill="none"
            className="drop-shadow-lg"
          >
            {/* Ship hull */}
            <path
              d="M40 140 L60 180 L260 180 L280 140 L40 140Z"
              fill="#dc2626"
              stroke="#991b1b"
              strokeWidth="2"
            />
            {/* Hull stripe */}
            <path d="M50 160 L270 160" stroke="#fca5a5" strokeWidth="4" />

            {/* Ship deck */}
            <rect x="50" y="110" width="220" height="30" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />

            {/* Containers on deck */}
            <rect x="60" y="85" width="35" height="25" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" />
            <rect x="100" y="85" width="35" height="25" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
            <rect x="140" y="85" width="35" height="25" fill="#f43f5e" stroke="#be123c" strokeWidth="1.5" />
            <rect x="60" y="58" width="35" height="25" fill="#a855f7" stroke="#7e22ce" strokeWidth="1.5" />
            <rect x="100" y="58" width="35" height="25" fill="#eab308" stroke="#a16207" strokeWidth="1.5" />

            {/* Bridge/cabin */}
            <rect x="185" y="60" width="60" height="50" fill="#fafafa" stroke="#d4d4d4" strokeWidth="2" />
            <rect x="195" y="70" width="15" height="15" fill="#0ea5e9" stroke="#0284c7" strokeWidth="1" />
            <rect x="220" y="70" width="15" height="15" fill="#0ea5e9" stroke="#0284c7" strokeWidth="1" />
            <rect x="195" y="90" width="40" height="10" fill="#334155" />

            {/* Smokestack */}
            <rect x="250" y="40" width="20" height="70" fill="#64748b" stroke="#475569" strokeWidth="2" />
            <rect x="248" y="35" width="24" height="8" fill="#475569" />
            {/* Smoke puffs */}
            <circle cx="260" cy="20" r="8" fill="#d1d5db" opacity="0.7">
              <animate attributeName="cy" values="20;5;20" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="268" cy="12" r="6" fill="#e5e7eb" opacity="0.5">
              <animate attributeName="cy" values="12;-5;12" dur="3.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0.1;0.5" dur="3.5s" repeatCount="indefinite" />
            </circle>

            {/* Anchor */}
            <circle cx="70" cy="150" r="4" fill="none" stroke="#fcd34d" strokeWidth="2" />
            <path d="M70 154 L70 168 M62 162 L70 170 L78 162" stroke="#fcd34d" strokeWidth="2" fill="none" />
          </svg>

          {/* Confused Sailor */}
          <svg
            width="100"
            height="140"
            viewBox="0 0 100 140"
            fill="none"
            className="absolute -right-4 bottom-4 drop-shadow-md"
          >
            {/* Body */}
            <rect x="30" y="70" width="40" height="50" rx="5" fill="#1e3a5f" />
            {/* Collar */}
            <path d="M35 70 L50 85 L65 70" fill="#ffffff" />

            {/* Arms */}
            <rect x="15" y="75" width="15" height="8" rx="4" fill="#fcd9b6" />
            <rect x="70" y="65" width="8" height="20" rx="4" fill="#fcd9b6" transform="rotate(-30 74 75)" />

            {/* Hand scratching head */}
            <ellipse cx="78" cy="40" rx="6" ry="5" fill="#fcd9b6" />

            {/* Legs */}
            <rect x="35" y="118" width="10" height="20" fill="#1e3a5f" />
            <rect x="55" y="118" width="10" height="20" fill="#1e3a5f" />

            {/* Shoes */}
            <ellipse cx="40" cy="138" rx="8" ry="4" fill="#1f2937" />
            <ellipse cx="60" cy="138" rx="8" ry="4" fill="#1f2937" />

            {/* Head */}
            <circle cx="50" cy="40" r="25" fill="#fcd9b6" />

            {/* Hair */}
            <path d="M30 30 Q35 15 50 18 Q65 15 70 30" fill="#4a3728" />

            {/* Sailor hat */}
            <ellipse cx="50" cy="22" rx="22" ry="8" fill="#ffffff" />
            <rect x="30" y="10" width="40" height="12" fill="#ffffff" />
            <rect x="35" y="2" width="30" height="10" rx="2" fill="#ffffff" />
            <rect x="40" y="14" width="20" height="4" fill="#1e3a5f" />

            {/* Face - confused expression */}
            {/* Eyes */}
            <circle cx="42" cy="38" r="3" fill="#1f2937" />
            <circle cx="58" cy="38" r="3" fill="#1f2937" />
            {/* Eyebrows - raised in confusion */}
            <path d="M36 32 Q42 28 48 32" stroke="#4a3728" strokeWidth="2" fill="none" />
            <path d="M52 32 Q58 28 64 32" stroke="#4a3728" strokeWidth="2" fill="none" />
            {/* Mouth - confused squiggle */}
            <path d="M42 52 Q46 55 50 50 Q54 55 58 52" stroke="#9f7056" strokeWidth="2" fill="none" />

            {/* Question marks */}
            <text x="75" y="25" fill="#dc2626" fontSize="16" fontWeight="bold">?</text>
            <text x="85" y="15" fill="#f97316" fontSize="12" fontWeight="bold">?</text>

            {/* Scratch lines near hand */}
            <path d="M72 35 L76 32 M74 38 L78 35 M73 41 L77 38" stroke="#fcd9b6" strokeWidth="1" opacity="0.8" />
          </svg>
        </div>

        {/* 404 text */}
        <div className="relative mb-6">
          <h1 className="text-8xl md:text-9xl font-bold text-sky-700 tracking-tight">
            4
            <span className="inline-block">
              <Ship className="inline w-16 h-16 md:w-20 md:h-20 text-red-600 -mt-4 animate-pulse" />
            </span>
            4
          </h1>
          <p className="text-sky-600 text-lg font-medium -mt-2">Cargo Lost at Sea!</p>
        </div>

        {/* Message */}
        <div className="mb-8 space-y-2">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-800">
            Oups! Cette page a disparu en mer
          </h2>
          <p className="text-slate-600 text-lg max-w-md mx-auto">
            Notre marin a cherché partout, mais il semble que cette cargaison n'existe pas ou a été déplacée vers un autre port.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-sky-600 hover:bg-sky-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Retour à l'accueil
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-sky-600 text-sky-700 hover:bg-sky-50 shadow-md"
          >
            <Link href="/dashboard">
              <Package className="mr-2 h-5 w-5" />
              Tableau de bord
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-amber-600 text-amber-700 hover:bg-amber-50 shadow-md"
          >
            <Link href="/dashboard/tracking">
              <Search className="mr-2 h-5 w-5" />
              Suivre un colis
            </Link>
          </Button>
        </div>

        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="mt-6 text-slate-500 hover:text-slate-700 flex items-center gap-2 mx-auto transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retourner à la page précédente
        </button>
      </div>

      {/* DHL Logo watermark */}
      <div className="absolute bottom-36 left-1/2 -translate-x-1/2 text-sky-800/20 text-4xl font-bold tracking-widest">
        DHL CARGO
      </div>
    </div>
  );
}
