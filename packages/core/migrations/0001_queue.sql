CREATE TABLE `queue_jobs` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `queue` text DEFAULT 'default' NOT NULL,
  `type` text NOT NULL,
  `payload` text NOT NULL,
  `available_at` text DEFAULT (datetime('now')) NOT NULL,
  `reserved_at` text,
  `attempts` integer DEFAULT 0 NOT NULL,
  `max_attempts` integer DEFAULT 3 NOT NULL,
  `idempotency_key` text,
  `last_error` text,
  `created_at` text DEFAULT (datetime('now')) NOT NULL,
  `updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_queue_jobs_ready` ON `queue_jobs` (`queue`,`available_at`,`reserved_at`);
--> statement-breakpoint
CREATE UNIQUE INDEX `queue_jobs_idempotency_unique` ON `queue_jobs` (`idempotency_key`);
--> statement-breakpoint
CREATE TABLE `failed_queue_jobs` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `job_id` integer,
  `queue` text NOT NULL,
  `type` text NOT NULL,
  `payload` text NOT NULL,
  `attempts` integer NOT NULL,
  `error` text NOT NULL,
  `failed_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_failed_queue_jobs_failed_at` ON `failed_queue_jobs` (`failed_at` DESC);
