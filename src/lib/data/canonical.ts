// These routes remain usable, but share a search identity with another page.
export const canonicalAliases: Readonly<Record<string, string>> = {
	'/world': '/'
};

export const canonicalPath = (path: string) => canonicalAliases[path] ?? path;
