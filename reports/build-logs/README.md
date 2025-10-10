# Build Logs & Error Reports

This directory contains build outputs, compilation logs, and linter error reports.

## Contents

### Build Reports
- `build-report.json` - Detailed build analysis (JSON format)
- `build-report.txt` - Human-readable build report
- `core-packages-check.txt` - Core package verification log

### Linter Reports
- `eslint-errors.txt` - ESLint error reports
- `eslint-errors-v2.txt` - Updated ESLint error reports

### TypeScript Compilation Logs
- `ts-check.txt` - TypeScript check results
- `typescript-errors*.txt` - Various TypeScript compilation error logs

## Usage

These files are generated during development and can be used for:
- Debugging build failures
- Tracking error resolution progress
- Identifying patterns in compilation issues
- Historical reference for troubleshooting

## Maintenance

- **Retention**: Keep logs from the last 3 major builds
- **Cleanup**: Delete older logs when they're no longer needed for reference
- **Git**: These files are gitignored by default

## Ignored in Git

Build logs are automatically excluded from version control via `.gitignore`:
```
reports/build-logs/*.txt
reports/build-logs/*.json
```

This keeps the repository clean while allowing local development debugging.

