// website/vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    root: ".",
    define: {
        "process.env.MODE": JSON.stringify(
            process.env.NODE_ENV || "development"
        ),
    },

    plugins: [
        vue({
            template: {
                compilerOptions: {
                    hoistStatic: true,
                    cacheHandlers: true,
                },
            },
        }),
    ],

    optimizeDeps: {
        include: ["vue"],
        exclude: [],
    },
    build: {
        rollupOptions: {
            output: {
                dir: "../out-client",
                entryFileNames: "client.js",
                chunkFileNames: "client.js",
                assetFileNames(chunkInfo) {
                    return "client.[ext]";
                },
            },
        },
        sourcemap: true,
    },
});
