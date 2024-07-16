import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'
import path from "node:path";
import wasm from "vite-plugin-wasm";

console.log("RUNNING VITE CONFIG")

export default defineConfig({
    base: './',
    plugins: [react(),wasm(),viteTsconfigPaths()],
    server: {    
        open: true,
        port: 3000, 
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