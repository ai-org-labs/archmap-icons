# @archmap/icons v0.1.1

Packaging and documentation polish after the initial release.

## Highlights

- Adds `prepare` and `prepack` scripts so GitHub installs and npm packing build `dist/` automatically.
- Adds `npm test` coverage for representative icon registration and alias lookup.
- Adds `docs/ICON-CATALOG.md`, a generated full catalog of common service keys and AWS/GCP/Azure provider-kind keys.
- Documents npm, GitHub install, and ESM CDN usage expectations.
- Includes `docs/` in the npm package file list so the catalog ships with the package.

## Validation

- `npm test`
- `npm --cache /tmp/archmap-icons-npm-cache pack --dry-run`
