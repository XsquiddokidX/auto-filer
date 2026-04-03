import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
let webviewPanel;
export function activate(context) {
    console.log('Auto Filer extension activated');
    // Register the sidebar webview provider
    const provider = new FileSidebarProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('autofiler.fileCreator', provider, {
        webviewOptions: {
            retainContextWhenHidden: true,
        },
    }));
    // Create files command
    const createCommand = vscode.commands.registerCommand('autofiler.createFiles', async () => {
        await createFilesDialog();
    });
    context.subscriptions.push(createCommand);
    // Load config command
    const loadConfigCommand = vscode.commands.registerCommand('autofiler.loadConfig', async () => {
        await loadConfigFile();
    });
    context.subscriptions.push(loadConfigCommand);
}
class FileSidebarProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, context, token) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getHtmlContent(webviewView.webview);
        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'createFiles':
                    await handleCreateFiles(message.files);
                    webviewView.webview.postMessage({
                        command: 'fileSaved',
                        success: true,
                        message: `Created ${message.files.length} file(s) successfully!`,
                    });
                    break;
                case 'loadConfig':
                    await loadConfigFile();
                    break;
            }
        });
    }
    _getHtmlContent(webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Auto Filer</title>
	<style>
		body {
			font-family: var(--vscode-font-family);
			color: var(--vscode-foreground);
			background-color: var(--vscode-sideBar-background);
			padding: 20px;
			margin: 0;
		}
		h1 {
			font-size: 18px;
			margin-top: 0;
			margin-bottom: 15px;
		}
		.section {
			margin-bottom: 20px;
		}
		label {
			display: block;
			margin: 10px 0 5px 0;
			font-weight: 500;
		}
		input[type="text"],
		textarea {
			width: 100%;
			box-sizing: border-box;
			background-color: var(--vscode-input-background);
			color: var(--vscode-input-foreground);
			border: 1px solid var(--vscode-input-border);
			padding: 8px;
			border-radius: 4px;
			font-family: var(--vscode-font-family);
			font-size: 13px;
			margin-bottom: 8px;
		}
		textarea {
			min-height: 80px;
			resize: vertical;
		}
		button {
			background-color: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			padding: 8px 16px;
			border-radius: 4px;
			cursor: pointer;
			margin-right: 8px;
			margin-bottom: 10px;
			font-family: var(--vscode-font-family);
		}
		button:hover {
			background-color: var(--vscode-button-hoverBackground);
		}
		button.secondary {
			background-color: var(--vscode-button-secondaryBackground);
			color: var(--vscode-button-secondaryForeground);
		}
		button.secondary:hover {
			background-color: var(--vscode-button-secondaryHoverBackground);
		}
		.file-item {
			background-color: var(--vscode-editor-background);
			border: 1px solid var(--vscode-panel-border);
			border-radius: 4px;
			padding: 10px;
			margin-bottom: 10px;
		}
		.file-item-actions {
			margin-top: 5px;
		}
		.file-item button {
			padding: 4px 8px;
			font-size: 12px;
			margin-right: 5px;
		}
		.message {
			padding: 10px;
			border-radius: 4px;
			margin-bottom: 10px;
			display: none;
		}
		.message.success {
			background-color: var(--vscode-notificationCenter-background);
			color: var(--vscode-notificationCenterHeader-foreground);
		}
		.file-list {
			max-height: 300px;
			overflow-y: auto;
		}
	</style>
</head>
<body>
	<h1>📁 Auto Filer</h1>
	
	<div id="message" class="message"></div>
	
	<div class="section">
		<h2>Create Files Manually</h2>
		<label for="fileName">File Name:</label>
		<input type="text" id="fileName" placeholder="e.g., app.js">
		
		<label for="fileContent">File Content:</label>
		<textarea id="fileContent" placeholder="Enter the file content here..."></textarea>
		
		<button onclick="addFile()">Add File</button>
	</div>
	
	<div class="section">
		<h2>Files to Create</h2>
		<div id="fileList" class="file-list"></div>
		<button onclick="createFiles()" style="margin-top: 10px;">✓ Create All Files</button>
		<button class="secondary" onclick="clearAll()">Clear All</button>
	</div>
	
	<div class="section">
		<h2>Configuration</h2>
		<button class="secondary" onclick="loadConfig()">📄 Load from JSON Config</button>
		<p style="font-size: 12px; color: var(--vscode-descriptionForeground);">
			Create a <code>autofiler.json</code> file in your workspace root
		</p>
	</div>

	<script>
		const vscode = acquireVsCodeApi();
		let files = [];

		function addFile() {
			const fileName = document.getElementById('fileName').value.trim();
			const fileContent = document.getElementById('fileContent').value;

			if (!fileName) {
				showMessage('Please enter a file name', false);
				return;
			}

			files.push({ name: fileName, content: fileContent });
			document.getElementById('fileName').value = '';
			document.getElementById('fileContent').value = '';
			renderFileList();
			showMessage('File added to list', true);
		}

		function removeFile(index) {
			files.splice(index, 1);
			renderFileList();
		}

		function renderFileList() {
			const listDiv = document.getElementById('fileList');
			if (files.length === 0) {
				listDiv.innerHTML = '<p style="color: var(--vscode-descriptionForeground);">No files added yet</p>';
				return;
			}

			listDiv.innerHTML = files.map((file, index) => \`
				<div class="file-item">
					<strong>\${escapeHtml(file.name)}</strong>
					<div class="file-item-actions">
						<button onclick="removeFile(\${index})">Remove</button>
					</div>
				</div>
			\`).join('');
		}

		function createFiles() {
			if (files.length === 0) {
				showMessage('Add at least one file before creating', false);
				return;
			}

			vscode.postMessage({
				command: 'createFiles',
				files: files,
			});

			files = [];
			renderFileList();
		}

		function clearAll() {
			files = [];
			renderFileList();
		}

		function loadConfig() {
			vscode.postMessage({
				command: 'loadConfig',
			});
		}

		function showMessage(text, isSuccess) {
			const msgDiv = document.getElementById('message');
			msgDiv.textContent = text;
			msgDiv.className = 'message ' + (isSuccess ? 'success' : '');
			msgDiv.style.display = 'block';
			setTimeout(() => {
				msgDiv.style.display = 'none';
			}, 3000);
		}

		function escapeHtml(text) {
			const div = document.createElement('div');
			div.textContent = text;
			return div.innerHTML;
		}

		// Listen for messages from extension
		window.addEventListener('message', (event) => {
			const message = event.data;
			if (message.command === 'fileSaved') {
				showMessage(message.message, message.success);
			}
		});

		renderFileList();
	</script>
</body>
</html>`;
    }
}
async function handleCreateFiles(files) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
    }
    const rootPath = workspaceFolder.uri.fsPath;
    for (const file of files) {
        try {
            const filePath = path.join(rootPath, file.name);
            const dirPath = path.dirname(filePath);
            // Create directories if they don't exist
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
            // Write the file
            fs.writeFileSync(filePath, file.content, 'utf-8');
            console.log(`Created file: \${filePath}\`);
		} catch (error) {
			vscode.window.showErrorMessage(\`Failed to create file: \${error}\`);
		}
	}

	// Refresh the file explorer
	vscode.commands.executeCommand('workbench.files.action.refreshExplorerAndEditors');
}

async function loadConfigFile(): Promise<void> {
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	if (!workspaceFolder) {
		vscode.window.showErrorMessage('No workspace folder open');
		return;
	}

	const configPath = path.join(workspaceFolder.uri.fsPath, 'autofiler.json');

	try {
		if (!fs.existsSync(configPath)) {
			vscode.window.showErrorMessage(
				'autofiler.json not found. Create one in your workspace root.'
			);
			return;
		}

		const configContent = fs.readFileSync(configPath, 'utf-8');
		const config = JSON.parse(configContent);

		if (!Array.isArray(config.files)) {
			vscode.window.showErrorMessage('Invalid config file format. Expected { files: [...] }');
			return;
		}

		await handleCreateFiles(config.files);
		vscode.window.showInformationMessage(
			\`Created \${config.files.length} file(s) from configuration!\`
		);
	} catch (error) {
		vscode.window.showErrorMessage(\`Failed to load config: \${error}\`);
	}
}

export function deactivate() {}
            );
        }
        finally { }
    }
}
