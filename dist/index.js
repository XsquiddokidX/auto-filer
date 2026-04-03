import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import inquirer from 'inquirer';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export async function createFilesInteractive() {
    const files = [];
    while (true) {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    { name: 'Add a file', value: 'add' },
                    { name: 'View files', value: 'view' },
                    { name: 'Create files', value: 'create' },
                    { name: 'Cancel', value: 'cancel' },
                ],
            },
        ]);
        if (action === 'add') {
            const fileAnswers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'File name (e.g., src/index.js):',
                    validate: (input) => input.trim() !== '' || 'File name cannot be empty',
                },
                {
                    type: 'editor',
                    name: 'content',
                    message: 'File content (press enter to open editor):',
                    postfix: '.txt',
                },
            ]);
            files.push({
                name: fileAnswers.name.trim(),
                content: fileAnswers.content,
            });
            const confirmAdd = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'addMore',
                    message: 'Add another file?',
                    default: true,
                },
            ]);
            if (!confirmAdd.addMore) {
                break;
            }
        }
        else if (action === 'view') {
            if (files.length === 0) {
                console.log(chalk.yellow('No files added yet.\n'));
            }
            else {
                console.log(chalk.cyan('\n📋 Files to be created:\n'));
                files.forEach((file, index) => {
                    console.log(chalk.gray(`${index + 1}.`), chalk.bold(file.name), chalk.gray(`(${file.content.length} bytes)`));
                });
                console.log();
            }
        }
        else if (action === 'create') {
            if (files.length === 0) {
                console.log(chalk.yellow('No files to create.\n'));
                continue;
            }
            break;
        }
        else {
            console.log(chalk.yellow('Cancelled'));
            return;
        }
    }
    if (files.length === 0) {
        throw new Error('No files to create');
    }
    await createFiles(files);
}
export async function createFilesFromConfig(configFile) {
    try {
        const configPath = path.resolve(configFile);
        if (!fs.existsSync(configPath)) {
            throw new Error(`Config file not found: ${configPath}`);
        }
        const configContent = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(configContent);
        if (!Array.isArray(config.files)) {
            throw new Error('Invalid config format. Expected { files: [...] }');
        }
        const files = config.files.map((file) => ({
            name: file.name,
            content: file.content,
        }));
        console.log(chalk.cyan(`Found ${files.length} file(s) to create\n`));
        await createFiles(files);
    }
    catch (error) {
        throw new Error(`Failed to load config: ${error instanceof Error ? error.message : String(error)}`);
    }
}
async function createFiles(files) {
    const currentDir = process.cwd();
    console.log(chalk.cyan('Creating files in:'), chalk.bold(currentDir), '\n');
    for (const file of files) {
        try {
            const filePath = path.join(currentDir, file.name);
            const dirPath = path.dirname(filePath);
            // Create directories if they don't exist
            if (!fs.existsSync(dirPath)) {
                await fs.ensureDir(dirPath);
                console.log(chalk.gray(`├─ mkdir ${path.relative(currentDir, dirPath)}`));
            }
            // Write the file
            await fs.writeFile(filePath, file.content, 'utf-8');
            console.log(chalk.green(`├─ create ${path.relative(currentDir, filePath)}`));
        }
        catch (error) {
            throw new Error(`Failed to create file ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
export async function initConfigFile() {
    const currentDir = process.cwd();
    const configPath = path.join(currentDir, 'autofiler.json');
    if (fs.existsSync(configPath)) {
        const { overwrite } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: 'autofiler.json already exists. Overwrite?',
                default: false,
            },
        ]);
        if (!overwrite) {
            console.log(chalk.yellow('Cancelled'));
            return;
        }
    }
    const sampleConfig = {
        files: [
            {
                name: 'README.md',
                content: '# My Project\n\nThis is a sample project created by Auto Filer.\n',
            },
            {
                name: 'src/index.js',
                content: 'console.log("Hello, World!");\n',
            },
            {
                name: '.gitignore',
                content: 'node_modules/\n.DS_Store\n.env\n',
            },
        ],
    };
    await fs.writeFile(configPath, JSON.stringify(sampleConfig, null, 2), 'utf-8');
    console.log(chalk.green(`Created autofiler.json in ${chalk.bold(currentDir)}`));
}
