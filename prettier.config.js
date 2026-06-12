/** @type {import('prettier').Config} */
export default {
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './packages/web/src/styles/index.css',
  printWidth: 120,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
};
