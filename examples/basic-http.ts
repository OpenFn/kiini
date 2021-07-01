import * as adaptor from "../language-http/src/Adaptor";
// import { Operation } from "../language-http/src/Adaptor";

export default async function main() {
	adaptor.get("http://ipv4.icanhazip.com", {})
}

main();