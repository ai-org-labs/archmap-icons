# @archmap/icons

Opt-in icon pack for [ArchMap](../archmap). ArchMap core intentionally ships no
vendor assets; this package registers third-party service icons through
ArchMap's `registerIcon()` mechanism.

## Usage

### Install

From npm, after publication:

```bash
npm install @archmap/icons
```

From GitHub:

```bash
npm install github:ai-org-labs/archmap-icons
```

The GitHub install path runs `prepare`, so the TypeScript sources are built
into `dist/` during install.

For CDN-style browser imports, use an npm ESM CDN after the package is
published to npm:

```html
<script type="module">
  import {
    installCloudProviderIcons,
    installFamousServiceIcons,
  } from "https://esm.sh/@archmap/icons";
</script>
```

Direct `unpkg`/`jsDelivr` file imports are not the recommended browser path
because this package intentionally uses ESM dependencies. Use an ESM CDN that
bundles dependencies, or install through npm.

### Register Icons

```ts
import { registerIcon } from "archmap";
import { installCloudProviderIcons, installFamousServiceIcons } from "@archmap/icons";

installFamousServiceIcons(registerIcon);
installCloudProviderIcons(registerIcon);
```

Then use matching `provider` values in ArchMap metadata:

```archmap
graph LR
  App[App] --> Logs[Log analytics]
---
nodes:
  Logs: { provider: splunk, kind: log_analytics }
  DB: { provider: aws, kind: rds }
  Warehouse: { provider: gcp, kind: bigquery }
  App: { provider: azure, kind: app_services }
```

## Catalog

The full generated list is available in [docs/ICON-CATALOG.md](docs/ICON-CATALOG.md).
It includes common service keys, AWS/GCP/Azure `provider/kind` keys, titles,
categories, and aliases.

Regenerate it after source or generated cloud icon changes:

```bash
npm run build
npm run generate:catalog
```

## Cloud Provider Service Icons

AWS, Google Cloud, and Azure service icons are generated from the official SVG
packages. They register as `provider/kind`, which matches ArchMap's most
specific icon lookup rule.

```ts
import { registerIcon } from "archmap";
import {
  cloudIconCounts,
  getCloudIconEntry,
  installAwsIcons,
  installAzureIcons,
  installCloudProviderIcons,
  installGcpIcons,
  listCloudIconKeys,
  searchCloudIconEntries,
} from "@archmap/icons";

installCloudProviderIcons(registerIcon);
// or install one provider:
installAwsIcons(registerIcon);
installGcpIcons(registerIcon);
installAzureIcons(registerIcon);

console.log(cloudIconCounts); // { aws: 305, gcp: 261, azure: 705 }
```

### Finding the right service key

The cloud catalog is intentionally queryable so AI agents and code generators
do not need to guess provider-specific service names.

```ts
import {
  getCloudIconEntry,
  listCloudIconKeys,
  searchCloudIconEntries,
} from "@archmap/icons";

searchCloudIconEntries("rds", { provider: "aws" });
// [{ provider: "aws", key: "amazon_rds", title: "Amazon RDS", aliases: ["rds"], ... }]

getCloudIconEntry("aws", "rds")?.key; // "amazon_rds"
getCloudIconEntry("aws", "Amazon EC2")?.aliases; // ["ec2"]

listCloudIconKeys("aws").filter((key) => key.includes("lambda"));
// ["aws/aws_lambda", "aws/lambda", ...]
```

For ArchMap metadata, use the provider without the prefix and the key or alias
as `kind`:

```archmap
nodes:
  Api: { provider: aws, kind: lambda }
  Db: { provider: aws, kind: rds }
  Bucket: { provider: aws, kind: s3 }
```

Examples:

| Provider | Preferred key | Short alias examples |
| --- | --- | --- |
| AWS | `aws/amazon_ec2` | `aws/ec2` |
| AWS | `aws/aws_lambda` | `aws/lambda` |
| GCP | `gcp/compute_engine` | `gcp/gce`, `gcp/vm` |
| GCP | `gcp/cloud_storage` | `gcp/gcs`, `gcp/bucket` |
| GCP | `gcp/google_kubernetes_engine` | `gcp/gke`, `gcp/kubernetes` |
| GCP | `gcp/pubsub` | `gcp/pub_sub`, `gcp/messaging` |
| GCP | `gcp/cloud_sql` | `gcp/sql` |
| Azure | `azure/virtual_machine` | `azure/vm` |
| Azure | `azure/kubernetes_services` | `azure/kubernetes_service` |
| Azure | `azure/storage_accounts` | `azure/blob`, `azure/storage` |
| Azure | `azure/virtual_networks` | `azure/vnet` |
| Azure | `azure/key_vaults` | `azure/keyvault`, `azure/kv` |
| Azure | `azure/container_registries` | `azure/acr` |
| Azure | `azure/api_management_services` | `azure/apim` |
| Azure | `azure/load_balancers` | `azure/lb` |
| Azure | `azure/web_application_firewall_policies_waf` | `azure/waf` |

The generated cloud set currently contains:

| Provider | Icons |
| --- | ---: |
| AWS | 305 |
| Google Cloud | 261 |
| Azure | 705 |

Regenerate the generated file after downloading/extracting the official ZIPs:

```bash
npm run generate:cloud-icons -- /tmp/archmap-icon-sources/extracted src/cloud-icons.generated.ts
```

## Included Set

This is the common external-services pack for architecture diagrams. It covers
observability, edge/security, identity, development platforms, incident/ITSM,
containers, infrastructure-as-code, databases, streaming, search, chat, and app
hosting.

| Rank | Service key(s) | Diagram role |
| ---: | --- | --- |
| 1 | `datadog` | Observability / Monitoring |
| 2 | `cloudflare` | Edge / DNS / WAF |
| 3 | `okta` | Identity Provider |
| 4 | `wiz` | Cloud Security / CNAPP |
| 5 | `sentry` | Error Tracking |
| 6 | `github` | Code / CI / Dev Platform |
| 7 | `pagerduty` | Incident / Alert Routing |
| 8 | `newrelic`, `dynatrace` | Observability |
| 9 | `splunk` | Log Analytics / SIEM |
| 10 | `servicenow`, `jira` | ITSM / Ticketing |
| 11 | `kubernetes` | Container Orchestration |
| 12 | `docker` | Containers |
| 13 | `terraform` | Infrastructure as Code |
| 14 | `grafana` | Dashboards / Observability |
| 15 | `prometheus` | Metrics / Monitoring |
| 16 | `postgresql` | Relational Database |
| 17 | `mysql` | Relational Database |
| 18 | `redis` | Cache / Key-Value Store |
| 19 | `mongodb` | Document Database |
| 20 | `kafka` | Event Streaming |
| 21 | `elasticsearch` | Search / Log Indexing |
| 22 | `slack` | ChatOps / Collaboration |
| 23 | `microsoftteams` | ChatOps / Collaboration |
| 24 | `auth0` | Identity Provider |
| 25 | `keycloak` | Identity Provider |
| 26 | `vercel` | Frontend Hosting / Deployment |
| 27 | `netlify` | Frontend Hosting / Deployment |
| 28 | `heroku` | PaaS / App Hosting |
| 29 | `supabase` | Backend Platform |
| 30 | `firebase` | Backend Platform |

Several spelling aliases are also registered, such as `new-relic`,
`pager-duty`, `service-now`, `k8s`, `postgres`, `apache_kafka`, `teams`, and
`microsoft_teams`.

## Licensing Notes

Most logos are sourced from `simple-icons`, which is CC0-licensed, but brand
names and logos may still be subject to trademark rules. `wiz`, `servicenow`,
`slack`, `microsoftteams`, and `heroku` are lettered placeholder badges because
they are not available in the `simple-icons` set used here. Replace those with
official licensed assets in production if your usage requires brand-accurate
logos.

Cloud provider service icons are sourced from the official AWS Architecture
Icons package, Google Cloud Icon Library downloads, and Microsoft Azure
Architecture Icons download. The package code is MIT-licensed, but vendor icon
assets remain governed by each provider's published terms and trademark rules.
