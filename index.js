import pkg from "./package.json" with { type: "json" };
import { setupTypeAcquisition as ata } from "@typescript/ata";
import typescript from "typescript";

function getTypes(dependencies) {
  const { promise, resolve } = Promise.withResolvers();
  const code = Object.entries(dependencies).map(([name, version]) => {
    return `import "${name}"; // types: ${version.replace("^", "")}`;
  });
  console.log(["", ...code, ""].join("\n"));
  ata({ typescript, delegate: { finished: resolve } })(code.join("\n"));
  return promise;
}

async function getDependencies() {
  const entries = Object.keys(pkg.dependencies).map((name) => {
    const json = import(`${name}/package.json`, { with: { type: "json" } });
    return json.then(({ default: { version } }) => [name, version]);
  });
  return Object.fromEntries(await Promise.all(entries));
}

function format(number) {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(number);
}

console.time("time");
const fs = await getTypes(await getDependencies());
console.log("files:", format([...fs.keys()].length));
console.log("size:", format(fs.values().reduce((sum, s) => sum + s.length, 0)));
console.timeEnd("time");
