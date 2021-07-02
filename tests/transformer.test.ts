import { TestCompiler } from "./TestCompiler";
import { format } from "./Utils";

const exampleExpression = format(`
import * as adaptor from "@openfn/language-http";

export default async function main() {
  function foo() {};

  console.log(foo());

  adaptor.get("http://ipv4.icanhazip.com", {})
  let customResult = adaptor.get("http://ipv4.icanhazip.com", {})
  await customResult(state);
}
`);

test("can compare output to a string", () => {
  const adaptorPackagePath = "../language-http";
  const compiler = new TestCompiler(adaptorPackagePath, exampleExpression);

  // add a call to something that isn't an adaptor to check it won't mess with that.
  expect(compiler.transform()).toEqual(
    format(`
      import * as adaptor from "@openfn/language-http";
      export default async function main() {
        function foo() {}
        console.log(foo());
        await adaptor.get("http://ipv4.icanhazip.com", {})(state);
        let customResult = adaptor.get("http://ipv4.icanhazip.com", {})
        await customResult(state);
      }
    `)
  );
});
