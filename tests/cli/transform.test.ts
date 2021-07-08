import yargs from "yargs";

import * as transform from "../../src/cli/transform";

it.skip("returns help output", async () => {
  const parser = yargs.command(transform);

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
  return (command: string) =>
    new Promise((resolve, reject) => {
      parser.parse(command, (err, argv, _output) => {
        if (err) reject(err.message);

        resolve(argv);
      });
    });
}

it("can parse the location of the expression file", async () => {
  const parse = buildParser(yargs.command(transform));

  await expect(parse("transform foo.js")).rejects.toMatch(
    "Missing required argument: transformer"
  );

  await expect(parse("transform -t legacy foo.js")).resolves.toEqual(
    expect.objectContaining({
      expression: "foo.js",
      transformer: "legacy",
    })
  );
});
