import { Signer, Verifier } from "./src/jwt";
import { privateKey, publicKey } from "./src/keys";

export const signJWT = new Signer(privateKey).sign;
export const verifyJWT = new Verifier(publicKey).verify;
