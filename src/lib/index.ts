import fs from "fs";
import path from "path";
import * as vscode from "vscode";
import prettier from "prettier";
import { openQueryTypesFile } from "../utils/constants";
import { queryTypeSearchWebView } from "../webviews";

export const generateDashedName = (name: string) => {
    return name
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .split("_")
        .join("")
        .toLowerCase();
};

export const generateUnderscoredName = (name: string) => {
    return name
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .split("-")
        .join("")
        .toLowerCase();
};

export const generatePascalName = (str: string): string => {
    return str
        .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space before uppercase letters
        .split(/[\s-_]+/) // Split by spaces, hyphens, or underscores
        .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ) // Capitalize first letter
        .join(""); // Join back together
};

export const removeExtension = (name: string) => {
    return typeof name === "string" ? name?.split(".")?.[0] || "" : "";
};

export const removePlural = (name: string) => {
    return name?.replace(/s$/, "") || "";
};

export const recursiveFileSearch = (
    rootDir: string,
    file_name: string,
    file_filter?: (path: string) => boolean | undefined | null
): string | undefined => {
    const entries = fs.readdirSync(rootDir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(rootDir, entry.name);

        if (
            entry.isFile() &&
            entry.name.indexOf(file_name) !== -1 &&
            (!file_filter || !!file_filter(fullPath))
        ) {
            return fullPath;
        }

        if (entry.isDirectory() && entry.name.indexOf("node_modules") === -1) {
            const result: string | undefined = recursiveFileSearch(
                fullPath,
                file_name
            );
            if (result) return result;
        }
    }

    return undefined;
};

export const queryFileSearch = (rootDir: string): string | undefined => {
    return recursiveFileSearch(rootDir, "query-entry-points.d.ts");
};

function escapeRegExp(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const generateTypeHover = async (
    query_file_path: string,
    typename: string,
    location: vscode.Range
) => {
    if (!location) return;

    const type_text = await getTypeInQueryFile(query_file_path, typename);

    const markdown = new vscode.MarkdownString();
    if (type_text?.length) markdown.appendCodeblock(type_text, "typescript");

    markdown.appendMarkdown(
        `\n\n[Open File](command:${openQueryTypesFile})\n\n`
    );

    markdown.isTrusted = true;

    return new vscode.Hover(markdown, location);
};

export const getTypeInQueryFile = async (
    query_file_path: string,
    typename: string
) => {
    if (!query_file_path) return;
    if (!typename) return;

    if (typename) {
        const tsTypesFile = query_file_path;
        //console.log("Types file: " + tsTypesFile);

        const tsTypeContent = fs.readFileSync(tsTypesFile!, "utf8");
        let preview = "";

        try {
            const lines = tsTypeContent?.split("\n") ?? [];
            const expression = new RegExp(
                `export type (${escapeRegExp(typename)}(?:.+)?) =`,
                "gi"
            );

            const matches = lines
                .map((e, i) => ({
                    match: e.match(expression),
                    index: i,
                }))
                ?.filter((e) => !!e.match);

            preview =
                matches
                    ?.map(({ match: e, index: startIndex }) => {
                        const endIndex = lines?.findIndex(
                            (line, index) =>
                                index > startIndex && line.includes("}")
                        );
                        const raw_script =
                            lines?.slice(startIndex, endIndex + 1).join("\n") ??
                            "";
                        return raw_script;
                    })
                    ?.join("\n\n") ?? "";
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
            .catch((e: any) => e?.message);

        return formatted;
    }
};

let _typePanel: vscode.WebviewPanel | undefined = undefined;
export const createQueryTypePanel = (
    context: vscode.ExtensionContext,
    query?: string
) => {
    if (_typePanel) {
        _typePanel.reveal();
        return _typePanel;
    }

    const panel = vscode.window.createWebviewPanel(
        "medusa_code_search_panel", // Internal ID
        "Medusa: Type Search", // Title
        vscode.ViewColumn.One, // Where to show
        {
            enableScripts: true, // Allow JS in the webview
            localResourceRoots: [
                vscode.Uri.joinPath(context.extensionUri, "out"),
            ],
        }
    );

    panel.onDidDispose(() => {
        _typePanel = undefined; // Clean up when closed
    });

    const clientJsUri = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(
            context.extensionUri,
            "out",
            "src",
            "webviews",
            "client.js"
        )
    );

    const clientCssUri = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(
            context.extensionUri,
            "out",
            "src",
            "webviews",
            "client.css"
        )
    );

    panel.webview.html = queryTypeSearchWebView(clientJsUri, clientCssUri);

    _typePanel = panel;
    return _typePanel;
};

export const removeUndefined = (obj: any) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
    );
};

export const getSelectedText = () => {
    let word: string | undefined = undefined;
    let range: vscode.Range | undefined = undefined;

    const editor = vscode.window.activeTextEditor;

    // 1️⃣ Check for selected text
    const selection = editor?.selection;
    if (selection && !selection.isEmpty) {
        word = editor?.document.getText(selection);
        range = selection;
    }

    // Remove the _ from any type names as they are not part of the actual type
    word = word?.replace(/"/g, "")?.split("_")?.join("") ?? "";
    return { word, range };
};
