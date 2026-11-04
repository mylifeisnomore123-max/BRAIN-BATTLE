// Avatar and Flag metadata for Brain Battle

export interface AvatarOption {
  id: string;
  name: string;
  emoji: string;
  gradient: string;
  badge: string;
}

export const AVATARS: AvatarOption[] = [
  { id: 'cyber_ninja', name: 'Cyber Ninja', emoji: '🥷', gradient: 'from-cyan-500 to-blue-600', badge: 'Stealth' },
  { id: 'neon_cyborg', name: 'Neon Cyborg', emoji: '🤖', gradient: 'from-purple-500 to-indigo-600', badge: 'Synapse' },
  { id: 'astro_warrior', name: 'Cosmic Astromind', emoji: '👨‍🚀', gradient: 'from-sky-400 to-blue-700', badge: 'Cosmos' },
  { id: 'valkyrie', name: 'Neo Valkyrie', emoji: '⚡', gradient: 'from-amber-400 to-orange-600', badge: 'Thunder' },
  { id: 'samurai', name: 'Ronin Blade', emoji: '⚔️', gradient: 'from-red-500 to-rose-700', badge: 'Honor' },
  { id: 'hacker_fox', name: 'Cyber Fox', emoji: '🦊', gradient: 'from-orange-500 to-amber-500', badge: 'Agile' },
  { id: 'mind_overlord', name: 'Mind Overlord', emoji: '🧠', gradient: 'from-fuchsia-500 to-purple-800', badge: 'Brain' },
  { id: 'quantum_witch', name: 'Quantum Mage', emoji: '🔮', gradient: 'from-violet-500 to-purple-600', badge: 'Mystic' },
  { id: 'apex_tiger', name: 'Apex Tiger', emoji: '🐯', gradient: 'from-yellow-500 to-amber-600', badge: 'Predator' },
  { id: 'chrono_agent', name: 'Chrono Agent', emoji: '⏱️', gradient: 'from-emerald-400 to-teal-600', badge: 'Time' },
  { id: 'phoenix_core', name: 'Solar Phoenix', emoji: '🦅', gradient: 'from-rose-500 to-amber-500', badge: 'Flame' },
  { id: 'shadow_dragon', name: 'Shadow Dragon', emoji: '🐉', gradient: 'from-indigo-600 to-purple-950', badge: 'Mythic' },
];

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRIES: CountryOption[] = [
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'GLOBAL', name: 'Global / International', flag: '🌐' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
];

export function getAvatar(id: string): AvatarOption {
  return AVATARS.find((a) => a.id === id) || AVATARS[0];
}

export function getCountry(code: string): CountryOption {
  return COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];
}

export function getRankBadge(rating: number) {
  if (rating >= 2400) return { title: 'Grandmaster', color: 'text-amber-300 border-amber-400/60 bg-amber-500/10', icon: '👑' };
  if (rating >= 2000) return { title: 'Master', color: 'text-purple-300 border-purple-400/60 bg-purple-500/10', icon: '💎' };
  if (rating >= 1700) return { title: 'Diamond', color: 'text-cyan-300 border-cyan-400/60 bg-cyan-500/10', icon: '🔷' };
  if (rating >= 1450) return { title: 'Platinum', color: 'text-emerald-300 border-emerald-400/60 bg-emerald-500/10', icon: '💠' };
  if (rating >= 1200) return { title: 'Gold', color: 'text-yellow-400 border-yellow-400/60 bg-yellow-500/10', icon: '🥇' };
  if (rating >= 1000) return { title: 'Silver', color: 'text-slate-300 border-slate-400/60 bg-slate-500/10', icon: '🥈' };
  return { title: 'Bronze', color: 'text-amber-700 border-amber-800/60 bg-amber-900/10', icon: '🥉' };
}
