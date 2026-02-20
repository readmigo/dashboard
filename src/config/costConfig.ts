export type CostCategory = 'compute' | 'database' | 'cache' | 'storage' | 'monitoring' | 'selfHosted' | 'other';

export interface MonthlyCost {
  month: string;
  actual: number;
}

export interface ServiceCost {
  id: string;
  name: string;
  category: CostCategory;
  provider: string;
  monthlyBudget: number;
  costs: MonthlyCost[];
  url?: string;
  note?: string;
}

export interface CostConfig {
  services: ServiceCost[];
  globalMonthlyBudget: number;
  categories: { id: CostCategory; label: string; icon: string }[];
}

export const costConfig: CostConfig = {
  globalMonthlyBudget: 100,
  categories: [
    { id: 'compute', label: 'Compute', icon: 'DNS' },
    { id: 'database', label: 'Database', icon: 'Storage' },
    { id: 'cache', label: 'Cache', icon: 'Memory' },
    { id: 'storage', label: 'Storage & CDN', icon: 'CloudQueue' },
    { id: 'monitoring', label: 'Monitoring', icon: 'Monitor' },
    { id: 'selfHosted', label: 'Self-hosted', icon: 'Computer' },
    { id: 'other', label: 'Other', icon: 'MoreHoriz' },
  ],
  services: [
    {
      id: 'api-server',
      name: 'API Server',
      category: 'compute',
      provider: 'Fly.io',
      monthlyBudget: 25,
      url: 'https://fly.io/dashboard',
      costs: [
        { month: '2025-09', actual: 19.42 },
        { month: '2025-10', actual: 20.15 },
        { month: '2025-11', actual: 18.87 },
        { month: '2025-12', actual: 21.33 },
        { month: '2026-01', actual: 20.76 },
        { month: '2026-02', actual: 19.58 },
      ],
    },
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      category: 'database',
      provider: 'Neon',
      monthlyBudget: 15,
      url: 'https://console.neon.tech',
      note: 'Free tier',
      costs: [
        { month: '2025-09', actual: 0 },
        { month: '2025-10', actual: 0 },
        { month: '2025-11', actual: 0 },
        { month: '2025-12', actual: 0 },
        { month: '2026-01', actual: 0 },
        { month: '2026-02', actual: 0 },
      ],
    },
    {
      id: 'redis-cache',
      name: 'Redis Cache',
      category: 'cache',
      provider: 'Upstash',
      monthlyBudget: 20,
      url: 'https://console.upstash.com',
      costs: [
        { month: '2025-09', actual: 12.34 },
        { month: '2025-10', actual: 13.21 },
        { month: '2025-11', actual: 12.87 },
        { month: '2025-12', actual: 14.52 },
        { month: '2026-01', actual: 13.95 },
        { month: '2026-02', actual: 14.18 },
      ],
    },
    {
      id: 'object-storage',
      name: 'Object Storage',
      category: 'storage',
      provider: 'Cloudflare R2',
      monthlyBudget: 5,
      url: 'https://dash.cloudflare.com',
      costs: [
        { month: '2025-09', actual: 1.52 },
        { month: '2025-10', actual: 1.68 },
        { month: '2025-11', actual: 1.73 },
        { month: '2025-12', actual: 1.85 },
        { month: '2026-01', actual: 1.91 },
        { month: '2026-02', actual: 1.97 },
      ],
    },
    {
      id: 'cdn-dns',
      name: 'CDN & DNS',
      category: 'storage',
      provider: 'Cloudflare',
      monthlyBudget: 0,
      url: 'https://dash.cloudflare.com',
      note: 'Free plan',
      costs: [
        { month: '2025-09', actual: 0 },
        { month: '2025-10', actual: 0 },
        { month: '2025-11', actual: 0 },
        { month: '2025-12', actual: 0 },
        { month: '2026-01', actual: 0 },
        { month: '2026-02', actual: 0 },
      ],
    },
    {
      id: 'error-tracking',
      name: 'Error Tracking',
      category: 'monitoring',
      provider: 'Sentry',
      monthlyBudget: 0,
      url: 'https://sentry.io',
      note: 'Free tier',
      costs: [
        { month: '2025-09', actual: 0 },
        { month: '2025-10', actual: 0 },
        { month: '2025-11', actual: 0 },
        { month: '2025-12', actual: 0 },
        { month: '2026-01', actual: 0 },
        { month: '2026-02', actual: 0 },
      ],
    },
    {
      id: 'product-analytics',
      name: 'Product Analytics',
      category: 'monitoring',
      provider: 'PostHog',
      monthlyBudget: 0,
      note: 'Self-hosted',
      costs: [
        { month: '2025-09', actual: 0 },
        { month: '2025-10', actual: 0 },
        { month: '2025-11', actual: 0 },
        { month: '2025-12', actual: 0 },
        { month: '2026-01', actual: 0 },
        { month: '2026-02', actual: 0 },
      ],
    },
    {
      id: 'log-aggregation',
      name: 'Log Aggregation',
      category: 'monitoring',
      provider: 'Axiom',
      monthlyBudget: 0,
      url: 'https://app.axiom.co',
      note: 'Free tier',
      costs: [
        { month: '2025-09', actual: 0 },
        { month: '2025-10', actual: 0 },
        { month: '2025-11', actual: 0 },
        { month: '2025-12', actual: 0 },
        { month: '2026-01', actual: 0 },
        { month: '2026-02', actual: 0 },
      ],
    },
    {
      id: 'tts-server',
      name: 'TTS Server (PC2)',
      category: 'selfHosted',
      provider: 'Self-hosted',
      monthlyBudget: 15,
      note: 'Electricity cost',
      costs: [
        { month: '2025-09', actual: 9.80 },
        { month: '2025-10', actual: 10.45 },
        { month: '2025-11', actual: 8.92 },
        { month: '2025-12', actual: 11.20 },
        { month: '2026-01', actual: 10.85 },
        { month: '2026-02', actual: 9.63 },
      ],
    },
    {
      id: 'domain',
      name: 'Domain',
      category: 'other',
      provider: 'Cloudflare',
      monthlyBudget: 2,
      url: 'https://dash.cloudflare.com',
      note: '~$1/year',
      costs: [
        { month: '2025-09', actual: 0.08 },
        { month: '2025-10', actual: 0.08 },
        { month: '2025-11', actual: 0.08 },
        { month: '2025-12', actual: 0.08 },
        { month: '2026-01', actual: 0.08 },
        { month: '2026-02', actual: 0.08 },
      ],
    },
    {
      id: 'github-actions',
      name: 'GitHub Actions',
      category: 'other',
      provider: 'GitHub',
      monthlyBudget: 0,
      url: 'https://github.com',
      note: 'Free tier',
      costs: [
        { month: '2025-09', actual: 0 },
        { month: '2025-10', actual: 0 },
        { month: '2025-11', actual: 0 },
        { month: '2025-12', actual: 0 },
        { month: '2026-01', actual: 0 },
        { month: '2026-02', actual: 0 },
      ],
    },
  ],
};
