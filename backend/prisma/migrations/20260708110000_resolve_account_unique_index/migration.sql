-- Resolves pre-existing schema drift: schema.prisma declares @@unique([providerId, accountId])
-- on `account` but no migration ever created the index.
-- NOTE: fails if duplicate (providerId, accountId) rows exist in prod — verify/dedupe before deploy.
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");
