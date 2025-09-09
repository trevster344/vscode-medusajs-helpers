# vscode-medusa-helpers

Medusa Helpers is a Visual Studio Code extension that provides productivity tools for working with [MedusaJS](https://medusajs.com/) projects. It streamlines the creation of common Medusa project files and folders, and offers quick access to type information.

## Features

- **Context Menu Commands**: Quickly generate new Medusa files (subscribers, modules, providers, workflows, steps, jobs, links, API routes) from the Explorer context menu.
- **TypeScript Hover Helper**: Hover over entity or entryPoint strings in TypeScript files to preview generated type definitions from your Medusa project's types.
- **Quick File Creation**: Prompts for file names and generates boilerplate code using templates for each template creation.
- **Open Query Types File**: Instantly open the Medusa query-entry-points type file for reference.

## Usage

1. **Right-click** on a folder in the Explorer (e.g., `subscribers`, `modules`, `providers`, `workflows`, `steps`, `api`, `jobs`, `links`).
2. Select the appropriate `Medusa: New ...` command to generate a new file.
3. Enter a file name when prompted. The extension will create the file with boilerplate code.
4. Hover over entity or entryPoint strings in remote query TypeScript files to see accurate query type previews.
5. Use the command palette to run `Medusa: Open Query Types File` for quick access to type definitions.

## Commands

- `Medusa: New Subscriber`
- `Medusa: New Workflow`
- `Medusa: New Step`
- `Medusa: New Link`
- `Medusa: New Job`
- `Medusa: New Provider`
- `Medusa: New Module`
- `Medusa: New Model`
- `Medusa: New API`
- `Medusa: Open Query Types File`

## Requirements

- Visual Studio Code v1.98.0 or higher
- A MedusaJS project structure 2.0+ (recommended)

## Installation

1. Download the `.vsix` file or install from the VS Code Marketplace (if published).
2. Open VS Code, go to the Extensions view, and click `... > Install from VSIX...`.
3. Select the downloaded file to install.

## Development

- Clone the repository.
- Run `npm install` to install dependencies.
- Run `npm run compile` to build the extension.
- Press `F5` to launch the Extension Host for debugging.

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

## License

MIT
