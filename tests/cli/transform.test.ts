import yargs, { CommandModule } from "yargs";

import * as transform from "../../src/cli/transform";
const commandModule = {
  command: transform.command,
  describe: transform.describe,
  builder: transform.builder,
  handler: () => {},
};

it.skip("returns help output", async () => {
  const parser = yargs.command(commandModule);

  // Run the command module with --help as argument
  const output: string = await new Promise((resolve) => {
    parser.parse("--help", (_err, _argv, output) => {
      resolve(output);
    });
  });

  console.log(output);

  // Verify the output is correct
  expect(output.replace(/\n/g, "").replace(/\s{2,}/g, "")).toEqual(
    expect.stringContaining("transform a job expression into a module")
  );
});

function buildParser(parser: yargs.Argv): (command: string) => Promise<any> {
  return (command: string) => parser.parseAsync(command);
}

it("can parse the location of the expression file", async () => {
  const parse = buildParser(yargs.command(commandModule));

  await expect(parse("transform foo.js")).rejects.toMatch(
    "Missing required arguments: transformer, adaptor"
  );

  await expect(
    parse("transform -a @test/adaptor -t legacy foo.js")
  ).resolves.toEqual(
    expect.objectContaining({
      expression: "foo.js",
      transformer: "legacy",
    })
  );
});
