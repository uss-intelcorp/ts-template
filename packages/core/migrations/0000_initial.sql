CREATE TABLE `health_checks` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `source` text DEFAULT 'system' NOT NULL,
  `message` text DEFAULT 'ok' NOT NULL,
  `created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_health_checks_created_at` ON `health_checks` (`created_at` DESC);
