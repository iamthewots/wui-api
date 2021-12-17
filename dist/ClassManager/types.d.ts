export interface ClassManagerSettings {
    target?: ClassManagerTarget;
    queue?: boolean;
    invert?: boolean;
    invertAdd?: boolean;
    invertRemove?: boolean;
    reactive?: boolean;
    interval?: number | number[];
    ignoreIntervalOnAdd?: boolean;
    ignoreIntervalOnRemove?: boolean;
    emitEvents?: boolean;
    [prop: string]: any;
}
export declare enum ClassManagerTarget {
    "Self" = 0,
    "Children" = 1
}
export declare enum ClassManagerMethod {
    "Remove" = 0,
    "Add" = 1
}
//# sourceMappingURL=types.d.ts.map