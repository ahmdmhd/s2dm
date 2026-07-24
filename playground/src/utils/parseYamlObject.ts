import { load } from "js-yaml";

export function parseYamlObject<ParsedObject>(
	fileContent: string,
	rootErrorMessage: string,
): ParsedObject {
	const parsedYaml = load(fileContent);
	if (
		parsedYaml === null ||
		typeof parsedYaml !== "object" ||
		Array.isArray(parsedYaml)
	) {
		throw new Error(rootErrorMessage);
	}

	return parsedYaml as ParsedObject;
}
