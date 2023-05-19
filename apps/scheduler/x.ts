import * as jose from "jose";

import * as crypto from "node:crypto";

async function main() {
  // const { publicKey, privateKey } = await jose.generateKeyPair("EdDSA", {
  //   crv: "Ed25519",

  // });
  // console.log("sk", await jose.exportJWK(privateKey));
  // console.log("pk", await jose.exportJWK(publicKey));
  // console.log(await jose.exportPKCS8(privateKey));
  // console.log(await jose.exportSPKI(publicKey));

  // const payload = { hello: "world" };

  // const payloadHash = crypto
  //   .createHash("sha256")
  //   .update(JSON.stringify(payload))
  //   .digest("base64url");

  // const signature = await new jose.SignJWT({
  //   exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  //   body: payloadHash,
  // })
  //   .setProtectedHeader({
  //     alg: "EdDSA",
  //   })
  //   .sign(privateKey);
  // console.log({ signature });

  // const res = await jose.jwtVerify(signature, publicKey);
  // console.log({ res });

  const key = await jose.importJWK({
    crv: "Ed25519",
    d: "wzco_mgtWdP-ErJkYrrpcnu2r3mE3986QtHr9svpO50",
    x: "tR8TTRsk_tqlOnvhFm3V2qbjv5tLoXOS3z2W6OZi_ts",
    kty: "OKP",
  });

  const jwt = await new jose.SignJWT({
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    aud: "https://planetfall.io",
  })
    .setProtectedHeader({
      alg: "EdDSA",
    })
    .sign(key);
  console.log({ jwt });

  const JWKS = jose.createRemoteJWKSet(new URL("http://localhost:3000/api/.well-known/jwks.json"));

  const { payload, protectedHeader } = await jose.jwtVerify(jwt, JWKS, {
    algorithms: ["EdDSA"],
    audience: "https://planetfall.io",
  });
  console.log(payload, protectedHeader);
}

main();
