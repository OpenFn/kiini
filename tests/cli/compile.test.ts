import yargs from "yargs";

import * as compile from "../../src/cli/compile";

it("returns help output", async () => {
  const parser = yargs.command(compile);

  // Run the command module with --help as argument
  const output = await new Promise((resolve) => {
    parser.parse("--help", (_err, _argv, output) => {
      resolve(output);
    });
  });

  // Verify the output is correct
  expect(output).toEqual(
    expect.stringContaining("compile a job expression into a module")
  );
});

it("can parse the location of the expression file", async () => {
  const parser = yargs.command(compile);

  const args = await new Promise((resolve) => {
    parser.parse("compile foo.js", (_err, argv, _output) => {
      resolve(argv);
    });
  });

  expect(args).toEqual(expect.objectContaining({ expression: "foo.js" }));
});
