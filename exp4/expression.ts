
import { readFileSync } from "fs";
const state = JSON.parse(readFileSync("./names.json", "utf8"));

console.log("expression statement")

async function foo() {}

export default async function main() {
  for (const code in state) {
    console.log(code);

    const countryName = state[code];

    await adaptor.post(1, "http://localhost:5051/", {
      data: { code: code, countryName },
    });
  }
}
