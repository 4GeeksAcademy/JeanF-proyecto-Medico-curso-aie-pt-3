# HealthCore TypeScript Data Module

## What is included

- `types/models.ts`: domain entities and base helper methods.
- `utils/collections.ts`: filter, sort and group collection helpers.
- `utils/search.ts`: linear and binary search implementations.
- `utils/transformations.ts`: aggregation and reporting functions.
- `utils/validations.ts`: business validations and dataset-level validation.
- `examples/sampleData.ts`: typed object literals for HealthCore entities.
- `examples/quickChecks.ts`: quick checks to exercise filter, sort, search, reports, and validations.

## Validate TypeScript

```bash
npm install
npm run typecheck
```

Alternative direct command:

```bash
npx tsc --noEmit
```

## Quick checks example

```ts
import { runQuickChecks } from "./main";

const result = runQuickChecks();
console.log(result.datasetValidation.isValid);
console.log(result.appointmentReport.noShowRate);
```
