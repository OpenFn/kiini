import yargs from "yargs";
import { readFileSync } from "fs";
import { LegacyCompiler } from "../compiler";
import { dtsResolve } from "../resolver";
import { join } from "path";

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

// TODO: optionally format the output
// TODO: optionally store the output as a file
export async function handler({ expression, adaptor }: CliTransformOptions) {
  const code = readFileSync(expression, "utf-8");

  const compiler = new LegacyCompiler({ adaptorModule: adaptor });

  compiler.addExpression(code);
  try {
    // TODO: resolve the adaptor as a module or a path:
    // ./language-http
    // @openfn/language-http
    // TODO: possibly allow aliasing, 'check against this adaptor', have
    // the compiler put 'this alias' in the output.
    const dtsPath = await dtsResolve(join(__dirname, "../"), adaptor);
    const dts = readFileSync(dtsPath, "utf8");
    compiler.addTypeDefinition(adaptor, dts);

    console.log(compiler.formatDiagnostics());
    const result = compiler.compile();

    process.stdout.write(result);
  } catch (error) {
    console.error(error.message);
    console.error(error.details);
    process.exitCode = 1;
  }
}
