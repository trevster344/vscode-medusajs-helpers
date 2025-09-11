const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Pre-build Step: Move client dist files to medusa-helpers/src/webviews
const clientDistDir = path.resolve("./out-client");
//const webviewsDir = path.resolve("./src/webviews");

// fs.readdirSync(clientDistDir, { recursive: true }).forEach((file) => {
//     if (file !== "index.html") {
//         fs.copyFileSync(
//             path.join(clientDistDir, file),
//             path.join(webviewsDir, file)
//         );
//     }
// });

// Step 1: Read version from package.json
const pkg = require("./package.json");
const version = pkg.version;
const extensionName = pkg?.name?.split("/")?.join("-");

// Step 2: Define output path
const _dir = path.resolve("./releases");
const outputDir = path.join(_dir, version);
const outputFile = path.join(outputDir, `${extensionName}-${version}.vsix`);

// Step 3: Ensure output directory exists
fs.mkdirSync(outputDir, { recursive: true });

// Step 4: Run vsce package command
try {
    execSync(`npx vsce package -o "${outputFile}"`, { stdio: "inherit" });
    console.log(`✅ VSIX packaged at: ${outputFile}`);
} catch (err) {
    console.error(`❌ Packaging failed: ${err.message}`);
}

const outSrcWebviews = path.resolve("./out/src/webviews");

// Post-build Step: Move client dist files to out/src/webviews
fs.readdirSync(clientDistDir, { recursive: true }).forEach((file) => {
    if (
        file !== "index.html" &&
        (file.endsWith(".js") || file.endsWith(".map") || file.endsWith(".css"))
    ) {
        fs.copyFileSync(
            path.join(clientDistDir, file),
            path.join(outSrcWebviews, file)
        );
    }
});
