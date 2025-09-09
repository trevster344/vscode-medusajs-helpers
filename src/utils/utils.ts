import fs from "fs";
import path from "path";

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
