# @archmap/icons v0.1.0

Initial release of the opt-in icon pack for ArchMap.

## Highlights

- Adds common external service icons for observability, edge/security, identity, developer platforms, ITSM, databases, containers, IaC, chat, and app hosting.
- Adds generated cloud provider service icon catalogs:
  - AWS: 305 service icons
  - Google Cloud: 261 service icons
  - Azure: 705 service icons
- Registers practical aliases for AI/code-generation use, such as `aws/s3`, `gcp/gcs`, `gcp/gke`, `azure/vm`, `azure/aks`, `azure/vnet`, and `azure/keyvault`.
- Adds cloud icon discovery helpers:
  - `getCloudIconEntry`
  - `listCloudIconKeys`
  - `searchCloudIconEntries`
- Adds a reproducible cloud icon generation script.
- Adds QIF v0.3.0 quality review package and smoke tests.

## Validation

- `npm test`
- QIF validation passed with no warnings or errors.
