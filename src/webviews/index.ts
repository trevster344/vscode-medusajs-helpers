import * as vscode from "vscode";
export const queryTypeSearchWebView = (jsUri: vscode.Uri, cssUri: vscode.Uri) =>
    `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Medusa: Type Search</title>
        <script type="module" crossorigin src="${jsUri}"></script>
        <link rel="stylesheet" crossorigin href="${cssUri}">
      </head>
      <body>
        <div id="app"></div>
      </body>
    </html>
`;
