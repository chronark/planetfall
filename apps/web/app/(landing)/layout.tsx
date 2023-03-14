import { Header } from "./header";
import { Footer } from "./footer";
import Script from "next/script";

export const dynamic = "force-static";
export const revalidate = 3600;

const plainScript = `
window.$plain = window.$plain || [];
typeof plain === 'undefined' && (plain = function () { $plain.push(arguments); });
plain("init", {appKey: "appKey_uk_01GTMCKHYR6PD0WKNB61TQ0WS0"});


fetch('/api/v1/auth/user').then(res => res.json()).then(res=>{

  if (res.userId) {
    plain('set-customer', {
      type: 'logged-in',
      getCustomerJwt: async () => {
        const jwt= await fetch('/api/v1/auth/user/jwt', {method: 'POST'})
        .then(res => res.json())
        .then(res => res.token);
        return jwt
      }
    });
    
  }
})
`;
export default async function Landing({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Script id="chat" async src="https://customer-chat.cdn-plain.com/latest/customerChat.js" />

      <Script id="setup-plain" dangerouslySetInnerHTML={{ __html: plainScript }} />
      <Header />

      <main>{children}</main>
      <Footer />
    </div>
  );
}
