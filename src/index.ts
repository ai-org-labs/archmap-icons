import {
  siApachekafka,
  siAuth0,
  siCloudflare,
  siDatadog,
  siDocker,
  siDynatrace,
  siElasticsearch,
  siFirebase,
  siGrafana,
  siGithub,
  siJira,
  siKeycloak,
  siKubernetes,
  siMongodb,
  siMysql,
  siNewrelic,
  siNetlify,
  siOkta,
  siPagerduty,
  siPostgresql,
  siPrometheus,
  siRedis,
  siSentry,
  siSplunk,
  siSupabase,
  siTerraform,
  siVercel,
} from "simple-icons";
import type { SimpleIcon } from "simple-icons";

export interface RenderableIcon {
  viewBox: string;
  body: string;
}

export type RegisterIcon = (key: string, icon: RenderableIcon) => void;

export interface ServiceIconEntry {
  /** Canonical ArchMap provider key. */
  key: string;
  /** Human-readable service name. */
  title: string;
  /** Diagram role this icon is usually used for. */
  role: string;
  /** Ranked row from the initial famous-services set. */
  rank: number;
  /** Additional provider spellings registered for the same icon. */
  aliases?: readonly string[];
}

export const famousServiceIconEntries = [
  {
    rank: 1,
    key: "datadog",
    title: "Datadog",
    role: "Observability / Monitoring",
  },
  {
    rank: 2,
    key: "cloudflare",
    title: "Cloudflare",
    role: "Edge / DNS / WAF",
  },
  {
    rank: 3,
    key: "okta",
    title: "Okta",
    role: "Identity Provider",
  },
  {
    rank: 4,
    key: "wiz",
    title: "Wiz",
    role: "Cloud Security / CNAPP",
  },
  {
    rank: 5,
    key: "sentry",
    title: "Sentry",
    role: "Error Tracking",
  },
  {
    rank: 6,
    key: "github",
    title: "GitHub",
    role: "Code / CI / Dev Platform",
  },
  {
    rank: 7,
    key: "pagerduty",
    title: "PagerDuty",
    role: "Incident / Alert Routing",
    aliases: ["pager-duty", "pager_duty"],
  },
  {
    rank: 8,
    key: "newrelic",
    title: "New Relic",
    role: "Observability",
    aliases: ["new-relic", "new_relic"],
  },
  {
    rank: 8,
    key: "dynatrace",
    title: "Dynatrace",
    role: "Observability",
  },
  {
    rank: 9,
    key: "splunk",
    title: "Splunk",
    role: "Log Analytics / SIEM",
  },
  {
    rank: 10,
    key: "servicenow",
    title: "ServiceNow",
    role: "ITSM / Ticketing",
    aliases: ["service-now", "service_now"],
  },
  {
    rank: 10,
    key: "jira",
    title: "Jira",
    role: "ITSM / Ticketing",
  },
  {
    rank: 11,
    key: "kubernetes",
    title: "Kubernetes",
    role: "Container Orchestration",
    aliases: ["k8s"],
  },
  {
    rank: 12,
    key: "docker",
    title: "Docker",
    role: "Containers",
  },
  {
    rank: 13,
    key: "terraform",
    title: "Terraform",
    role: "Infrastructure as Code",
    aliases: ["iac"],
  },
  {
    rank: 14,
    key: "grafana",
    title: "Grafana",
    role: "Dashboards / Observability",
  },
  {
    rank: 15,
    key: "prometheus",
    title: "Prometheus",
    role: "Metrics / Monitoring",
  },
  {
    rank: 16,
    key: "postgresql",
    title: "PostgreSQL",
    role: "Relational Database",
    aliases: ["postgres", "postgres_db"],
  },
  {
    rank: 17,
    key: "mysql",
    title: "MySQL",
    role: "Relational Database",
  },
  {
    rank: 18,
    key: "redis",
    title: "Redis",
    role: "Cache / Key-Value Store",
    aliases: ["cache"],
  },
  {
    rank: 19,
    key: "mongodb",
    title: "MongoDB",
    role: "Document Database",
    aliases: ["mongo", "document_db"],
  },
  {
    rank: 20,
    key: "kafka",
    title: "Apache Kafka",
    role: "Event Streaming",
    aliases: ["apache_kafka", "event_streaming"],
  },
  {
    rank: 21,
    key: "elasticsearch",
    title: "Elasticsearch",
    role: "Search / Log Indexing",
    aliases: ["elastic_search", "search"],
  },
  {
    rank: 22,
    key: "slack",
    title: "Slack",
    role: "ChatOps / Collaboration",
  },
  {
    rank: 23,
    key: "microsoftteams",
    title: "Microsoft Teams",
    role: "ChatOps / Collaboration",
    aliases: ["microsoft-teams", "microsoft_teams", "teams"],
  },
  {
    rank: 24,
    key: "auth0",
    title: "Auth0",
    role: "Identity Provider",
  },
  {
    rank: 25,
    key: "keycloak",
    title: "Keycloak",
    role: "Identity Provider",
  },
  {
    rank: 26,
    key: "vercel",
    title: "Vercel",
    role: "Frontend Hosting / Deployment",
  },
  {
    rank: 27,
    key: "netlify",
    title: "Netlify",
    role: "Frontend Hosting / Deployment",
  },
  {
    rank: 28,
    key: "heroku",
    title: "Heroku",
    role: "PaaS / App Hosting",
  },
  {
    rank: 29,
    key: "supabase",
    title: "Supabase",
    role: "Backend Platform",
  },
  {
    rank: 30,
    key: "firebase",
    title: "Firebase",
    role: "Backend Platform",
  },
] as const satisfies readonly ServiceIconEntry[];

function fromSimpleIcon(si: SimpleIcon): RenderableIcon {
  return { viewBox: "0 0 24 24", body: `<path fill="#${si.hex}" d="${si.path}" />` };
}

function letterBadge(label: string, color: string): RenderableIcon {
  return {
    viewBox: "0 0 24 24",
    body:
      `<rect width="24" height="24" rx="5" fill="#${color}" />` +
      `<text x="12" y="13" font-family="system-ui, sans-serif" font-size="7.2" font-weight="700" ` +
      `text-anchor="middle" dominant-baseline="central" fill="#ffffff">${label}</text>`,
  };
}

function registerWithAliases(
  registerIcon: RegisterIcon,
  entry: ServiceIconEntry,
  icon: RenderableIcon,
): void {
  registerIcon(entry.key, icon);
  for (const alias of entry.aliases ?? []) registerIcon(alias, icon);
}

const iconsByKey = {
  datadog: fromSimpleIcon(siDatadog),
  cloudflare: fromSimpleIcon(siCloudflare),
  okta: fromSimpleIcon(siOkta),
  wiz: letterBadge("WIZ", "7C3AED"),
  sentry: fromSimpleIcon(siSentry),
  github: fromSimpleIcon(siGithub),
  pagerduty: fromSimpleIcon(siPagerduty),
  newrelic: fromSimpleIcon(siNewrelic),
  dynatrace: fromSimpleIcon(siDynatrace),
  splunk: fromSimpleIcon(siSplunk),
  servicenow: letterBadge("SN", "00A13A"),
  jira: fromSimpleIcon(siJira),
  kubernetes: fromSimpleIcon(siKubernetes),
  docker: fromSimpleIcon(siDocker),
  terraform: fromSimpleIcon(siTerraform),
  grafana: fromSimpleIcon(siGrafana),
  prometheus: fromSimpleIcon(siPrometheus),
  postgresql: fromSimpleIcon(siPostgresql),
  mysql: fromSimpleIcon(siMysql),
  redis: fromSimpleIcon(siRedis),
  mongodb: fromSimpleIcon(siMongodb),
  kafka: fromSimpleIcon(siApachekafka),
  elasticsearch: fromSimpleIcon(siElasticsearch),
  slack: letterBadge("SLK", "4A154B"),
  microsoftteams: letterBadge("MS", "6264A7"),
  auth0: fromSimpleIcon(siAuth0),
  keycloak: fromSimpleIcon(siKeycloak),
  vercel: fromSimpleIcon(siVercel),
  netlify: fromSimpleIcon(siNetlify),
  heroku: letterBadge("HKU", "430098"),
  supabase: fromSimpleIcon(siSupabase),
  firebase: fromSimpleIcon(siFirebase),
} satisfies Record<(typeof famousServiceIconEntries)[number]["key"], RenderableIcon>;

export function installFamousServiceIcons(registerIcon: RegisterIcon): void {
  for (const entry of famousServiceIconEntries) {
    registerWithAliases(registerIcon, entry, iconsByKey[entry.key]);
  }
}

export { iconsByKey as famousServiceIcons };
export {
  cloudIconCounts,
  cloudIconEntries,
  getCloudIconEntry,
  installAwsIcons,
  installAzureIcons,
  installCloudProviderIcons,
  installGcpIcons,
  listCloudIconKeys,
  searchCloudIconEntries,
} from "./cloud-icons.js";
export type {
  CloudIconEntry,
  CloudProvider,
  InstallCloudIconsOptions,
  SearchCloudIconOptions,
} from "./cloud-icons.js";
