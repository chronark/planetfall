import {
	BaseClientOptions,
	SchemaInference,
	XataRecord,
} from "@xata.io/client";
declare const tables: readonly [
	{
		readonly name: "checks";
		readonly columns: readonly [];
	},
	{
		readonly name: "API";
		readonly columns: readonly [
			{
				readonly name: "method";
				readonly type: "string";
				readonly notNull: true;
				readonly defaultValue: "POST";
			},
			{
				readonly name: "name";
				readonly type: "string";
			},
			{
				readonly name: "url";
				readonly type: "string";
				readonly notNull: true;
				readonly defaultValue: '""';
			},
		];
	},
	{
		readonly name: "status_page";
		readonly columns: readonly [];
	},
];
export declare type SchemaTables = typeof tables;
export declare type InferredTypes = SchemaInference<SchemaTables>;
export declare type Checks = InferredTypes["checks"];
export declare type ChecksRecord = Checks & XataRecord;
export declare type Api = InferredTypes["API"];
export declare type ApiRecord = Api & XataRecord;
export declare type StatusPage = InferredTypes["status_page"];
export declare type StatusPageRecord = StatusPage & XataRecord;
export declare type DatabaseSchema = {
	checks: ChecksRecord;
	API: ApiRecord;
	status_page: StatusPageRecord;
};
declare const DatabaseClient: any;
export declare class XataClient extends DatabaseClient<DatabaseSchema> {
	constructor(options?: BaseClientOptions);
}
export declare const getXataClient: () => XataClient;
export {};
