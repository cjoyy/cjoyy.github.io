import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    open: true,
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'projects.html', dest: '.' },
        { src: 'experience.html', dest: '.' },
        { src: 'contact.html', dest: '.' },
        { src: 'CNAME', dest: '.' },
      ],
    }),
  ],
});
