import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  cloudIconCounts,
  cloudIconEntries,
  famousServiceIconEntries,
} from "../dist/index.js";

const outputFile = process.argv[2] ?? "docs/ICON-CATALOG.md";

function row(values) {
  return `| ${values.map((value) => String(value).replace(/\|/g, "\\|")).join(" | ")} |`;
}

function aliases(entry) {
  return (entry.aliases ?? []).map((alias) => `\`${alias}\``).join(", ");
}

const lines = [
  "# Icon Catalog",
  "",
  "Generated from the package exports. Use keys as ArchMap `provider` values for common services, or as `provider/kind` pairs for cloud services.",
  "",
  "## Summary",
  "",
  row(["Set", "Count"]),
  row(["---", "---:"]),
  row(["Common external services", famousServiceIconEntries.length]),
  row(["AWS service icons", cloudIconCounts.aws]),
  row(["Google Cloud service icons", cloudIconCounts.gcp]),
  row(["Azure service icons", cloudIconCounts.azure]),
  "",
  "## Common External Services",
  "",
  row(["Key", "Title", "Role", "Aliases"]),
  row(["---", "---", "---", "---"]),
];

for (const entry of famousServiceIconEntries) {
  lines.push(row([`\`${entry.key}\``, entry.title, entry.role, aliases(entry)]));
}

for (const provider of ["aws", "gcp", "azure"]) {
  lines.push(
    "",
    `## ${provider.toUpperCase()} Cloud Services`,
    "",
    row(["Kind", "ArchMap key", "Title", "Category", "Aliases"]),
    row(["---", "---", "---", "---", "---"]),
  );
  for (const entry of cloudIconEntries.filter((item) => item.provider === provider)) {
    lines.push(row([`\`${entry.key}\``, `\`${provider}/${entry.key}\``, entry.title, entry.category, aliases(entry)]));
  }
}

mkdirSync(dirname(outputFile), { recursive: true });
writeFileSync(outputFile, `${lines.join("\n")}\n`);
console.log(`Wrote ${outputFile}`);
