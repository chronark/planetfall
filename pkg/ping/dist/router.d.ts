export declare const t: {
    _config: {
        ctx: {};
        meta: {};
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    };
    procedure: import("@trpc/server").ProcedureBuilder<{
        _config: {
            ctx: {};
            meta: {};
            errorShape: import("@trpc/server").DefaultErrorShape;
            transformer: import("@trpc/server").DefaultDataTransformer;
        };
        _ctx_in: {};
        _ctx_out: {};
        _input_in: typeof import("@trpc/server").unsetMarker;
        _input_out: typeof import("@trpc/server").unsetMarker;
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
        _meta: {};
    }>;
    middleware: <TNewParams extends import("@trpc/server").ProcedureParams<{
        transformer: import("@trpc/server").CombinedDataTransformer;
        errorShape: import("@trpc/server").DefaultErrorShape;
        ctx: Record<string, unknown>;
        meta: Record<string, unknown>;
    }, unknown, unknown, unknown, unknown, unknown, unknown, unknown>>(fn: import("@trpc/server").MiddlewareFunction<{
        _config: {
            ctx: {};
            meta: {};
            errorShape: import("@trpc/server").DefaultErrorShape;
            transformer: import("@trpc/server").DefaultDataTransformer;
        };
        _ctx_in: {};
        _ctx_out: {};
        _input_out: unknown;
        _input_in: unknown;
        _output_in: unknown;
        _output_out: unknown;
        _meta: {};
    }, TNewParams>) => import("@trpc/server").MiddlewareFunction<{
        _config: {
            ctx: {};
            meta: {};
            errorShape: import("@trpc/server").DefaultErrorShape;
            transformer: import("@trpc/server").DefaultDataTransformer;
        };
        _ctx_in: {};
        _ctx_out: {};
        _input_out: unknown;
        _input_in: unknown;
        _output_in: unknown;
        _output_out: unknown;
        _meta: {};
    }, TNewParams>;
    router: <TProcRouterRecord extends import("@trpc/server").ProcedureRouterRecord>(opts: TProcRouterRecord) => import("@trpc/server").Router<import("@trpc/server").RouterDef<{}, import("@trpc/server").DefaultErrorShape, {}, TProcRouterRecord>> & TProcRouterRecord;
    mergeRouters: typeof import("@trpc/server").mergeRoutersGeneric;
};
export declare const router: import("@trpc/server").Router<import("@trpc/server").RouterDef<{}, import("@trpc/server").DefaultErrorShape, {}, {
    ping: import("@trpc/server").MutationProcedure<{
        _config: {
            ctx: {};
            meta: {};
            errorShape: import("@trpc/server").DefaultErrorShape;
            transformer: import("@trpc/server").DefaultDataTransformer;
        };
        _meta: {};
        _ctx_in: {};
        _ctx_out: {};
        _input_in: {
            headers?: Record<string, string> | undefined;
            body?: string | undefined;
            url: string;
            method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
            timeout: number;
        };
        _input_out: {
            headers?: Record<string, string> | undefined;
            body?: string | undefined;
            url: string;
            method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
            timeout: number;
        };
        _output_in: {
            status: number;
            latency: number;
        };
        _output_out: {
            status: number;
            latency: number;
        };
    }>;
}>> & {
    ping: import("@trpc/server").MutationProcedure<{
        _config: {
            ctx: {};
            meta: {};
            errorShape: import("@trpc/server").DefaultErrorShape;
            transformer: import("@trpc/server").DefaultDataTransformer;
        };
        _meta: {};
        _ctx_in: {};
        _ctx_out: {};
        _input_in: {
            headers?: Record<string, string> | undefined;
            body?: string | undefined;
            url: string;
            method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
            timeout: number;
        };
        _input_out: {
            headers?: Record<string, string> | undefined;
            body?: string | undefined;
            url: string;
            method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
            timeout: number;
        };
        _output_in: {
            status: number;
            latency: number;
        };
        _output_out: {
            status: number;
            latency: number;
        };
    }>;
};
export declare type Router = typeof router;
//# sourceMappingURL=router.d.ts.map