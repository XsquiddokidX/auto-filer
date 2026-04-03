export interface FileSpec {
	name: string;
	content: string;
}

export interface ConfigFile {
	files: FileSpec[];
}
