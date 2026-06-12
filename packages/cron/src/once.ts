import { createRuntime } from './runtime';

const runtime = await createRuntime();
await runtime.heartbeat();
console.log(`recorded heartbeat (db: ${runtime.databasePath})`);
runtime.client.close();
