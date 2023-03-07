import { fastify } from "fastify";
import { fastifyConnectPlugin } from "@bufbuild/connect-fastify";
import router from "./connect";


async function main(){

    console.log(router)

    const server = fastify();
    server.addHook('onRoute', routeOptions => {
        console.log(routeOptions.url)
      });
    await server.register(fastifyConnectPlugin, {
        router: (x:any)=>{
            console.log(x)
            return router(x)
        },
    });
    
    server.get("/", (_, reply) => {

        reply.type("text/plain");
        reply.send("hi");
    });
    
    await server.listen({ host: "localhost", port: 8080 });
    console.log("server is listening at", server.addresses());
    
}
main()