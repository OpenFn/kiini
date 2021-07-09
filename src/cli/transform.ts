import yargs from "yargs";
import { readFileSync } from "fs";
import { LegacyCompiler } from "../compiler";

export const command = "transform [options] <expression>";

export const describe = "transform a job expression into a module";

export const builder = function (yargs: yargs.Argv) {
  return yargs
    .option("adaptor", {
      alias: "a",
      type: "string",
      description: "adaptor module",
    })
    .option("transformer", {
      alias: "t",
      type: "string",
      description: "which transformer to use",
      choices: ["legacy"],
    })
    .demandOption(["transformer", "adaptor"])
    .positional("expression", {
      describe: "path to a job expression file",
      type: "string",
    })
    .help("help");
};

interface CliTransformOptions extends yargs.Argv {
  expression: string;
  transformer: string;
  adaptor: string;
}

// TODO: use the transform option to select a transform
// TODO: optionally format the output
// TODO: optionally store the output as a file
export function handler({ expression, adaptor }: CliTransformOptions) {
  const code = readFileSync(expression, "utf-8");

  const compiler = new LegacyCompiler({ adaptorModule: adaptor });

  compiler.addExpression(code);

  const result = compiler.compile();
  process.stdout.write(result);
}
