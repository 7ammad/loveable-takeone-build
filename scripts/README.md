# Scripts Directory

This directory contains utility scripts for development, testing, and operations.

## Categories

### 🔧 Setup & Configuration
- `setup-digital-twin.ts` - Initialize Digital Twin system
- `setup-webhook-now.ts` - Configure webhooks
- `configure-webhook-direct.ts` - Direct webhook configuration
- `configure-whapi-webhook.ts` - Whapi webhook setup

### 👥 User Management
- `grant-admin.ts` - Grant admin role to user
- `grant-admin-all.ts` - Grant admin to multiple users
- `list-users.ts` - List all users

### 🔍 Monitoring & Debugging
- `check-digital-twin-status.ts` - Check DT system health
- `check-pipeline-health.ts` - Verify processing pipeline
- `check-queue-status.ts` - Monitor queue status
- `check-dlq.ts` - Check dead letter queue
- `check-llm-failures.ts` - Analyze LLM failures
- `diagnose-whapi.ts` - Debug Whapi integration

### 📊 Data Analysis
- `analyze-instagram-sources.ts` - Analyze Instagram sources
- `analyze-missed-calls-failure.ts` - Analyze missed casting calls
- `analyze-rejected-messages.ts` - Review rejected messages
- `inspect-queue-jobs.ts` - Inspect queue jobs
- `inspect-recent-posts.ts` - Review recent posts
- `find-duplicate-calls.ts` - Find duplicate casting calls

### 🧹 Cleanup & Maintenance
- `cleanup-validation-queue.ts` - Clean validation queue
- `cleanup-whatsapp-sources.ts` - Clean Whatsapp sources
- `cleanup-non-whatsapp-sources.ts` - Remove non-Whatsapp sources
- `deactivate-instagram-sources.ts` - Deactivate Instagram
- `deactivate-low-quality-sources.ts` - Remove poor sources

### 🔄 Data Operations
- `add-saudi-sources.ts` - Add Saudi sources
- `replace-with-saudi-sources.ts` - Replace with Saudi sources
- `import-whatsapp-groups.ts` - Import Whatsapp groups
- `manually-queue-casting-calls.ts` - Manually queue calls

### 🧪 Testing
- `test-digital-twin.ts` - Test DT system
- `test-complete-pipeline.ts` - Test full pipeline
- `test-webhook-endpoint.ts` - Test webhooks
- `test-single-whatsapp-message.ts` - Test message processing
- `run-auth-tests.ps1` - Run auth test suite (PowerShell)
- `test-all-apis.ps1` - Test all APIs (PowerShell)

### 🤖 Orchestration
- `orchestrator-web.ts` - Web scraping orchestrator
- `orchestrator-whatsapp.ts` - Whatsapp orchestrator
- `start-workers.ts` - Start queue workers
- `process-queue-jobs.ts` - Process queued jobs
- `trigger-orchestration-now.ts` - Trigger immediate orchestration

### 📝 Documentation
- `code-review-checklist.md` - Code review guidelines
- `data-recovery-guide.md` - Data recovery procedures

## Usage Examples

### Grant Admin Role
```bash
npm run tsx scripts/grant-admin.ts user@example.com
```

### Check System Health
```bash
npm run tsx scripts/check-digital-twin-status.ts
npm run tsx scripts/check-pipeline-health.ts
```

### Monitor Queues
```bash
npm run tsx scripts/check-queue-status.ts
npm run tsx scripts/check-dlq.ts
```

### Testing
```bash
# Run authentication tests
pwsh scripts/run-auth-tests.ps1

# Test complete pipeline
npm run tsx scripts/test-complete-pipeline.ts
```

### Cleanup
```bash
npm run tsx scripts/cleanup-validation-queue.ts
npm run tsx scripts/deactivate-low-quality-sources.ts
```

## Important Notes

1. **Environment Variables:** Most scripts require `.env` file to be configured
2. **Database Access:** Scripts interact with the database directly - use with caution in production
3. **Permissions:** Some scripts require admin privileges
4. **Testing:** Always test scripts in development/staging before production use

## Development Scripts

### PowerShell Scripts
- `run-auth-tests.ps1` - Run authentication test suite
- `test-all-apis.ps1` - Test all API endpoints
- `full-code-review.ps1` - Run comprehensive code review
- `fix-route-handlers.ps1` - Fix route handler issues

## Subdirectories

### `services/`
Standalone service implementations for testing:
- `firecrawl-service.ts` - Firecrawl integration
- `whapi-service.ts` - Whapi integration

### `search/`
Search-related utilities and scripts

## Best Practices

1. **Read before running** - Review script code before execution
2. **Backup first** - Backup database before running destructive operations
3. **Use staging** - Test in staging environment first
4. **Log output** - Redirect output to log files for auditing
5. **Error handling** - Scripts include error handling, but monitor execution
6. **Documentation** - Update this README when adding new scripts

## Adding New Scripts

When adding a new script:
1. Add descriptive name following existing naming conventions
2. Include usage instructions in comments at top of file
3. Add entry to appropriate category in this README
4. Add error handling and logging
5. Test thoroughly in development

## Maintenance

Scripts should be reviewed and updated:
- When dependencies are updated
- When database schema changes
- When API changes occur
- Quarterly for obsolete scripts

## Support

For issues with scripts, contact the development team or create an issue in the repository.

---

**Last Updated:** October 10, 2025

