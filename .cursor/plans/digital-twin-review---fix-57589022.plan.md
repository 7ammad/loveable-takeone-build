<!-- 57589022-7e42-4a61-9960-4a021c921264 c2b2cbfc-8f3e-4d5d-8746-dec9495b7b8d -->
# Plan: Resolve Route Slug Conflict

This plan will permanently fix the `castingCallId` vs. `id` dynamic path error. The issue stems from conflicting folder names in the API routes, which Next.js interprets as ambiguous URLs.

### 1. Identify and Delete Conflicting Routes

I will locate and delete the directories using the outdated `[castingCallId]` slug. The primary conflict area is within the admin API routes.

- **Action**: Delete the `app/api/v1/admin/casting-calls/[castingCallId]` directory and its contents.
- **Verification**: List the directory contents before and after to confirm removal.

### 2. Standardize Route Parameter Usage

I will search the codebase for any remaining uses of `castingCallId` as a URL parameter and update them to use `id`. This ensures consistency across the entire application and prevents future conflicts.

- **Action**: `grep` for "castingCallId" across the project.
- **Action**: Read any files that use it as a route parameter.
- **Action**: Refactor the code to use `id` instead of `castingCallId`.

### 3. Final Verification

After applying the fixes, I will run a final production build. This will definitively confirm that the routing conflict has been resolved.

- **Action**: Run `pnpm build`.
- **Verification**: The build should complete without any slug-related errors.


### To-dos

- [ ] Fix Prisma query in team route to remove select/include conflict
- [ ] Integrate BullMQ workers into background service so they actually run
- [ ] Review FireCrawl and Apify API implementations against official docs
- [ ] Replace mock LLM with real OpenAI/Anthropic integration
- [ ] Verify database schema supports all Digital Twin fields
- [ ] Complete Next.js 15 async params migration for remaining routes
- [ ] Test complete Digital Twin flow from scraping to admin approval
- [ ] Update documentation with fixes and troubleshooting guide