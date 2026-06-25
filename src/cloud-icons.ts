import { generatedCloudIconCounts, generatedCloudIconEntries } from "./cloud-icons.generated.js";
import type { RegisterIcon, RenderableIcon } from "./index.js";

export type CloudProvider = "aws" | "gcp" | "azure";

export interface CloudIconEntry {
  provider: CloudProvider;
  key: string;
  title: string;
  category: string;
  aliases?: readonly string[];
  icon: RenderableIcon;
}

export interface InstallCloudIconsOptions {
  providers?: readonly CloudProvider[];
}

export interface SearchCloudIconOptions {
  provider?: CloudProvider;
  limit?: number;
}

export const cloudIconEntries = generatedCloudIconEntries;

export const cloudIconCounts = generatedCloudIconCounts;

const providerFallbackIcons = {
  aws: badge("AWS", "FF9900"),
  gcp: badge("GCP", "4285F4"),
  azure: badge("AZ", "0078D4"),
} satisfies Record<CloudProvider, RenderableIcon>;

function badge(label: string, color: string): RenderableIcon {
  return {
    viewBox: "0 0 24 24",
    body:
      `<rect width="24" height="24" rx="5" fill="#${color}" />` +
      `<text x="12" y="13" font-family="system-ui, sans-serif" font-size="7.2" font-weight="700" ` +
      `text-anchor="middle" dominant-baseline="central" fill="#ffffff">${label}</text>`,
  };
}

function shouldInstall(provider: CloudProvider, options: InstallCloudIconsOptions): boolean {
  return !options.providers || options.providers.includes(provider);
}

function normalizeKey(value: string): string {
  return value
    .replace(/&/g, " and ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_");
}

function entrySearchText(entry: CloudIconEntry): string {
  return [entry.provider, entry.key, entry.title, entry.category, ...(entry.aliases ?? [])]
    .map(normalizeKey)
    .join(" ");
}

function registerCloudEntry(registerIcon: RegisterIcon, entry: CloudIconEntry): void {
  registerIcon(`${entry.provider}/${entry.key}`, entry.icon);
  for (const alias of entry.aliases ?? []) {
    registerIcon(`${entry.provider}/${alias}`, entry.icon);
  }
}

export function installCloudProviderIcons(
  registerIcon: RegisterIcon,
  options: InstallCloudIconsOptions = {},
): void {
  for (const provider of Object.keys(providerFallbackIcons) as CloudProvider[]) {
    if (shouldInstall(provider, options)) registerIcon(provider, providerFallbackIcons[provider]);
  }
  for (const entry of cloudIconEntries) {
    if (shouldInstall(entry.provider, options)) registerCloudEntry(registerIcon, entry);
  }
}

export function installAwsIcons(registerIcon: RegisterIcon): void {
  installCloudProviderIcons(registerIcon, { providers: ["aws"] });
}

export function installGcpIcons(registerIcon: RegisterIcon): void {
  installCloudProviderIcons(registerIcon, { providers: ["gcp"] });
}

export function installAzureIcons(registerIcon: RegisterIcon): void {
  installCloudProviderIcons(registerIcon, { providers: ["azure"] });
}

export function getCloudIconEntry(
  provider: CloudProvider,
  kind: string,
): CloudIconEntry | undefined {
  const normalized = normalizeKey(kind);
  return cloudIconEntries.find(
    (entry) =>
      entry.provider === provider &&
      (entry.key === normalized || (entry.aliases ?? []).includes(normalized)),
  );
}

export function listCloudIconKeys(provider?: CloudProvider): string[] {
  const keys: string[] = [];
  for (const entry of cloudIconEntries) {
    if (provider && entry.provider !== provider) continue;
    keys.push(`${entry.provider}/${entry.key}`);
    for (const alias of entry.aliases ?? []) keys.push(`${entry.provider}/${alias}`);
  }
  return keys.sort();
}

export function searchCloudIconEntries(
  query: string,
  options: SearchCloudIconOptions = {},
): CloudIconEntry[] {
  const terms = normalizeKey(query).split("_").filter(Boolean);
  const limit = options.limit ?? 20;
  const scored = cloudIconEntries
    .filter((entry) => !options.provider || entry.provider === options.provider)
    .map((entry) => {
      const text = entrySearchText(entry);
      const exactKey = terms.length === 1 && entry.key === terms[0] ? 4 : 0;
      const exactAlias = terms.some((term) => (entry.aliases ?? []).includes(term)) ? 3 : 0;
      const score =
        exactKey +
        exactAlias +
        terms.reduce((sum, term) => sum + (text.includes(term) ? 1 : 0), 0);
      return { entry, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.key.localeCompare(b.entry.key));
  return scored.slice(0, limit).map(({ entry }) => entry);
}
