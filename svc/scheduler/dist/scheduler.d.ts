export declare class Scheduler {
    private clearIntervals;
    private db;
    private updatedAt;
    constructor();
    syncEndpoints(): Promise<void>;
    addEndpoint(endpointId: string): Promise<void>;
    removeEndpoint(endpointId: string): void;
    private testEndpoint;
}
//# sourceMappingURL=scheduler.d.ts.map