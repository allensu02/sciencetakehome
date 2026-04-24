import { copyFileSync, mkdirSync } from 'node:fs';
import { build } from 'esbuild';

mkdirSync('dist', { recursive: true });
copyFileSync('src/index.html', 'dist/index.html');

await build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  sourcemap: false,
  minify: true,
  target: ['es2020'],
  outfile: 'dist/app.js',
  define: {
    PUBLIC_SUPABASE_URL: JSON.stringify(process.env.PUBLIC_SUPABASE_URL ?? ''),
    PUBLIC_SUPABASE_ANON_KEY: JSON.stringify(process.env.PUBLIC_SUPABASE_ANON_KEY ?? '')
  }
});
