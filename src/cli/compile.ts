import yargs from "yargs";
export const command = "compile <expression>";

export const describe = "compile a job expression into a module";

export const builder = function (yargs: yargs.Argv) {
  return yargs
    .positional("expression", {
      describe: "path to a job expression file",
      type: "string",
    })
    .help("help");
};

export function handler(argv) {
  return argv;
}
