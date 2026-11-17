import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Wallet,
  Heart,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
  Copy,
  Search,
  SlidersHorizontal,
  X,
  ExternalLink,
  ChevronRight,
  Flame,
  Zap,
  Layers,
  Code2,
} from 'lucide-react';
import { useREA } from '../../context/REAContext';
import heroImg from '../../assets/images/neonmorphic_hero_1794400925994.jpg';

interface Artwork {
  id: string;
  name: string;
  priceEth: number;
  highestBid?: string;
  likes: number;
  isLiked?: boolean;
  category: string;
  badge?: string;
  visualType: 'cyber_mask' | 'skull' | 'acid' | 'monocular' | 'horns' | 'moon' | 'spiderman' | 'deadpool' | 'white_eye' | 'spinal';
  accentColor: string;
}

export const NeonmorphicClone: React.FC = () => {
  const { setIsDeepImproveModalOpen, isClone100PercentUpgraded } = useREA();

  // Navigation & Wallet State
  const [activeNav, setActiveNav] = useState('Home');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState(24.85);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Bidding & Interaction State
  const [selectedArtworkForBid, setSelectedArtworkForBid] = useState<Artwork | null>(null);
  const [bidAmount, setBidAmount] = useState('1.8');
  const [isBidPlacedToast, setIsBidPlacedToast] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newNftName, setNewNftName] = useState('');
  const [newNftPrice, setNewNftPrice] = useState('1.5');

  // Countdown timer for Today's Highest Bid (ticking down)
  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 3,
    minutes: 11,
    seconds: 43,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Highest Live Bid items (matching the top row of the screenshot)
  const [liveBids, setLiveBids] = useState<Artwork[]>([
    {
      id: 'live-1',
      name: 'Liy Face',
      priceEth: 1.6,
      likes: 4210,
      category: 'Cyberpunk',
      badge: 'Ending Soon',
      visualType: 'cyber_mask',
      accentColor: '#ec4899',
    },
    {
      id: 'live-2',
      name: 'Skull Diy sky',
      priceEth: 2.5,
      likes: 6830,
      category: '3D Art',
      badge: 'Hot Bid',
      visualType: 'skull',
      accentColor: '#8b5cf6',
    },
    {
      id: 'live-3',
      name: 'Evil Acid',
      priceEth: 7.1,
      likes: 12450,
      category: 'Creatures',
      badge: 'Top Tier',
      visualType: 'acid',
      accentColor: '#06b6d4',
    },
  ]);

  // Explore Art Work items (matching the 8 cards in the uploaded design)
  const [exploreArtworks, setExploreArtworks] = useState<Artwork[]>([
    {
      id: 'art-1',
      name: 'Monocular',
      priceEth: 3.4,
      likes: 54300,
      isLiked: false,
      category: 'Cyberpunk',
      visualType: 'monocular',
      accentColor: '#f59e0b',
    },
    {
      id: 'art-2',
      name: 'Horns Mask',
      priceEth: 2.9,
      likes: 32400,
      isLiked: false,
      category: 'Masks',
      visualType: 'horns',
      accentColor: '#ef4444',
    },
    {
      id: 'art-3',
      name: 'Light Moon',
      priceEth: 4.1,
      likes: 68400,
      isLiked: false,
      category: 'Sci-Fi',
      visualType: 'moon',
      accentColor: '#38bdf8',
    },
    {
      id: 'art-4',
      name: 'Skull Wire',
      priceEth: 5.8,
      likes: 74900,
      isLiked: false,
      category: 'Bio-Mech',
      visualType: 'skull',
      accentColor: '#e11d48',
    },
    {
      id: 'art-5',
      name: 'Spiderman',
      priceEth: 8.5,
      likes: 24600,
      isLiked: false,
      category: 'Heroes',
      visualType: 'spiderman',
      accentColor: '#ef4444',
    },
    {
      id: 'art-6',
      name: 'Deadpool',
      priceEth: 6.2,
      likes: 58700,
      isLiked: false,
      category: 'Heroes',
      visualType: 'deadpool',
      accentColor: '#dc2626',
    },
    {
      id: 'art-7',
      name: 'White Eye',
      priceEth: 3.8,
      likes: 45700,
      isLiked: false,
      category: 'Futuristic',
      visualType: 'white_eye',
      accentColor: '#a855f7',
    },
    {
      id: 'art-8',
      name: 'Plastic Spinal',
      priceEth: 4.6,
      likes: 56600,
      isLiked: false,
      category: 'Anatomy',
      visualType: 'spinal',
      accentColor: '#0ea5e9',
    },
  ]);

  // Toggle favorite / like
  const toggleLike = (id: string) => {
    setExploreArtworks((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              isLiked: !item.isLiked,
              likes: item.isLiked ? item.likes - 1 : item.likes + 1,
            }
          : item
      )
    );
  };

  // Connect simulated Web3 Wallet
  const handleConnectWallet = (provider: string) => {
    setIsWalletConnected(true);
    setWalletAddress('0x71C...49b2');
    setIsWalletModalOpen(false);
  };

  // Place bid handler
  const handleConfirmBid = () => {
    if (!selectedArtworkForBid) return;
    const bidNum = parseFloat(bidAmount);
    if (isNaN(bidNum) || bidNum <= selectedArtworkForBid.priceEth) {
      alert(`Please enter a bid higher than ${selectedArtworkForBid.priceEth} ETH`);
      return;
    }

    // Update the artwork bid
    setLiveBids((prev) =>
      prev.map((item) =>
        item.id === selectedArtworkForBid.id ? { ...item, priceEth: bidNum } : item
      )
    );
    setExploreArtworks((prev) =>
      prev.map((item) =>
        item.id === selectedArtworkForBid.id ? { ...item, priceEth: bidNum } : item
      )
    );

    setSelectedArtworkForBid(null);
    setIsBidPlacedToast(true);
    setTimeout(() => setIsBidPlacedToast(false), 4000);
  };

  // Render stylized SVG visual artwork matching the theme
  const renderArtworkVisual = (type: Artwork['visualType'], name: string) => {
    switch (type) {
      case 'cyber_mask':
        return (
          <div className="w-full h-full bg-gradient-to-b from-[#180a2b] to-[#0a0518] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(236,72,153,0.35),transparent_70%)]" />
            <div className="w-24 h-28 rounded-2xl border-2 border-pink-500/60 bg-[#120a22]/80 backdrop-blur-sm flex flex-col items-center justify-center relative shadow-lg shadow-pink-500/30">
              <div className="w-14 h-3 bg-pink-500/80 rounded-full mb-3 shadow-[0_0_12px_#ec4899]" />
              <div className="w-10 h-1 bg-cyan-400/80 rounded-full mb-2" />
              <div className="flex gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
              </div>
            </div>
          </div>
        );
      case 'skull':
        return (
          <div className="w-full h-full bg-gradient-to-b from-[#1a0f2e] to-[#070314] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.35),transparent_70%)]" />
            <div className="relative flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-purple-400/70 bg-[#150e28] flex items-center justify-center shadow-lg shadow-purple-500/40">
                <div className="flex gap-4">
                  <div className="w-4 h-4 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee]" />
                  <div className="w-4 h-4 rounded-full bg-pink-400 shadow-[0_0_10px_#f472b6]" />
                </div>
              </div>
              <div className="w-10 h-5 bg-purple-500/40 rounded-b-lg border border-purple-400/50 mt-1" />
            </div>
          </div>
        );
      case 'acid':
        return (
          <div className="w-full h-full bg-gradient-to-b from-[#0a1e28] to-[#030e14] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.35),transparent_70%)]" />
            <div className="w-24 h-24 rounded-full border-2 border-cyan-400/80 bg-[#051922] flex items-center justify-center shadow-lg shadow-cyan-500/40 relative">
              <div className="w-16 h-16 rounded-full border border-emerald-400/50 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee]" />
              </div>
              <div className="absolute -bottom-2 text-[10px] font-mono tracking-widest text-cyan-300 bg-black/60 px-2 py-0.5 rounded-full border border-cyan-500/40">
                ACID-01
              </div>
            </div>
          </div>
        );
      case 'monocular':
        return (
          <div className="w-full h-full bg-gradient-to-b from-[#241a0d] to-[#0c0803] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
            <div className="w-24 h-24 rounded-2xl border-2 border-amber-500/60 bg-[#171008] flex items-center justify-center relative shadow-lg shadow-amber-500/20">
              <div className="w-14 h-14 rounded-full border-2 border-amber-400/80 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-amber-400 shadow-[0_0_14px_#f59e0b]" />
              </div>
            </div>
          </div>
        );
      case 'horns':
        return (
          <div className="w-full h-full bg-gradient-to-b from-[#250d15] to-[#0e0408] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
            <div className="w-20 h-24 rounded-xl border-2 border-rose-500/60 bg-[#17080e] flex flex-col items-center justify-center relative shadow-lg shadow-rose-500/30">
              <div className="flex justify-between w-14 mb-2">
                <div className="w-3 h-5 bg-rose-500 rounded-tl-full" />
                <div className="w-3 h-5 bg-rose-500 rounded-tr-full" />
              </div>
              <div className="w-10 h-8 rounded-lg bg-black/70 border border-rose-400/50 flex items-center justify-center">
                <div className="w-5 h-1 bg-rose-400 shadow-[0_0_8px_#f43f5e]" />
              </div>
            </div>
          </div>
        );
      case 'moon':
        return (
          <div className="w-full h-full bg-gradient-to-b from-[#0d1e2c] to-[#040a10] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
            <div className="w-24 h-24 rounded-full border-2 border-sky-400/70 bg-[#091622] flex items-center justify-center relative shadow-lg shadow-sky-500/30">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-400 shadow-[0_0_20px_#38bdf8] opacity-80" />
            </div>
          </div>
        );
      case 'spiderman':
        return (
          <div className="w-full h-full bg-gradient-to-b from-[#2e0e13] to-[#0d0305] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
            <div className="w-20 h-24 rounded-2xl border-2 border-red-500/70 bg-[#1f090d] flex items-center justify-center shadow-lg shadow-red-600/30">
              <div className="flex gap-3">
                <div className="w-4 h-8 bg-white rounded-tr-2xl rounded-bl-2xl border-2 border-black rotate-12 shadow-[0_0_8px_#fff]" />
                <div className="w-4 h-8 bg-white rounded-tl-2xl rounded-br-2xl border-2 border-black -rotate-12 shadow-[0_0_8px_#fff]" />
              </div>
            </div>
          </div>
        );
      case 'deadpool':
        return (
          <div className="w-full h-full bg-gradient-to-b from-[#2b0808] to-[#0c0202] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
            <div className="w-20 h-24 rounded-2xl border-2 border-red-600/70 bg-[#1c0505] flex items-center justify-center shadow-lg shadow-red-700/30">
              <div className="w-14 h-14 rounded-full bg-red-700 border-2 border-black flex items-center justify-center gap-2">
                <div className="w-3 h-5 bg-black rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <div className="w-3 h-5 bg-black rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>
            </div>
          </div>
        );
      case 'white_eye':
        return (
          <div className="w-full h-full bg-gradient-to-b from-[#1c122c] to-[#07040e] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
            <div className="w-22 h-22 rounded-full border-2 border-purple-400/70 bg-[#120a1f] flex items-center justify-center shadow-lg shadow-purple-600/30">
              <div className="w-12 h-12 rounded-full bg-white shadow-[0_0_20px_#fff] flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-purple-900" />
              </div>
            </div>
          </div>
        );
      case 'spinal':
      default:
        return (
          <div className="w-full h-full bg-gradient-to-b from-[#0a1e28] to-[#02090e] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
            <div className="flex flex-col items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-12 h-2.5 rounded-full bg-cyan-400/80 border border-cyan-300 shadow-[0_0_8px_#22d3ee]"
                  style={{ width: `${14 + i * 4}px` }}
                />
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#07060e] text-slate-100 min-h-screen selection:bg-pink-500 selection:text-white relative">
      {/* Background Ambient Glows (matching the dark neonmorphic cyberpunk palette) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-pink-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-purple-700/15 rounded-full blur-[130px]" />
        <div className="absolute bottom-10 right-10 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Reconstructed Banner Notification */}
      <div className="relative z-20 bg-gradient-to-r from-purple-950/80 via-pink-950/60 to-purple-950/80 border-b border-purple-800/30 px-4 py-2 flex items-center justify-between text-xs backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500" />
          </span>
          <span className="font-semibold text-pink-300">Clean-Room Reconstructed</span>
          <span className="text-slate-400 hidden sm:inline">
            — Exact replica of user uploaded design: NEONMORPHIC Market for Creators
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Button to use and improve an already cloned app */}
          <button
            onClick={() => setIsDeepImproveModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all border active:scale-95 cursor-pointer ${
              isClone100PercentUpgraded
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-400/50 shadow-md shadow-pink-600/30 animate-pulse hover:animate-none'
            }`}
            title="Extract hidden contracts, vector shaders, and achieve 100% replication"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isClone100PercentUpgraded ? '✨ 100% Upgraded' : '✨ Improve Clone (100% Mode)'}</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText('https://github.com/clean-room/neonmorphic');
              setCopiedCode(true);
              setTimeout(() => setCopiedCode(false), 2000);
            }}
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedCode ? 'Copied' : 'Share Clone'}</span>
          </button>
        </div>
      </div>

      {/* NEONMORPHIC NAVIGATION HEADER */}
      <header className="relative z-20 px-6 lg:px-12 py-5 flex items-center justify-between border-b border-slate-800/40 backdrop-blur-md">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <span className="font-mono tracking-widest text-xl font-black bg-gradient-to-r from-pink-500 via-rose-400 to-white bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]">
            NEON<span className="text-white">MORPHIC</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {['Home', 'Explore', 'Create', 'Contact', 'Blog'].map((nav) => (
            <button
              key={nav}
              onClick={() => {
                setActiveNav(nav);
                if (nav === 'Create') setIsCreateModalOpen(true);
              }}
              className={`transition-colors relative py-1 ${
                activeNav === nav
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {nav}
              {activeNav === nav && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Connect Wallet Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="px-5 py-2 rounded-full border border-pink-500/80 bg-pink-500/10 hover:bg-pink-500/25 text-pink-200 text-xs font-semibold tracking-wider transition-all duration-300 shadow-[0_0_18px_rgba(236,72,153,0.35)] hover:shadow-[0_0_24px_rgba(236,72,153,0.55)] active:scale-95 flex items-center gap-2"
          >
            <Wallet className="w-3.5 h-3.5 text-pink-400" />
            <span>{isWalletConnected ? `${walletAddress} (${walletBalance} ETH)` : 'Connect wallet'}</span>
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline, Actions, Stats & Live Bid Card */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                M A R K E T P L A C E &nbsp; F O R
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none font-mono">
                CREATORS
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
                NFTs Marketplace brings together artists, creators and crypto enthusiasts on a single platform to create and explore top NFTs.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('explore-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-7 py-2.5 rounded-full border border-slate-700 bg-[#0d091a] hover:bg-slate-800 text-white text-xs font-semibold tracking-wide transition-all shadow-md active:scale-95"
              >
                Explore
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 hover:brightness-110 text-white text-xs font-semibold tracking-wide transition-all shadow-[0_0_20px_rgba(236,72,153,0.4)] flex items-center gap-1.5 active:scale-95"
              >
                <span>Create NFT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* "Today's Highest Bid" Glassmorphic Card with Live Countdown */}
            <div className="pt-6">
              <div className="text-[11px] font-mono text-slate-400 mb-2">Today's Highest Bid</div>
              <div className="p-4 rounded-2xl bg-[#130f24]/80 border border-purple-900/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-purple-950/20 max-w-lg">
                {/* Current Bid Eth */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center">
                    <span className="font-bold text-sm text-purple-300">Ξ</span>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Current Bid</div>
                    <div className="text-xs sm:text-sm font-bold text-white font-mono">
                      15.50 ETH <span className="text-slate-400 font-normal">= $23,932.31 USD</span>
                    </div>
                  </div>
                </div>

                {/* Live Countdown Timer Badges */}
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center bg-[#1b1433] px-2.5 py-1.5 rounded-lg border border-purple-800/40 min-w-10">
                    <span className="text-xs font-bold text-white font-mono">{String(timeLeft.days).padStart(2, '0')}</span>
                    <span className="text-[8px] text-slate-400 uppercase">Days</span>
                  </div>
                  <div className="flex flex-col items-center bg-[#1b1433] px-2.5 py-1.5 rounded-lg border border-purple-800/40 min-w-10">
                    <span className="text-xs font-bold text-white font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[8px] text-slate-400 uppercase">Hours</span>
                  </div>
                  <div className="flex flex-col items-center bg-[#1b1433] px-2.5 py-1.5 rounded-lg border border-purple-800/40 min-w-10">
                    <span className="text-xs font-bold text-white font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[8px] text-slate-400 uppercase">Minutes</span>
                  </div>
                  <div className="flex flex-col items-center bg-[#1b1433] px-2.5 py-1.5 rounded-lg border border-purple-800/40 min-w-10">
                    <span className="text-xs font-bold text-pink-400 font-mono animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="text-[8px] text-slate-400 uppercase">Seconds</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Futuristic Portrait with Floating Badges */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* Ambient Background Aura */}
            <div className="absolute w-[360px] h-[460px] bg-gradient-to-tr from-pink-600/30 via-purple-600/30 to-cyan-500/20 rounded-full blur-3xl -z-10" />

            {/* Main Hero Card Container */}
            <div className="relative rounded-3xl overflow-hidden border border-pink-500/30 shadow-2xl shadow-pink-950/50 bg-[#120a22]/70 backdrop-blur-sm max-w-[420px] w-full">
              <img
                src={heroImg}
                alt="Neonmorphic Hero Cyberpunk Creator"
                className="w-full h-[520px] object-cover object-center hover:scale-105 transition-transform duration-700"
              />

              {/* Floating Stat Pill 1: 50000+ Creators */}
              <div className="absolute top-1/2 left-4 -translate-y-6 bg-[#160e2b]/85 border border-purple-500/50 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-lg shadow-purple-950/60 text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>50000+ Creators</span>
              </div>

              {/* Floating Stat Pill 2: 100% Authenticity */}
              <div className="absolute top-16 right-4 bg-[#160e2b]/85 border border-pink-500/50 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-lg shadow-pink-950/60 text-xs font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>100% Authenticity</span>
              </div>

              {/* Floating Stat Pill 3: 5k+ NFTs Stored */}
              <div className="absolute bottom-20 right-4 bg-[#160e2b]/85 border border-purple-500/50 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-lg shadow-purple-950/60 text-xs font-semibold text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-300" />
                <span>5k+ NFTs Stored</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: HIGHEST LIVE BID */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-10">
        <div className="bg-[#120c24]/70 border border-purple-900/30 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">Highest Live Bid</h2>
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
            </div>
            <button className="text-xs text-slate-400 hover:text-white transition-colors font-medium">
              See All
            </button>
          </div>

          {/* 3 Live Bid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {liveBids.map((item) => (
              <div
                key={item.id}
                className="bg-[#16102c]/80 rounded-2xl p-4 border border-purple-800/30 hover:border-pink-500/50 transition-all duration-300 group flex flex-col justify-between"
              >
                {/* Artwork Canvas / Visual */}
                <div className="w-full h-48 rounded-xl overflow-hidden mb-4 relative">
                  {renderArtworkVisual(item.visualType, item.name)}
                  {item.badge && (
                    <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md border border-purple-500/40 text-pink-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="font-bold text-white text-sm">{item.name}</span>
                  <div className="flex items-center gap-1 text-xs font-mono font-semibold text-cyan-300">
                    <span>Ξ</span>
                    <span>{item.priceEth} ETH</span>
                  </div>
                </div>

                {/* Place Bid Button */}
                <button
                  onClick={() => {
                    setSelectedArtworkForBid(item);
                    setBidAmount(String((item.priceEth + 0.1).toFixed(2)));
                  }}
                  className="w-full py-2.5 rounded-xl border border-purple-500/60 bg-purple-600/15 hover:bg-pink-600/30 text-purple-200 hover:text-white text-xs font-semibold tracking-wide transition-all shadow-[0_0_12px_rgba(168,85,247,0.2)] active:scale-98"
                >
                  Place Bid
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: EXPLORE ART WORK */}
      <section id="explore-section" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Explore Art Work</h2>
            <p className="text-xs text-slate-400 mt-1">Discover trending NFT collections curated across the metaverse</p>
          </div>
          <button className="text-xs text-slate-400 hover:text-white transition-colors font-medium">
            See All
          </button>
        </div>

        {/* 8 Artwork Cards Grid (matching bottom section of the uploaded screenshot) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {exploreArtworks.map((item) => (
            <div
              key={item.id}
              className="bg-[#140e26]/80 rounded-2xl p-4 border border-purple-900/35 hover:border-pink-500/50 transition-all duration-300 group flex flex-col justify-between shadow-lg"
            >
              {/* Artwork Container */}
              <div className="w-full h-44 rounded-xl overflow-hidden mb-3.5 relative">
                {renderArtworkVisual(item.visualType, item.name)}
              </div>

              {/* Card Meta: Title & Likes */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-semibold text-white text-xs sm:text-sm truncate mr-2">
                  {item.name}
                </span>
                <button
                  onClick={() => toggleLike(item.id)}
                  className={`flex items-center gap-1 text-[11px] font-mono transition-colors ${
                    item.isLiked ? 'text-pink-400' : 'text-slate-400 hover:text-pink-300'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${item.isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
                  <span>{(item.likes / 1000).toFixed(1)}k</span>
                </button>
              </div>

              {/* Price & Place Bid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>Price</span>
                  <span className="font-mono text-cyan-300 font-semibold">{item.priceEth} ETH</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedArtworkForBid(item);
                    setBidAmount(String((item.priceEth + 0.1).toFixed(2)));
                  }}
                  className="w-full py-2 rounded-xl border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 hover:text-white text-xs font-semibold transition-all active:scale-98"
                >
                  Place Bid
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL 1: PLACE BID MODAL */}
      {selectedArtworkForBid && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#150f29] border border-pink-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedArtworkForBid(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
              <h3 className="text-base font-bold text-white">Place a Bid</h3>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e091e] border border-purple-900/40 mb-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                {renderArtworkVisual(selectedArtworkForBid.visualType, selectedArtworkForBid.name)}
              </div>
              <div>
                <div className="text-sm font-bold text-white">{selectedArtworkForBid.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Current minimum: <span className="text-cyan-300 font-mono font-semibold">{selectedArtworkForBid.priceEth} ETH</span>
                </div>
              </div>
            </div>

            {/* Input field */}
            <div className="space-y-2 mb-5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Your Bid (ETH)</span>
                <span>Balance: {walletBalance} ETH</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full bg-[#0d081c] border border-purple-500/50 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pink-500"
                />
                <span className="absolute right-4 top-3 text-xs font-mono text-purple-300">ETH</span>
              </div>

              {/* Quick Bid Increment Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {[0.1, 0.5, 1.0].map((inc) => (
                  <button
                    key={inc}
                    onClick={() => setBidAmount(String((parseFloat(bidAmount || '0') + inc).toFixed(2)))}
                    className="flex-1 py-1 rounded-lg bg-purple-900/30 hover:bg-purple-900/60 border border-purple-700/40 text-[11px] text-purple-200 transition-colors"
                  >
                    +{inc} ETH
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm button */}
            <button
              onClick={handleConfirmBid}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:brightness-110 text-white font-semibold text-xs tracking-wider shadow-lg shadow-pink-600/30 transition-all active:scale-98"
            >
              Confirm & Submit Bid
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: CONNECT WALLET */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#140e26] border border-purple-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setIsWalletModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Connect Web3 Wallet</h3>
            <p className="text-xs text-slate-400 mb-5">Select your preferred cryptocurrency wallet to trade NFTs</p>

            <div className="space-y-2.5">
              {[
                { name: 'MetaMask', icon: '🦊', desc: 'Popular browser extension' },
                { name: 'Coinbase Wallet', icon: '🔵', desc: 'Fast mobile & web wallet' },
                { name: 'Phantom', icon: '👻', desc: 'Solana & Multi-chain support' },
                { name: 'WalletConnect', icon: '⚡', desc: 'Scan QR with any mobile wallet' },
              ].map((w) => (
                <button
                  key={w.name}
                  onClick={() => handleConnectWallet(w.name)}
                  className="w-full p-3 rounded-xl bg-[#0e091e] border border-purple-900/40 hover:border-pink-500/60 flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{w.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">
                        {w.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{w.desc}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE NFT */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#140e26] border border-purple-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Mint & List New NFT</h3>
            <p className="text-xs text-slate-400 mb-5">Upload digital art or create an on-chain collectible</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1.5 font-medium">Artwork Name</label>
                <input
                  type="text"
                  placeholder="e.g. Cyber Cyberpunk Mask #42"
                  value={newNftName}
                  onChange={(e) => setNewNftName(e.target.value)}
                  className="w-full bg-[#0d081c] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1.5 font-medium">Starting Price (ETH)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newNftPrice}
                  onChange={(e) => setNewNftPrice(e.target.value)}
                  className="w-full bg-[#0d081c] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="p-4 rounded-xl border border-dashed border-purple-700/50 bg-[#0d081c] text-center">
                <Sparkles className="w-6 h-6 text-pink-400 mx-auto mb-1.5" />
                <div className="text-xs text-slate-300 font-medium">Artwork preview will generate automatically</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Supports PNG, JPG, GIF up to 50MB</div>
              </div>

              <button
                onClick={() => {
                  if (!newNftName.trim()) {
                    alert('Please enter an artwork name');
                    return;
                  }
                  const newArt: Artwork = {
                    id: `art-${Date.now()}`,
                    name: newNftName,
                    priceEth: parseFloat(newNftPrice) || 1.5,
                    likes: 1200,
                    category: 'Cyberpunk',
                    visualType: 'cyber_mask',
                    accentColor: '#ec4899',
                  };
                  setExploreArtworks((prev) => [newArt, ...prev]);
                  setIsCreateModalOpen(false);
                  setNewNftName('');
                  setIsBidPlacedToast(true);
                  setTimeout(() => setIsBidPlacedToast(false), 3000);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:brightness-110 text-white font-semibold text-xs tracking-wider shadow-md transition-all active:scale-98"
              >
                Mint & Publish to Marketplace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {isBidPlacedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#120a22] border border-pink-500 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-7 h-7 rounded-full bg-pink-500/20 border border-pink-500 flex items-center justify-center">
            <Check className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Action Confirmed!</div>
            <div className="text-[11px] text-slate-300">Transaction recorded successfully on-chain.</div>
          </div>
        </div>
      )}
    </div>
  );
};
