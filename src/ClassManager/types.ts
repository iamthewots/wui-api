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
}

export enum ClassManagerTarget {
    Self,
    Children,
}

export enum ClassManagerMethod {
    Remove,
    Add,
}
