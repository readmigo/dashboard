export type CostCategory = 'compute' | 'database' | 'cache' | 'storage' | 'monitoring' | 'other';
export type CostClassification = 'infrastructure' | 'devtool';

export interface MonthlyCost {
  month: string;
  actual: number;
}

export interface FreeTierInfo {
  isOnFreeTier: boolean;
  description: string; // human-readable free tier allowance
}

export interface PerformanceTier {
  name: string; // 'Free' | 'Current' | 'Next'
  monthlyCost: number;
  description: string;
}

export interface ServiceCost {
  id: string;
  name: string;
  category: CostCategory;
  classification: CostClassification;
  provider: string;
  monthlyBudget: number;
  costs: MonthlyCost[];
  url?: string;
  note?: string;
  sourceDoc?: string;
  freeTier?: FreeTierInfo;
  performanceTiers?: PerformanceTier[];
}

export interface CostConfig {
  services: ServiceCost[];
  globalMonthlyBudget: number;
  categories: { id: CostCategory; label: string; icon: string }[];
}

// All cost data sourced from /docs/05-operations/deployment/services/
// Free tier data sourced from each provider's official pricing page
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
      classification: 'infrastructure',
      provider: 'Fly.io',
      monthlyBudget: 25,
      url: 'https://fly.io/dashboard',
      note: 'shared-cpu-2x, 2GB, Tokyo (nrt)',
      sourceDoc: 'docs/05-operations/deployment/services/fly-io.md §7',
      freeTier: {
        isOnFreeTier: false,
        description: 'Free: 3 shared-cpu-1x 256MB VMs',
      },
      performanceTiers: [
        { name: 'Free', monthlyCost: 0, description: 'shared-cpu-1x, 256MB (3 VMs)' },
        { name: 'Current', monthlyCost: 20, description: 'shared-cpu-2x, 2GB (1 VM)' },
        { name: 'Next', monthlyCost: 31, description: 'performance-1x, 2GB (1 VM)' },
      ],
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
      classification: 'infrastructure',
      provider: 'DigitalOcean',
      monthlyBudget: 50,
      url: 'https://cloud.digitalocean.com',
      note: '4 vCPU, 8GB RAM, Singapore (SGP1)',
      sourceDoc: 'docs/05-operations/deployment/services/droplet.md §1',
      performanceTiers: [
        { name: 'Downgrade', monthlyCost: 24, description: '2 vCPU, 4GB RAM, 25GB SSD' },
        { name: 'Current', monthlyCost: 48, description: '4 vCPU, 8GB RAM, 50GB SSD' },
        { name: 'Next', monthlyCost: 96, description: '8 vCPU, 16GB RAM, 100GB SSD' },
      ],
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
      classification: 'infrastructure',
      provider: 'Neon',
      monthlyBudget: 0,
      url: 'https://console.neon.tech',
      note: 'Free tier, serverless 0.25-4 CU, Singapore',
      sourceDoc: 'docs/05-operations/deployment/services/neon.md',
      freeTier: {
        isOnFreeTier: true,
        description: '0.5GB storage, 0.25 CU, 1 project, 10 branches',
      },
      performanceTiers: [
        { name: 'Free', monthlyCost: 0, description: '0.5GB storage, 0.25 CU, 1 project' },
        { name: 'Launch', monthlyCost: 19, description: '10GB storage, auto-scaling CU' },
        { name: 'Scale', monthlyCost: 69, description: '50GB storage, higher CU limits' },
      ],
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
      classification: 'infrastructure',
      provider: 'Upstash',
      monthlyBudget: 20,
      url: 'https://console.upstash.com',
      note: '~50M commands/mo, ~500MB, Singapore',
      sourceDoc: 'docs/05-operations/deployment/services/upstash.md §8',
      freeTier: {
        isOnFreeTier: false,
        description: 'Free: 10K commands/day, 256MB',
      },
      performanceTiers: [
        { name: 'Free', monthlyCost: 0, description: '10K commands/day, 256MB' },
        { name: 'Current', monthlyCost: 15, description: 'Pay-as-you-go, ~50M cmds/mo, 500MB' },
        { name: 'Pro', monthlyCost: 280, description: 'Fixed price, unlimited commands, 10GB' },
      ],
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
      classification: 'infrastructure',
      provider: 'Cloudflare',
      monthlyBudget: 5,
      url: 'https://dash.cloudflare.com',
      note: 'R2 ~$0.56 + Domain ~$0.08/mo, rest free',
      sourceDoc: 'docs/05-operations/deployment/services/cloudflare.md §9',
      freeTier: {
        isOnFreeTier: false,
        description: 'DNS/CDN/Pages/Email free; R2: 10GB storage free',
      },
      performanceTiers: [
        { name: 'Free', monthlyCost: 0, description: 'DNS, CDN, Pages, Email; R2 10GB' },
        { name: 'Current', monthlyCost: 1.56, description: 'R2 ~10GB+ storage, domain renewal' },
        { name: 'Pro', monthlyCost: 20, description: 'WAF, image optimization, analytics' },
      ],
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
      classification: 'infrastructure',
      provider: 'Sentry',
      monthlyBudget: 0,
      url: 'https://sentry.io',
      note: 'Free tier',
      freeTier: {
        isOnFreeTier: true,
        description: '5K errors/mo, 10K performance transactions',
      },
      performanceTiers: [
        { name: 'Free', monthlyCost: 0, description: '5K errors/mo, 10K transactions' },
        { name: 'Team', monthlyCost: 26, description: '50K errors/mo, 100K transactions' },
        { name: 'Business', monthlyCost: 80, description: '50K+ errors, advanced features' },
      ],
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
      classification: 'infrastructure',
      provider: 'PostHog',
      monthlyBudget: 0,
      note: 'Self-hosted data, cloud UI',
      freeTier: {
        isOnFreeTier: true,
        description: '1M events/mo, 5K session recordings',
      },
      performanceTiers: [
        { name: 'Free', monthlyCost: 0, description: '1M events/mo, 5K recordings' },
        { name: 'Pay-as-you-go', monthlyCost: 0, description: '$0.00031/event beyond 1M' },
      ],
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
      classification: 'infrastructure',
      provider: 'Axiom',
      monthlyBudget: 0,
      url: 'https://app.axiom.co',
      note: 'Free tier',
      freeTier: {
        isOnFreeTier: true,
        description: '500GB ingest/mo, 30 days retention',
      },
      performanceTiers: [
        { name: 'Free', monthlyCost: 0, description: '500GB ingest/mo, 30 days' },
        { name: 'Pro', monthlyCost: 25, description: '500GB ingest/mo, 90 days' },
      ],
      costs: [
        { month: '2025-09', actual: 0 },
        { month: '2025-10', actual: 0 },
        { month: '2025-11', actual: 0 },
        { month: '2025-12', actual: 0 },
        { month: '2026-01', actual: 0 },
        { month: '2026-02', actual: 0 },
      ],
    },
    // --- Other (Development Tools) ---
    {
      id: 'claude-code',
      name: 'Claude Code CLI',
      category: 'other',
      classification: 'devtool',
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
      classification: 'devtool',
      provider: 'GitHub',
      monthlyBudget: 15,
      url: 'https://github.com/settings/billing',
      note: 'CI/CD minutes',
      freeTier: {
        isOnFreeTier: false,
        description: 'Free: 2000 min/mo (private repos), 500MB storage',
      },
      performanceTiers: [
        { name: 'Free', monthlyCost: 0, description: '2000 min/mo, 500MB storage' },
        { name: 'Current', monthlyCost: 9.64, description: 'Overage beyond free tier' },
        { name: 'Team', monthlyCost: 4, description: '3000 min/mo per user' },
      ],
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
