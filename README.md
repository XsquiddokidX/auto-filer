# Auto Filer

A CLI tool to automatically create project files with customizable content.

## Features

- **Interactive Mode**: Interactively add files and their content through prompts
- **Config File Mode**: Load file specifications from a JSON configuration file
- **Flexible**: Create single files or entire project structures
- **Easy Installation**: Install globally or use in projects locally

## Installation

### Global Installation (Recommended)

```bash
npm install -g autofiler
```

### Local Installation

```bash
npm install autofiler --save-dev
```

## Usage

### Interactive Mode

Create files by answering interactive prompts:

```bash
autofiler create
```

The tool will guide you through:
1. Enter a file name (e.g., `src/app.js`)
2. Provide the file content (opens in your default editor)
3. Add more files or create them

### Configuration File Mode

Create files from a JSON config file:

```bash
autofiler load autofiler.json
```

### Initialize Sample Config

Generate a sample `autofiler.json` file:

```bash
autofiler init
```

## Configuration File Format

Create an `autofiler.json` file with the following structure:

```json
{
  "files": [
    {
      "name": "README.md",
      "content": "# My Project\n\nProject description here.\n"
    },
    {
      "name": "src/index.js",
      "content": "console.log('Hello, World!');\n"
    },
    {
      "name": ".gitignore",
      "content": "node_modules/\n.env\n"
    }
  ]
}
```

### File Name Patterns

- Use forward slashes (`/`) for nested directories
- Directories will be created automatically if they don't exist
- Examples: `src/index.js`, `config/settings.json`, `docs/README.md`

## Examples

### Example 1: Create a Node.js Project

```bash
autofiler create
```

Then add these files:
- `package.json` - Package configuration
- `src/index.js` - Main entry point
- `.gitignore` - Git ignore rules
- `README.md` - Project documentation

### Example 2: Use Configuration File

1. Create `project-setup.json`:

```json
{
  "files": [
    {
      "name": "package.json",
      "content": "{\n  \"name\": \"my-project\",\n  \"version\": \"1.0.0\"\n}"
    },
    {
      "name": "src/app.ts",
      "content": "export const hello = () => 'Hello, TypeScript!';"
    },
    {
      "name": "tsconfig.json",
      "content": "{\n  \"compilerOptions\": {\n    \"target\": \"ES2020\"\n  }\n}"
    }
  ]
}
```

2. Run Auto Filer:

```bash
autofiler load project-setup.json
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `autofiler create` | Interactively create files |
| `autofiler load <file>` | Load files from a JSON config file |
| `autofiler init` | Create a sample `autofiler.json` |
| `autofiler --help` | Show help |
| `autofiler --version` | Show version |

## Tips

- Use the config file mode for repeatible project structures
- Store config files in your repository to share project templates
- Use the interactive mode for one-off file creation
- File content supports newlines and special characters in JSON strings

## License

MIT
