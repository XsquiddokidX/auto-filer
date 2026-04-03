#!/usr/bin/env node
import { createFilesInteractive, createFilesFromConfig } from './index.js';
import { Command } from 'commander';
import chalk from 'chalk';
const program = new Command();
program
    .name('autofiler')
    .description('CLI tool to automatically create project files with customizable content')
    .version('0.0.1');
program
    .command('create')
    .description('Interactively create files')
    .action(async () => {
    console.log(chalk.blue.bold('\n📁 Welcome to Auto Filer\n'));
    try {
        await createFilesInteractive();
        console.log(chalk.green.bold('\n✓ Files created successfully!\n'));
    }
    catch (error) {
        console.error(chalk.red.bold('\n✗ Error:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
program
    .command('load <configFile>')
    .description('Create files from a JSON configuration file')
    .action(async (configFile) => {
    console.log(chalk.blue('\nLoading configuration from'), chalk.bold(configFile));
    try {
        await createFilesFromConfig(configFile);
        console.log(chalk.green.bold('\n✓ Files created successfully!\n'));
    }
    catch (error) {
        console.error(chalk.red.bold('\n✗ Error:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
program
    .command('init')
    .description('Create a sample autofiler.json config file')
    .action(async () => {
    try {
        const { initConfigFile } = await import('./index.js');
        await initConfigFile();
        console.log(chalk.green.bold('\n✓ Sample autofiler.json created!\n'));
    }
    catch (error) {
        console.error(chalk.red.bold('\n✗ Error:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
program.parse(process.argv);
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
