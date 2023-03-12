import { getAuth } from "@clerk/nextjs/server";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { userId, ...rest } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Not logged in" });
    return res.end();
  }

  const retrievedUser = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    },
  }).then((res) => res.json());

  const payload = {
    externalId: userId,
    fullName: retrievedUser.username,
    email: {
      email: retrievedUser.email_addresses[0].email_address,
      isVerified: retrievedUser.email_addresses[0].verification.status === "verified",
    },
  };

  const token = jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "1h",
  });

  res.json({ token });
  return res.end();
}

export const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAsjtBgjvao1ozju7Ng7eHNm3FtNVQPwUJbDswck0GYw51BfV6
1IrR1el+8pzJ8Al4pOhw3nBcGTpUJX5NU6qJvtQ5EenQ1cYuq/CtbyUB0bC3d125
A+pTe+9T5Oz3C7yyxx4qaVNpGzT6NMHOh39xyu7garyQcL0WBoBwkGN/XYmdl946
yMY6jvasneocblQNuvl/VRKxjVjhs7SflUH4cOUhC7fZTbSooYs8M/jsePGXGg+A
F+uvvgDkzcg2NYnVZZPJMS8dZa9/zP7jXnI8QwWkJwTGoHTrgWrpD+OXh4NonhXB
D9rnxF06sKb7cMpjxOgPrE4PQP8fGXoJcCg9hQIDAQABAoIBAQCW1PrdYhXnhCB5
57JYs+pjr4ZPQO7GRlbxFy4qrPCox8VVI6etU0W9R/s9Cl8DGqDUvjk2pdPrLaek
izyZf4tOyX76n+sx3qQEsouzsZfWgzzgcZpvq9C245UV+UwgzLJnPCocNJCQi8bq
+tDzbnE4keutqKJ8JikLm4qnRuy0lKVxscQy3cTUm1LnnduyWyRNAXzPCfNn7Frh
OVEcLDi8b6MU7RkUPy7AqtKi/tza6hN16VOfg6hL0Cr+oV2TgcZ74cioLzYCtN1x
6nASTFxA7WqBAApf3Euf9X4S83usUAxhmWxGizs8jhYsbQr1LZ7O18FYYIb7Idjq
FAyuRUoBAoGBAOKuxVmxe5pHH2egXTi3Jq5YguoZLP2Mee8T3wspyWG1Kd6C9QOQ
L8dpO1FrzZlZVqX+8s5irlcpyKxLE3qQB/TYVDpCOH7IthXvKlFLyWJAS8k76Ac3
8cEJP9054CCdFuJt92oMaTjAcdRDr7kttKuFmLyUTB8clJ2lNev4z8DFAoGBAMlI
UKNnIqLtqD8KfUz0RIpuPl93jqgmktkxgdbANeL9+a+TG9rNXlCi3Vj9K3t5vzqz
KUdnICggAsHTfVVieIjtcJNKd5CeWIHKhLx6rbuIB/KKPkB5lm876KAHJ7RmFO6b
jALglol4urpf/WtLlZ0WAV0CAmcQiWTrd/S51NXBAoGBANfJjb6TcNltiRzJkNRz
rVPcmEsnSifXeR+45+OllLn5jnDuczVAJeuLZldc6yxm2lBMwXDsiZAaC5jQIyvS
PnC7GnsXHNa8VHHO6ZbYMU3hbQOUjo2ImQ+ssWn0NUJ2qBlGm3cNd4D52aI6COab
9tgs5jfmaAxZ1bO4WPtYMNUNAoGBAISUvYjkRkxLfqcHocEupHcKZss7VRwtTE0D
7yIlOVlrMSwVGiPlYlp67JHRMPMEHpHrsST3KJdFfottYwD6+6o1vBFI27jGlEXp
v8TmickcsR9xL9AIRq6+J1xBWkXZd7AzhOXgSUgD3fslfydNgh8Wf49j43E/00BG
WZ05SpgBAoGAV2fP+mXwTwpqRRu7dFohGcW01r/UZ56blYGxbUvcgVEOb40Szf1Q
xvh5WkUgOGhVGGAR468U+Ez4d9DTli6VTc63046FN2IeEbVAdUaGiVQJgAJr6N2K
8+JKRThXRmc35OttWT9S9oqFBYuv9A3yNOfmgIwGwJWCS/HuUd9hSto=
-----END RSA PRIVATE KEY-----
`;

const _publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsjtBgjvao1ozju7Ng7eH
Nm3FtNVQPwUJbDswck0GYw51BfV61IrR1el+8pzJ8Al4pOhw3nBcGTpUJX5NU6qJ
vtQ5EenQ1cYuq/CtbyUB0bC3d125A+pTe+9T5Oz3C7yyxx4qaVNpGzT6NMHOh39x
yu7garyQcL0WBoBwkGN/XYmdl946yMY6jvasneocblQNuvl/VRKxjVjhs7SflUH4
cOUhC7fZTbSooYs8M/jsePGXGg+AF+uvvgDkzcg2NYnVZZPJMS8dZa9/zP7jXnI8
QwWkJwTGoHTrgWrpD+OXh4NonhXBD9rnxF06sKb7cMpjxOgPrE4PQP8fGXoJcCg9
hQIDAQAB
-----END PUBLIC KEY-----
`;
