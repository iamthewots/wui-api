export interface IntersectionManagerSettings {
    treshold: number;
    observeOnce?: boolean;
    toggleOpacity?: boolean;
    intersectionClass?: string;
    noIntersectionClass?: string;
    intersectionHandler?: (entry: IntersectionObserverEntry) => any;
    noIntersectionHandler?: (entry: IntersectionObserverEntry) => any;
    [prop: string]: any;
}
