import packageJson from "./package.json" with { type: "json" };
import { setupTypeAcquisition } from "@typescript/ata";
import ts from "typescript";

export const generateNpmDependenciesDeclarationFiles = async (dependenciesMap) => {
  const deps = Object.entries(dependenciesMap);
  const code = deps
    .map(([name, version]) => {
      version = version.replace("^", "");
      return `import "${name}"; // types: ${version}`;
    })
    .join('\n');
  console.log(code);
  return new Promise((resolve) => {
    const files = [];
    const ata = setupTypeAcquisition({
      projectName: "monaco-ts",
      typescript: ts,
      delegate: {
        receivedFile: (code, path) => {
          files.push({ path: "file://" + path, content: code });
        },
        finished: () => resolve(files),
      },
    });
    ata(code);
  });
};

function format(number) {
  return new Intl.NumberFormat('en-US', { notation: "compact" }).format(number);
}

console.time("download time");
const result = await generateNpmDependenciesDeclarationFiles(packageJson.dependencies);
console.timeLog("download time");
console.log("files:", format(result.length), ", size:", format(result.reduce((acc, file) => acc + file.content.length, 0)));
