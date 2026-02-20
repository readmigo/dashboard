export type CostCategory = 'compute' | 'database' | 'cache' | 'storage' | 'monitoring' | 'other';

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
  sourceDoc?: string;
}

export interface CostConfig {
  services: ServiceCost[];
  globalMonthlyBudget: number;
  categories: { id: CostCategory; label: string; icon: string }[];
}

// All cost data sourced from /docs/05-operations/deployment/services/
// Last verified: 2026-02-07
export const costConfig: CostConfig = {
  globalMonthlyBudget: 400,
  categories: [
    { id: 'compute', label: 'Compute', icon: 'DNS' },
    { id: 'database', label: 'Database', icon: 'Storage' },
    { id: 'cache', label: 'Cache', icon: 'Memory' },
    { id: 'storage', label: 'Storage & CDN', icon: 'CloudQueue' },
    { id: 'monitoring', label: 'Monitoring', icon: 'Monitor' },
    { id: 'other', label: 'Other', icon: 'MoreHoriz' },
  ],
  services: [
    // --- Compute ---
    {
      id: 'api-server',
      name: 'API Server',
      category: 'compute',
      provider: 'Fly.io',
      monthlyBudget: 25,
      url: 'https://fly.io/dashboard',
      note: 'shared-cpu-2x, 2GB, Tokyo (nrt)',
      sourceDoc: 'docs/05-operations/deployment/services/fly-io.md §7',
      costs: [
        { month: '2025-09', actual: 20 },
        { month: '2025-10', actual: 20 },
        { month: '2025-11', actual: 20 },
        { month: '2025-12', actual: 20 },
        { month: '2026-01', actual: 20 },
        { month: '2026-02', actual: 20 },
      ],
    },
    {
      id: 'job-server',
      name: 'Job Server (Droplet)',
      category: 'compute',
      provider: 'DigitalOcean',
      monthlyBudget: 50,
      url: 'https://cloud.digitalocean.com',
      note: '4 vCPU, 8GB RAM, Singapore (SGP1)',
      sourceDoc: 'docs/05-operations/deployment/services/droplet.md §1',
      costs: [
        { month: '2025-09', actual: 48 },
        { month: '2025-10', actual: 48 },
        { month: '2025-11', actual: 48 },
        { month: '2025-12', actual: 48 },
        { month: '2026-01', actual: 48 },
        { month: '2026-02', actual: 48 },
      ],
    },
    // --- Database ---
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      category: 'database',
      provider: 'Neon',
      monthlyBudget: 0,
      url: 'https://console.neon.tech',
      note: 'Free tier, serverless 0.25-4 CU, Singapore',
      sourceDoc: 'docs/05-operations/deployment/services/neon.md',
      costs: [
        { month: '2025-09', actual: 0 },
        { month: '2025-10', actual: 0 },
        { month: '2025-11', actual: 0 },
        { month: '2025-12', actual: 0 },
        { month: '2026-01', actual: 0 },
        { month: '2026-02', actual: 0 },
      ],
    },
    // --- Cache ---
    {
      id: 'redis-cache',
      name: 'Redis Cache',
      category: 'cache',
      provider: 'Upstash',
      monthlyBudget: 20,
      url: 'https://console.upstash.com',
      note: '~50M commands/mo, ~500MB, Singapore',
      sourceDoc: 'docs/05-operations/deployment/services/upstash.md §8',
      costs: [
        { month: '2025-09', actual: 15 },
        { month: '2025-10', actual: 15 },
        { month: '2025-11', actual: 15 },
        { month: '2025-12', actual: 15 },
        { month: '2026-01', actual: 15 },
        { month: '2026-02', actual: 15 },
      ],
    },
    // --- Storage & CDN ---
    {
      id: 'cloudflare',
      name: 'Cloudflare (R2 + DNS + CDN + Pages)',
      category: 'storage',
      provider: 'Cloudflare',
      monthlyBudget: 5,
      url: 'https://dash.cloudflare.com',
      note: 'R2 ~$0.56 + Domain ~$0.08/mo, rest free',
      sourceDoc: 'docs/05-operations/deployment/services/cloudflare.md §9',
      costs: [
        { month: '2025-09', actual: 1.56 },
        { month: '2025-10', actual: 1.56 },
        { month: '2025-11', actual: 1.56 },
        { month: '2025-12', actual: 1.56 },
        { month: '2026-01', actual: 1.56 },
        { month: '2026-02', actual: 1.56 },
      ],
    },
    // --- Monitoring ---
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
      note: 'Self-hosted data, cloud UI',
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
    // --- Other ---
    {
      id: 'claude-code',
      name: 'Claude Code CLI',
      category: 'other',
      provider: 'Anthropic',
      monthlyBudget: 275,
      url: 'https://console.anthropic.com',
      note: 'Max plan, AI-assisted development',
      costs: [
        { month: '2025-09', actual: 250 },
        { month: '2025-10', actual: 250 },
        { month: '2025-11', actual: 250 },
        { month: '2025-12', actual: 250 },
        { month: '2026-01', actual: 250 },
        { month: '2026-02', actual: 250 },
      ],
    },
    {
      id: 'github-actions',
      name: 'GitHub Actions',
      category: 'other',
      provider: 'GitHub',
      monthlyBudget: 15,
      url: 'https://github.com/settings/billing',
      note: 'CI/CD minutes',
      costs: [
        { month: '2025-09', actual: 9.64 },
        { month: '2025-10', actual: 9.64 },
        { month: '2025-11', actual: 9.64 },
        { month: '2025-12', actual: 9.64 },
        { month: '2026-01', actual: 9.64 },
        { month: '2026-02', actual: 9.64 },
      ],
    },
  ],
};
