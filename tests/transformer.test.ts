import { TestCompiler } from "./TestCompiler";
import { format } from "./Utils";

const exampleExpression = format(`
import * as adaptor from "@openfn/language-http";

export default async function main() {
  adaptor.get("http://ipv4.icanhazip.com", {})
}
`);

test("can compare output to a string", () => {
  const adaptorPackagePath = "../language-http";
  const compiler = new TestCompiler(adaptorPackagePath, exampleExpression);

  // add a call to something that isn't an adaptor to check it won't mess with that.
  expect(compiler.transform()).toEqual(
    format(
      `import * as adaptor from "@openfn/language-http";
       export default async function main() {
         await adaptor.get("http://ipv4.icanhazip.com", {})(state);
       }`
    )
  );
});
