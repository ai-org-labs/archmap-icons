import assert from "node:assert/strict";
import {
  cloudIconCounts,
  famousServiceIconEntries,
  getCloudIconEntry,
  installCloudProviderIcons,
  installFamousServiceIcons,
  listCloudIconKeys,
  searchCloudIconEntries,
} from "../dist/index.js";

assert.deepEqual(cloudIconCounts, { aws: 305, gcp: 261, azure: 705 });

const cloudRegistry = new Map();
installCloudProviderIcons((key, icon) => cloudRegistry.set(key, icon));

for (const key of ["aws", "gcp", "azure"]) {
  assert.ok(cloudRegistry.has(key), `expected provider fallback icon: ${key}`);
}

const expectedCloudAliases = {
  "aws/s3": ["aws", "s3", "amazon_simple_storage_service"],
  "aws/ec2": ["aws", "ec2", "amazon_ec2"],
  "aws/lambda": ["aws", "lambda", "aws_lambda"],
  "gcp/gcs": ["gcp", "gcs", "cloud_storage"],
  "gcp/gce": ["gcp", "gce", "compute_engine"],
  "gcp/gke": ["gcp", "gke", "gke"],
  "gcp/vpc": ["gcp", "vpc", "virtual_private_cloud"],
  "azure/vm": ["azure", "vm", "virtual_machine"],
  "azure/aks": ["azure", "aks", "kubernetes_services"],
  "azure/vnet": ["azure", "vnet", "virtual_networks"],
  "azure/kv": ["azure", "kv", "key_vaults"],
  "azure/acr": ["azure", "acr", "container_registries"],
  "azure/apim": ["azure", "apim", "api_management_services"],
  "azure/lb": ["azure", "lb", "load_balancers"],
  "azure/waf": ["azure", "waf", "web_application_firewall_policies_waf"],
};

for (const [registeredKey, [provider, kind, expectedKey]] of Object.entries(expectedCloudAliases)) {
  assert.ok(cloudRegistry.has(registeredKey), `expected registered alias: ${registeredKey}`);
  assert.equal(getCloudIconEntry(provider, kind)?.key, expectedKey);
}

assert.ok(searchCloudIconEntries("s3 bucket", { provider: "aws" })[0]?.key === "amazon_simple_storage_service");
assert.ok(searchCloudIconEntries("gcs bucket", { provider: "gcp" })[0]?.key === "cloud_storage");
assert.ok(searchCloudIconEntries("aks kubernetes", { provider: "azure" })[0]?.key === "kubernetes_services");

assert.ok(listCloudIconKeys("aws").includes("aws/s3"));
assert.ok(listCloudIconKeys("gcp").includes("gcp/gcs"));
assert.ok(listCloudIconKeys("azure").includes("azure/aks"));

const famousRegistry = new Map();
installFamousServiceIcons((key, icon) => famousRegistry.set(key, icon));

assert.equal(famousServiceIconEntries.length, 32);

for (const key of [
  "datadog",
  "cloudflare",
  "github",
  "kubernetes",
  "k8s",
  "postgresql",
  "postgres",
  "kafka",
  "apache_kafka",
  "microsoftteams",
  "teams",
  "firebase",
]) {
  assert.ok(famousRegistry.has(key), `expected famous service icon: ${key}`);
}

console.log("Icon smoke tests passed.");
