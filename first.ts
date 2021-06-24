import axios from "axios";
import { readFileSync } from "fs";

// setupClient
// adaptor provides wrapper macros?
// writeState function is injected? (sets filepath from compiler)

const state = JSON.parse(readFileSync("./names.json", "utf8"));

export default async function main() {
  for (const code in state) {
    console.log(code);

    const countryName = state[code];

    await axios.post("http://localhost:5051/", {
      data: { code: code, countryName },
    });
  }
}