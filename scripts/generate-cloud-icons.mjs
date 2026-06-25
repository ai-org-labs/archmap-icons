import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";

const sourceRoot = process.argv[2] ?? "/tmp/archmap-icon-sources/extracted";
const outputFile = process.argv[3] ?? "src/cloud-icons.generated.ts";

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "__MACOSX") continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(path));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".svg")) out.push(path);
  }
  return out;
}

function slug(value) {
  return value
    .replace(/&/g, " and ")
    .replace(/\+/g, " plus ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_");
}

function titleFromSlug(value) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => {
      const upper = new Set(["ai", "api", "apim", "aws", "cdn", "db", "dns", "ec2", "eks", "gcp", "gke", "iam", "iot", "ml", "rds", "s3", "sdk", "sql", "vm", "vpc"]);
      return upper.has(part) ? part.toUpperCase() : part[0].toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function stripSvg(svg) {
  const withoutPreamble = svg
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!doctype[\s\S]*?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();
  const open = withoutPreamble.match(/<svg\b([^>]*)>/i);
  if (!open) throw new Error("Missing <svg> root");
  const attrs = open[1] ?? "";
  const viewBox = attrs.match(/\bviewBox=["']([^"']+)["']/i)?.[1] ?? "0 0 64 64";
  const body = withoutPreamble
    .replace(/^<svg\b[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "")
    .trim()
    .replace(/\r?\n\s*/g, " ");
  return { viewBox, body };
}

function awsName(file) {
  return basename(file, ".svg").replace(/^Arch_/, "").replace(/_(16|32|48|64)$/, "");
}

function awsCategory(file) {
  const parts = file.split(sep);
  const category = parts.find((part) => part.startsWith("Arch_") && part !== "Architecture-Service-Icons_04302026");
  return category?.replace(/^Arch_/, "").replace(/-/g, " ") ?? "AWS";
}

function azureName(file) {
  return basename(file, ".svg").replace(/^\d+-icon-service-/, "");
}

function azureCategory(file) {
  return basename(dirname(file));
}

function gcpName(file) {
  const parts = file.split(sep);
  const svgParent = parts.at(-2);
  const serviceParent = parts.at(-3);
  if (svgParent?.toLowerCase() === "svg" && serviceParent) return serviceParent;
  return basename(file, ".svg")
    .replace(/-512-color(-rgb)?$/i, "")
    .replace(/_512-color(-rgb)?$/i, "");
}

function gcpCategory(file) {
  const rel = relative(join(sourceRoot), file);
  if (rel.startsWith(`gcp-category${sep}`)) return "Product category";
  if (rel.startsWith(`gcp-core${sep}`)) return "Core product";
  return "Legacy product";
}

function aliasesFor(provider, key) {
  const aliases = new Set();
  const prefixes = {
    aws: ["amazon_", "aws_"],
    gcp: ["google_cloud_", "google_", "cloud_"],
    azure: ["azure_", "microsoft_"],
  }[provider] ?? [];
  for (const prefix of prefixes) {
    if (key.startsWith(prefix) && key.length > prefix.length) aliases.add(key.slice(prefix.length));
  }
  if (provider === "aws") {
    aliases.add(key.replace(/^amazon_elastic_/, "elastic_"));
    aliases.add(key.replace(/^amazon_simple_/, "simple_"));
    const awsAcronyms = {
      amazon_simple_storage_service: ["s3", "bucket", "object_storage"],
      amazon_simple_storage_service_glacier: ["s3_glacier", "glacier"],
      amazon_simple_queue_service: ["sqs", "queue"],
      amazon_simple_notification_service: ["sns", "notification"],
      amazon_simple_email_service: ["ses", "email"],
      amazon_elastic_compute_cloud: ["ec2"],
      amazon_ec2: ["ec2", "virtual_machine", "vm"],
      amazon_ec2_auto_scaling: ["ec2_auto_scaling", "auto_scaling"],
      amazon_relational_database_service: ["rds", "relational_database"],
      amazon_rds: ["rds", "relational_database"],
      amazon_aurora: ["aurora", "relational_database"],
      amazon_dynamo_db: ["dynamodb", "dynamo_db", "nosql_database"],
      amazon_document_db: ["documentdb", "document_db"],
      amazon_elasti_cache: ["elasticache", "elasti_cache", "cache"],
      amazon_elastic_container_service: ["ecs", "container_service"],
      amazon_elastic_kubernetes_service: ["eks", "kubernetes"],
      amazon_elastic_container_registry: ["ecr", "container_registry"],
      amazon_elastic_file_system: ["efs", "file_system"],
      amazon_elastic_block_store: ["ebs", "block_storage"],
      amazon_vpc: ["vpc", "virtual_private_cloud"],
      amazon_vpc_lattice: ["vpc_lattice"],
      amazon_route_53: ["route53", "route_53", "dns"],
      amazon_api_gateway: ["api_gateway"],
      amazon_cloudfront: ["cloudfront", "cdn"],
      amazon_cloud_front: ["cloudfront", "cloud_front", "cdn"],
      aws_lambda: ["lambda", "function", "serverless_function"],
      aws_identity_and_access_management: ["iam", "identity_access_management"],
      aws_iam_identity_center: ["iam_identity_center", "identity_center", "sso"],
      aws_key_management_service: ["kms", "key_management"],
      aws_secrets_manager: ["secrets_manager", "secret"],
      aws_certificate_manager: ["acm", "certificate_manager"],
      aws_waf: ["waf", "web_application_firewall"],
      aws_cloudformation: ["cloudformation", "infrastructure_as_code"],
      aws_cloudtrail: ["cloudtrail", "audit_log"],
      amazon_cloudwatch: ["cloudwatch", "monitoring"],
      aws_direct_connect: ["direct_connect"],
    };
    for (const alias of awsAcronyms[key] ?? []) aliases.add(alias);
  }
  if (provider === "gcp") {
    const gcpAcronyms = {
      access_context_manager: ["acm"],
      alloy_db: ["alloydb"],
      api_gateway: ["api_gateway"],
      app_engine: ["gae"],
      artifact_registry: ["gar", "container_registry"],
      big_query: ["bigquery", "bq", "data_warehouse"],
      bigquery: ["big_query", "bq", "data_warehouse"],
      certificate_authority_service: ["cas", "private_ca"],
      certificate_manager: ["cert_manager"],
      cloud_api_gateway: ["api_gateway"],
      cloud_armor: ["armor", "waf", "ddos_protection"],
      cloud_asset_inventory: ["asset_inventory", "cai"],
      cloud_audit_logs: ["audit_logs"],
      cloud_build: ["build", "ci_cd"],
      cloud_cdn: ["cdn"],
      cloud_composer: ["composer", "airflow"],
      cloud_data_fusion: ["data_fusion"],
      cloud_deploy: ["deploy"],
      cloud_deployment_manager: ["deployment_manager", "infrastructure_as_code"],
      cloud_dns: ["dns"],
      cloud_endpoints: ["endpoints"],
      cloud_firewall_rules: ["firewall", "firewall_rules"],
      cloud_functions: ["functions", "function", "serverless_function", "gcf"],
      cloud_hsm: ["hsm"],
      cloud_ids: ["ids", "intrusion_detection"],
      cloud_interconnect: ["interconnect"],
      cloud_load_balancing: ["load_balancing", "load_balancer", "lb"],
      cloud_logging: ["logging", "logs"],
      cloud_monitoring: ["monitoring", "metrics"],
      cloud_nat: ["nat"],
      cloud_network: ["network"],
      cloud_router: ["router"],
      cloud_run: ["run", "serverless_container"],
      cloud_scheduler: ["scheduler", "cron"],
      cloud_security_scanner: ["security_scanner"],
      cloud_shell: ["shell"],
      cloud_spanner: ["spanner"],
      cloud_sql: ["sql", "relational_database"],
      cloud_storage: ["storage", "gcs", "bucket", "object_storage"],
      cloud_tasks: ["tasks", "task_queue"],
      cloud_tpu: ["tpu"],
      cloud_translation_api: ["translation", "translate"],
      cloud_vision_api: ["vision", "computer_vision"],
      cloud_vpn: ["vpn"],
      compute_engine: ["gce", "compute", "virtual_machine", "vm"],
      container_registry: ["gcr", "container_registry"],
      data_loss_prevention_api: ["dlp", "data_loss_prevention"],
      database_migration_service: ["dms", "database_migration"],
      dataflow: ["data_flow", "stream_processing", "beam"],
      dataproc: ["spark", "hadoop"],
      datastore: ["cloud_datastore"],
      datastream: ["data_stream"],
      dialogflow_cx: ["dialogflow"],
      document_ai: ["docai", "document_ai"],
      eventarc: ["events"],
      filestore: ["file_storage", "nfs"],
      firestore: ["cloud_firestore", "document_database"],
      gke: ["google_kubernetes_engine", "kubernetes"],
      google_kubernetes_engine: ["gke", "kubernetes"],
      identity_and_access_management: ["iam", "identity_access_management"],
      identity_aware_proxy: ["iap"],
      key_management_service: ["kms", "key_management"],
      kuberun: ["cloud_run_for_anthos"],
      local_ssd: ["ssd"],
      looker: ["bi"],
      memorystore: ["redis", "cache"],
      network_connectivity_center: ["ncc"],
      network_security: ["security"],
      network_topology: ["topology"],
      operations: ["ops"],
      persistent_disk: ["pd", "disk", "block_storage"],
      private_service_connect: ["psc"],
      pubsub: ["pub_sub", "pub/sub", "pubsub", "messaging", "message_queue"],
      secret_manager: ["secrets_manager", "secret"],
      security_command_center: ["scc", "security_center"],
      speech_to_text: ["stt", "speech"],
      text_to_speech: ["tts"],
      vertex_ai: ["vertexai", "ai_platform", "ml"],
      vertexai: ["vertex_ai", "ai_platform", "ml"],
      virtual_private_cloud: ["vpc"],
      vmware_engine: ["vmware"],
      web_security_scanner: ["security_scanner"],
      workflows: ["workflow"],
    };
    for (const alias of gcpAcronyms[key] ?? []) aliases.add(alias);
  }
  if (provider === "azure") {
    if (key.endsWith("s")) aliases.add(key.slice(0, -1));
    const azureAcronyms = {
      active_directory_connect_health: ["ad_connect_health"],
      api_management_services: ["api_management", "apim"],
      app_configuration: ["configuration"],
      app_service_environments: ["app_service_environment", "ase"],
      app_service_plans: ["app_service_plan"],
      app_services: ["app_service", "web_app"],
      application_gateway_containers: ["application_gateway_container"],
      application_gateways: ["application_gateway", "app_gateway", "agw"],
      application_insights: ["application_insight", "app_insights", "apm"],
      azure_api_center: ["api_center"],
      azure_app_configuration: ["app_configuration"],
      azure_arc: ["arc"],
      azure_cache_redis: ["redis", "cache"],
      azure_container_apps: ["container_apps", "aca"],
      azure_container_storage: ["container_storage"],
      azure_cosmos_db: ["cosmos_db", "cosmos", "document_database"],
      azure_database_maria_db_server: ["mariadb", "maria_db"],
      azure_database_my_sql_server: ["mysql", "my_sql"],
      azure_database_postgre_sql_server: ["postgresql", "postgres", "postgre_sql"],
      azure_firewall: ["firewall"],
      azure_firewall_manager: ["firewall_manager"],
      azure_firewall_policy: ["firewall_policy"],
      azure_front_door: ["front_door", "afd", "cdn"],
      azure_functions: ["functions", "function", "serverless_function"],
      azure_key_vault: ["key_vault", "keyvault", "kv", "secrets"],
      azure_kubernetes_service: ["aks", "kubernetes"],
      azure_load_balancer: ["load_balancer", "lb"],
      azure_managed_grafana: ["grafana"],
      azure_managed_redis: ["redis", "cache"],
      azure_monitor: ["monitor", "monitoring", "metrics"],
      azure_open_ai: ["openai", "azure_openai"],
      azure_private_5g_core: ["private_5g"],
      azure_service_bus: ["service_bus", "message_bus", "queue"],
      azure_sql: ["sql", "sql_database", "relational_database"],
      azure_sql_database: ["sql_database"],
      azure_static_web_apps: ["static_web_apps", "swa"],
      azure_synapse_analytics: ["synapse", "data_warehouse"],
      azure_virtual_desktop: ["virtual_desktop", "avd"],
      bastions: ["bastion"],
      cdn_profiles: ["cdn", "cdn_profile"],
      cognitive_search: ["search", "ai_search"],
      container_instances: ["aci", "container_instance"],
      container_registries: ["acr", "container_registry"],
      container_apps_environments: ["container_apps_environment"],
      dns_zones: ["dns", "dns_zone"],
      event_grid_domains: ["event_grid_domain"],
      event_grid_topics: ["event_grid", "event_grid_topic"],
      event_hubs: ["event_hub", "event_streaming"],
      express_route_circuits: ["expressroute", "express_route"],
      front_door_and_cdn_profiles: ["front_door", "afd", "cdn"],
      function_apps: ["functions", "function", "serverless_function"],
      key_vaults: ["key_vault", "keyvault", "kv", "secrets"],
      kubernetes_services: ["aks", "kubernetes"],
      load_balancers: ["load_balancer", "lb"],
      log_analytics_workspaces: ["log_analytics", "logs"],
      managed_identities: ["managed_identity", "msi"],
      monitor: ["azure_monitor", "monitoring", "metrics"],
      monitor_application_insights: ["application_insights", "app_insights", "apm"],
      monitor_log_analytics_workspaces: ["log_analytics", "logs"],
      network_interfaces: ["nic", "network_interface"],
      network_security_groups: ["nsg", "network_security_group"],
      private_endpoint: ["private_link"],
      private_link: ["private_endpoint"],
      redis_cache: ["redis", "cache"],
      service_bus: ["message_bus", "queue"],
      sql_database: ["sql", "azure_sql", "relational_database"],
      storage_accounts: ["storage_account", "storage", "blob", "blob_storage", "queue_storage"],
      storage_blob: ["blob", "blob_storage"],
      storage_container: ["blob_container", "container"],
      storage_queue: ["queue_storage"],
      virtual_machine: ["vm", "virtual_machine"],
      virtual_machines: ["vm", "virtual_machine"],
      virtual_network_gateways: ["vpn_gateway", "virtual_network_gateway"],
      virtual_networks: ["vnet", "virtual_network"],
      vpn_gateways: ["vpn_gateway", "vpn"],
      web_application_firewall_policies_waf: ["waf", "web_application_firewall"],
      web_front_door_and_cdn_profiles: ["front_door", "afd", "cdn"],
    };
    const entraKeys = [
      "entra_connect",
      "entra_domain_services",
      "entra_global_secure_access",
      "entra_managed_identities",
    ];
    for (const alias of azureAcronyms[key] ?? []) aliases.add(alias);
    if (key.startsWith("entra_")) aliases.add(key.replace(/^entra_/, "entra_id_"));
    if (entraKeys.includes(key)) aliases.add("entra_id");
    if (key.includes("active_directory")) aliases.add("aad");
  }
  return [...aliases].filter((alias) => alias && alias !== key);
}

const providers = [
  {
    provider: "aws",
    root: join(sourceRoot, "aws"),
    include: (file) => file.includes(`${sep}Architecture-Service-Icons_`) && file.includes(`${sep}64${sep}`),
    name: awsName,
    category: awsCategory,
  },
  {
    provider: "gcp",
    root: sourceRoot,
    include: (file) => file.includes(`${sep}gcp-core${sep}`) || file.includes(`${sep}gcp-category${sep}`) || file.includes(`${sep}gcp-legacy${sep}`),
    name: gcpName,
    category: gcpCategory,
  },
  {
    provider: "azure",
    root: join(sourceRoot, "azure"),
    include: (file) => file.includes(`${sep}Icons${sep}`),
    name: azureName,
    category: azureCategory,
  },
];

const entries = [];
for (const config of providers) {
  const used = new Set();
  for (const file of walk(config.root).filter(config.include).sort()) {
    const name = config.name(file);
    let key = slug(name);
    if (!key) continue;
    const category = config.category(file);
    if (used.has(key)) key = `${slug(category)}_${key}`;
    used.add(key);
    const { viewBox, body } = stripSvg(readFileSync(file, "utf8"));
    entries.push({
      provider: config.provider,
      key,
      title: titleFromSlug(slug(name)),
      category,
      aliases: aliasesFor(config.provider, key),
      icon: { viewBox, body },
    });
  }
}

const counts = entries.reduce((acc, entry) => {
  acc[entry.provider] = (acc[entry.provider] ?? 0) + 1;
  return acc;
}, {});

const source = `// Generated by scripts/generate-cloud-icons.mjs from official cloud-provider SVG icon packages.
// Do not edit by hand.

import type { CloudIconEntry } from "./cloud-icons.js";

export const generatedCloudIconEntries: readonly CloudIconEntry[] = ${JSON.stringify(entries)};

export const generatedCloudIconCounts = ${JSON.stringify(counts, null, 2)} as const;
`;

writeFileSync(outputFile, source);
console.log(`Generated ${entries.length} icons into ${outputFile}`);
console.log(counts);
