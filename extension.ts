import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import jobsTemplate from "./src/templates/jobs";
import apisTemplate from "./src/templates/api";
import subscribersTemplate from "./src/templates/subscribers";
import { index, service, loader, model } from "./src/templates/modules";
import workflowsTemplate from "./src/templates/workflows";
import providersTemplate from "./src/templates/providers";
import linksTemplate from "./src/templates/links";
import stepsTemplate from "./src/templates/steps";
import modelsTemplate from "./src/templates/models";

import {
    generateDashedName,
    generatePascalName,
    removeExtension,
    generateUnderscoredName,
    queryFileSearch,
    generateTypeHover,
    createQueryTypePanel,
    removeUndefined,
    getSelectedText,
    getTypeInQueryFile,
} from "./src/lib";
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
    typeQueryTypeSearch,
} from "./src/utils/constants";

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

                    let word: string | undefined = undefined;
                    const editor = vscode.window.activeTextEditor;
                    let range: vscode.Range | undefined = undefined;

                    // 1️⃣ Check for selected text
                    const selection = editor?.selection;
                    if (selection && !selection.isEmpty) {
                        word = document.getText(selection);
                        range = selection;
                    } else {
                        range = document.getWordRangeAtPosition(
                            position,
                            /"[^"]+"/
                        );

                        const _line = document.lineAt(position.line).text;

                        if (
                            _line?.includes("entity:") ||
                            _line?.includes("entryPoint:")
                        ) {
                            word = document.getText(range);
                        }
                    }

                    // Remove the _ from any type names as they are not part of the actual type
                    word = word?.replace(/"/g, "")?.split("_")?.join("") ?? "";

                    if (word) {
                        return await generateTypeHover(
                            query_file_path!,
                            word,
                            range!
                        );
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

    const typeQuerySearchDisposable = vscode.commands.registerCommand(
        typeQueryTypeSearch,
        async () => {
            const panel = createQueryTypePanel(context);
            const query = getSelectedText();
            const result = await getTypeInQueryFile(
                query_file_path!,
                query.word
            );

            panel.webview.onDidReceiveMessage(async (message) => {
                if (message.type === "search") {
                    const query = message?.payload?.query;
                    const query_result = await getTypeInQueryFile(
                        query_file_path!,
                        query
                    );

                    panel.webview.postMessage({
                        type: "search",
                        payload: removeUndefined({
                            query: query,
                            result: query_result,
                        }),
                    });
                }
            });

            panel.webview.postMessage({
                type: "search",
                payload: removeUndefined({ query: query.word, result }),
            });
        }
    );

    context.subscriptions.push(typeQuerySearchDisposable);
    context.subscriptions.push(openQueryTypesDisposable);

    // ---------------------------
}

export function deactivate() {}
