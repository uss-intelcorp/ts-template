const databasePath = `${__dirname}/packages/web/data/ts-template.db`;
const commonEnv = {
  NODE_ENV: 'production',
  APP_NAME: process.env.APP_NAME ?? 'TS Template',
  DATABASE_PATH: process.env.DATABASE_PATH ?? databasePath,
  HOST: process.env.HOST ?? '0.0.0.0',
  PORT: process.env.PORT ?? '8790',
};

module.exports = {
  apps: [
    {
      name: 'ts-template-web',
      cwd: './packages/web',
      script: 'src/node.ts',
      interpreter: 'node',
      node_args: ['--env-file-if-exists=.dev.vars', '--import', 'tsx'],
      env: commonEnv,
      time: true,
      max_memory_restart: '1G',
    },
    {
      name: 'ts-template-scheduler',
      cwd: './packages/background',
      script: 'src/scheduler.ts',
      interpreter: 'node',
      node_args: ['--env-file-if-exists=../web/.dev.vars', '--import', 'tsx'],
      env: commonEnv,
      time: true,
      max_memory_restart: '512M',
    },
    {
      name: 'ts-template-worker',
      cwd: './packages/background',
      script: 'src/worker.ts',
      interpreter: 'node',
      node_args: ['--env-file-if-exists=../web/.dev.vars', '--import', 'tsx'],
      env: commonEnv,
      time: true,
      max_memory_restart: '512M',
    },
  ],
};
