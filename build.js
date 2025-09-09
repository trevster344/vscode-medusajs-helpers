const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Step 1: Read version from package.json
const pkg = require("./package.json");
const version = pkg.version;
const extensionName = pkg.name || "my-extension";

// Step 2: Define output path
const outputDir = path.join(__dirname, "releases", version);
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
