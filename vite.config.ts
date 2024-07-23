import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import wasm from "vite-plugin-wasm";

export default defineConfig({
    base: './',
    plugins: [react(),wasm()],
    server: {    
        open: true,
        port: 3000, 
        fs: {
            //allow: ['C:/Projects/sdk/dist/lib/services/cryptography/web_assembly', 'C:/Projects/sdk/test-frontend']
            allow:['./', '../dist/lib/services/']
          }
    },
    resolve: {
        alias: {
            '@intuweb3/exp-web': '/node_modules/@intuweb3/exp-web/lib/index.js',
        },
    },
    //resolve: {
    //    alias: [
    //    { find: '@', replacement: path.resolve(__dirname, 'src') },
    //],
    //},
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true,
        rollupOptions: {
          external:[
            //"@intuweb3/exp-web/services/web3/contracts/abi/VaultFactory.json",
            //"@intuweb3/exp-web"
          ],
            input: {
                main: resolve(__dirname, 'index.html'),
                //nested: resolve(__dirname, 'nested/index.html')
            }
        },
    }
})
