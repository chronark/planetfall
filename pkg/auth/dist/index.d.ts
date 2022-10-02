/// <reference types="node" />
import { IronSessionOptions } from "iron-session";
import { GetServerSidePropsContext, GetServerSidePropsResult, NextApiHandler } from "next";
export declare const options: IronSessionOptions;
export declare function withSessionRoute(handler: NextApiHandler): NextApiHandler<any>;
export declare function withSessionSsr<P extends {
    [key: string]: unknown;
} = {
    [key: string]: unknown;
}>(handler: (context: GetServerSidePropsContext) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>): (context: GetServerSidePropsContext<import("querystring").ParsedUrlQuery, import("next").PreviewData>) => Promise<GetServerSidePropsResult<P>>;
export declare function storeSession(): Promise<void>;
//# sourceMappingURL=index.d.ts.map