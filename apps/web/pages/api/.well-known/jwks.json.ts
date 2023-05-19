import { NextResponse } from "next/server";
import * as jose from "jose";

const _privateKey = `-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIMM3KP5oLVnT/hKyZGK66XJ7tq95hN/fOkLR6/bL6Tud
-----END PRIVATE KEY-----
`;
const _publicKey = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAtR8TTRsk/tqlOnvhFm3V2qbjv5tLoXOS3z2W6OZi/ts=
-----END PUBLIC KEY-----
`;

const _sk: jose.JWK = {
  crv: "Ed25519",
  d: "wzco_mgtWdP-ErJkYrrpcnu2r3mE3986QtHr9svpO50",
  x: "tR8TTRsk_tqlOnvhFm3V2qbjv5tLoXOS3z2W6OZi_ts",
  kty: "OKP",
};
const pk: jose.JWK = {
  alg: "EdDSA",
  crv: "Ed25519",
  x: "tR8TTRsk_tqlOnvhFm3V2qbjv5tLoXOS3z2W6OZi_ts",
  kty: "OKP",
  use: "sig",
};

export const runtime = "edge";
export const revalidate = 60;

export default async function jwks(req: Request) {
  if (req.method !== "GET") {
    return new NextResponse("Method not allowed", { status: 405 });
  }

  return NextResponse.json({
    keys: [pk],
  });
}

// {
//     "keys": [
//         {
//             "kty": "RSA",
//             "e": "AQAB",
//             "use": "sig",
//             "kid": "NTAxZmMxNDMyZDg3MTU1ZGM0MzEzODJhZWI4NDNlZDU1OGFkNjFiMQ",
//             "alg": "RS256",
//             "n": "luZFdW1ynitztkWLC6xKegbRWxky-5P0p4ShYEOkHs30QI2VCuR6Qo4Bz5rTgLBrky03W1GAVrZxuvKRGj9V9-PmjdGtau4CTXu9pLLcqnruaczoSdvBYA3lS9a7zgFU0-s6kMl2EhB-rk7gXluEep7lIOenzfl2f6IoTKa2fVgVd3YKiSGsyL4tztS70vmmX121qm0sTJdKWP4HxXyqK9neolXI9fYyHOYILVNZ69z_73OOVhkh_mvTmWZLM7GM6sApmyLX6OXUp8z0pkY-vT_9-zRxxQs7GurC4_C1nK3rI_0ySUgGEafO1atNjYmlFN-M3tZX6nEcA6g94IavyQ"
//         }
//     ]
// }
