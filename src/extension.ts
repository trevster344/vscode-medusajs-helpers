import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import prettier from "prettier";

import jobsTemplate from "./templates/jobs";
import apisTemplate from "./templates/api";
import subscribersTemplate from "./templates/subscribers";
import { index, service, loader, model } from "./templates/modules";
import workflowsTemplate from "./templates/workflows";
import providersTemplate from "./templates/providers";
import linksTemplate from "./templates/links";
import stepsTemplate from "./templates/steps";
import modelsTemplate from "./templates/models";

import {
    generateDashedName,
    generatePascalName,
    removeExtension,
    generateUnderscoredName,
    queryFileSearch,
} from "./utils/utils";
import {
    subscriberCommand,
    openQueryTypesFile,
    linkCommand,
    workflowCommand,
    stepCommand,
    jobCommand,
    moduleCommand,
    providerCommand,
    apiCommand,
    modelCommand,
} from "./utils/constants";

const commandHandler = async (uri: vscode.Uri, FileName?: string) => {
    try {
        //console.log("STARTING");

        if (!uri || !uri.fsPath) {
            vscode.window.showErrorMessage("No folder selected.");
            return;
        }

        const folderPath = uri.fsPath;
        const folder_name = folderPath?.split("\\")?.pop() as string;

        //console.log("Forced Name: ", FileName);

        // Prompt user for file name
        let fileName = FileName;

        if (!fileName) console.log("NO NAME: ", fileName);
        fileName = await vscode.window.showInputBox({
            prompt: `Enter a file name`,
            placeHolder: "example.ts",
        });

        //console.log("Filename: ", fileName);

        if (!fileName) {
            vscode.window.showErrorMessage("File creation canceled.");
            return;
        }

        fileName ??= "default_name";
        fileName = fileName?.replace(/\s/g, "_");
        fileName = fileName?.replace(/\.ts/g, "");
        fileName = fileName?.replace(/\.js/g, "");
        fileName += ".ts";

        fileName = generateDashedName(fileName);

        let filePath = path.join(folderPath, fileName);

        const templates: Record<any, string[]> = {
            subscribers: [subscribersTemplate],
            steps: [stepsTemplate],
            workflows: [workflowsTemplate],
            links: [linksTemplate],
            jobs: [jobsTemplate],
            api: [apisTemplate],
            modules: [index, service, loader, model],
            providers: [providersTemplate],
            models: [modelsTemplate],
        };

        let template = templates?.[folder_name];
        let output_template = "";

        //console.log("Template: ", template);

        if (!template) {
            vscode.window.showErrorMessage(
                "Please select a valid folder (e.g., subscribers, modules, providers, workflows, steps, api, jobs, links)."
            );
            return;
        }

        let is_module = false;

        switch (folder_name?.toLowerCase()) {
            case "api":
                // Remove the .ts extension
                filePath = filePath.replace(".ts", "");

                output_template = apisTemplate?.[0];

                if (!fs.existsSync(path.join(filePath))) {
                    fs.mkdirSync(path.join(filePath));
                }

                filePath = path.join(filePath, "route.ts");

                break;
            case "jobs":
                output_template = template?.[0]?.replace(
                    "${job_name}",
                    generatePascalName(
                        (fileName ?? "new")?.split(".ts")?.join("") + "Job"
                    )
                );
                break;
            case "links":
                output_template = template?.[0];

                break;
            case "subscribers":
                output_template = template?.[0]?.replace(
                    "${method_name}",
                    generatePascalName(
                        fileName?.split(".ts")?.join("") + "Handler"
                    )
                );

                break;
            case "steps":
                // Prompt user for a step name
                let step_name = FileName || fileName;

                step_name = removeExtension(step_name) + "Step";

                output_template = template?.[0]?.replace(
                    "${step_name}",
                    generatePascalName(step_name)
                );
                break;

            case "modules":
                is_module = true;
                const module_dir = path.join(
                    folderPath,
                    removeExtension(generateDashedName(fileName))
                );
                const module_name = generatePascalName(
                    path.basename(module_dir)
                );
                if (fs.existsSync(module_dir)) {
                    vscode.window.showErrorMessage(
                        `Module already exists: ${module_dir}`
                    );
                    return;
                }

                if (!fs.existsSync(module_dir)) {
                    fs.mkdirSync(module_dir);
                }

                const pascal_name = module_name ?? "NewModule";
                const indexTemplate = template?.[0]
                    ?.split("${module_name}")
                    .join(pascal_name)
                    ?.split("${module_name_lower}")
                    .join(pascal_name?.toLowerCase());

                const serviceTemplate = template?.[1]
                    ?.split("${module_name}")
                    ?.join(pascal_name);

                const loaderTemplate = template?.[2]
                    ?.split("${module_name}")
                    ?.join(pascal_name);

                const modelTemplate = template?.[3];

                // Create index file
                fs.writeFileSync(
                    path.join(module_dir, "index.ts"),
                    indexTemplate
                );

                // Create service file
                fs.writeFileSync(
                    path.join(module_dir, "service.ts"),
                    serviceTemplate
                );

                // Create loader file
                fs.writeFileSync(
                    path.join(module_dir, "loader.ts"),
                    loaderTemplate
                );

                const modelsFolder = path.join(module_dir, "models");

                if (!fs.existsSync(modelsFolder)) {
                    fs.mkdirSync(modelsFolder);
                }

                // Create model file
                fs.writeFileSync(
                    path.join(modelsFolder, "model.ts"),
                    modelTemplate
                );

                break;

            case "models":
                const model_name = removeExtension(fileName);

                output_template = template?.[0]
                    ?.split("${model_name}")
                    ?.join(generateUnderscoredName(model_name));

                break;
            case "workflows":
                // Prompt user for a step name
                let workflow_name = fileName;

                workflow_name = removeExtension(workflow_name) + "Workflow";

                const pascalName = generatePascalName(workflow_name);
                const stepName = pascalName.replace("Workflow", "");

                output_template = template?.[0]?.replace(
                    "${workflow_name}",
                    pascalName
                );
                output_template = template?.[0]?.replace(
                    "${workflow_title}",
                    generateUnderscoredName(workflow_name)
                );

                let step_import = "";

                const stepFolder = path.join(folderPath, "steps");
                const expectedStep = path.join(stepFolder, `${stepName}.ts`);

                if (fs.existsSync(stepFolder)) {
                    if (!fs.existsSync(expectedStep)) {
                        step_import = `import { ${stepName}Step } from "./steps/${pascalName}";\n`;

                        await vscode.commands.executeCommand(
                            subscriberCommand,
                            vscode.Uri.file(stepFolder),
                            generateDashedName(stepName)
                        );
                    }

                    output_template = template?.[0]?.replace(
                        "${step_name}",
                        stepName + "Step"
                    );
                }

                output_template = template?.[0]?.replace(
                    "${step_import}",
                    step_import
                );

                break;
        }

        // Create the file if its not a module
        if (!is_module) {
            fs.writeFileSync(filePath, output_template);
        }

        vscode.window.showInformationMessage(`✅ File created: ${filePath}`);
    } catch (e: any) {
        console.log("ERROR: ", e);
        vscode.window.showErrorMessage(`❌ Error creating file: ${e?.message}`);
    }
};

function getQueryFilePath() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return;
    const folderPath = workspaceFolders?.[0]?.uri?.fsPath;
    const tsTypesFile = path.join(
        folderPath,
        "app/.medusa/types",
        `query-entry-points.d.ts`
    );
    return tsTypesFile;
}

function escapeRegExp(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const query_file_path = queryFileSearch(
        vscode.workspace.workspaceFolders?.[0].uri.fsPath ?? ""
    );

    let allow_hover = query_file_path?.length;
    if (!query_file_path) {
        vscode.window.showErrorMessage(
            "Unable to locate query-entry-points.d.ts file. Hover features disabled."
        );
    }

    if (allow_hover) {
        const hoverHelper = vscode.languages.registerHoverProvider(
            "typescript",
            {
                async provideHover(document, position, token) {
                    //console.log("HOVER TRIGGERED");

                    const range = document.getWordRangeAtPosition(
                        position,
                        /"[^"]+"/
                    );
                    const word =
                        document
                            .getText(range)
                            .replace(/"/g, "")
                            ?.split("_")
                            ?.join("") ?? "";

                    const lineText = document.lineAt(position.line).text;

                    if (
                        (lineText?.includes("entity:") ||
                            lineText?.includes("entryPoint:")) &&
                        word
                    ) {
                        const workspaceFolders =
                            vscode.workspace.workspaceFolders;
                        if (!workspaceFolders) return;

                        const tsTypesFile = query_file_path;
                        //console.log("Types file: " + tsTypesFile);

                        const tsTypeContent = fs.readFileSync(
                            tsTypesFile!,
                            "utf8"
                        );
                        let preview = "";

                        try {
                            const found_indexes: any = {};

                            //let
                            const lines = tsTypeContent?.split("\n") ?? [];

                            const expression = new RegExp(
                                `export type (${escapeRegExp(word)}) =`,
                                "gi"
                            );

                            const matches = lines.map((e, i) => ({
                                match: e.match(expression),
                                index: i,
                            }));

                            preview =
                                matches
                                    ?.filter((e) => !!e.match)
                                    ?.map(({ match: e, index: startIndex }) => {
                                        const endIndex = lines?.findIndex(
                                            (line, index) =>
                                                index > startIndex &&
                                                line.includes("}")
                                        );
                                        const raw_script =
                                            lines
                                                ?.slice(
                                                    startIndex,
                                                    endIndex + 1
                                                )
                                                .join("\n") ?? "";
                                        return raw_script;
                                    })
                                    ?.join("\n") ?? "";
                        } catch (e: any) {
                            vscode.window.showErrorMessage(
                                `Error parsing TS types file: ${e?.message}`
                            );
                            preview = "";
                        }

                        const formatted = await prettier
                            .format(preview, {
                                parser: "typescript",
                                semi: true,
                                singleQuote: true,
                            })
                            .catch((e) => e?.message);

                        const markdown = new vscode.MarkdownString();
                        markdown.appendCodeblock(formatted, "typescript");

                        markdown.appendMarkdown(
                            `\n\n[Open File](command:${openQueryTypesFile})\n\n`
                        );

                        // markdown.appendMarkdown(
                        //     `\n\n[Search](command:${typeSearchPanelCommand})\n\n`
                        // );

                        markdown.isTrusted = true;

                        return new vscode.Hover(markdown, range);
                    }
                },
            }
        );
        context.subscriptions.push(hoverHelper);
    }

    // ---------------------------
    // Register commands
    // ---------------------------

    for (const command of [
        subscriberCommand,
        linkCommand,
        workflowCommand,
        stepCommand,
        jobCommand,
        moduleCommand,
        providerCommand,
        apiCommand,
        modelCommand,
    ]) {
        const disposable = vscode.commands.registerCommand(
            command,
            commandHandler
        );

        context.subscriptions.push(disposable);
    }

    const openQueryTypesDisposable = vscode.commands.registerCommand(
        openQueryTypesFile,
        () => {
            let uri: any = query_file_path;
            uri = vscode.Uri.file(uri);
            vscode.window.showTextDocument(uri, { preview: false });
        }
    );

    // function getWebviewContent(): string {
    //     return `
    //     <!DOCTYPE html>
    //     <html lang="en">
    //     <head>
    //     <meta charset="UTF-8">
    //     <title>Simulation Panel</title>
    //     </head>
    //     <body>
    //     <h1>Welcome to the Simulation Panel</h1>
    //     <input type="text" id="searchBox" placeholder="Search..." />
    //     <div id="results"></div>

    //     <script>
    //         const input = document.getElementById('searchBox');
    //         input.addEventListener('input', () => {
    //         const query = input.value;
    //         document.getElementById('results').innerText = 'Searching for: ' + query;
    //         });
    //     </script>
    //     </body>
    //     </html>
    // `;
    // }

    // const typeSearchDisposable = vscode.commands.registerCommand(
    //     typeSearchPanelCommand,
    //     () => {
    //         const panel = vscode.window.createWebviewPanel(
    //             "medusa_code_search_panel", // Internal ID
    //             "Code Search", // Title
    //             vscode.ViewColumn.One, // Where to show
    //             {
    //                 enableScripts: true, // Allow JS in the webview
    //             }
    //         );

    //         panel.webview.html = getWebviewContent();
    //     }
    // );

    //context.subscriptions.push(typeSearchDisposable);
    context.subscriptions.push(openQueryTypesDisposable);

    // ---------------------------
}

export function deactivate() {}
