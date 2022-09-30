import { withAuth } from "@clerk/nextjs/api";
export default withAuth(async (req, res) => {
  console.log(JSON.stringify(req.auth, null, 2));
  res.end();
});
