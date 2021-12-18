export interface IntersectionManagerSettings {
    threshold: number;
    observeOnce?: boolean;
    toggleOpacity?: boolean;
    intersectionClass?: string;
    noIntersectionClass?: string;
    intersectionHandler?: (entry: IntersectionObserverEntry) => any;
    noIntersectionHandler?: (entry: IntersectionObserverEntry) => any;
}
