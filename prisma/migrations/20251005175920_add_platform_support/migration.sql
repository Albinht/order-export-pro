-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'shopify',
    "accessToken" TEXT,
    "consumerKey" TEXT,
    "consumerSecret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Store" ("accessToken", "createdAt", "domain", "id", "isActive", "name", "updatedAt") SELECT "accessToken", "createdAt", "domain", "id", "isActive", "name", "updatedAt" FROM "Store";
DROP TABLE "Store";
ALTER TABLE "new_Store" RENAME TO "Store";
CREATE UNIQUE INDEX "Store_domain_key" ON "Store"("domain");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
