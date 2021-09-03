const pkg = require('./package.json');

require('esbuild').buildSync({
    entryPoints: ['src/index.ts'],
    outdir: 'lib',
    bundle: true,
    sourcemap: true,
    preserveSymlinks: true,
    target: 'es2021',
    external: [...Object.keys(pkg.peerDependencies || {}), '*.css', '*.less', 'crypto'],
});
