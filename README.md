# @archmap/icons

Opt-in icon pack for [ArchMap](../archmap). ArchMap core intentionally ships no
vendor assets; this package registers third-party service icons through
ArchMap's `registerIcon()` mechanism.

## Usage

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
| Azure | `azure/virtual_machine` | |
| Azure | `azure/kubernetes_services` | `azure/kubernetes_service` |

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

This is the first "famous services" pack for architecture diagrams. It covers
10 rows/categories and registers 12 provider keys because two rows have common
alternatives.

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

Several spelling aliases are also registered, such as `new-relic`,
`pager-duty`, and `service-now`.

## Licensing Notes

Most logos are sourced from `simple-icons`, which is CC0-licensed, but brand
names and logos may still be subject to trademark rules. `wiz` and `servicenow`
are lettered placeholder badges because they are not available in the
`simple-icons` set used here. Replace those with official licensed assets in
production if your usage requires brand-accurate logos.

Cloud provider service icons are sourced from the official AWS Architecture
Icons package, Google Cloud Icon Library downloads, and Microsoft Azure
Architecture Icons download. The package code is MIT-licensed, but vendor icon
assets remain governed by each provider's published terms and trademark rules.
