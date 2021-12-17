import { IntersectionManagerSettings } from "..";
export default class IntersectionManager {
    private _settings;
    private _settingsList;
    private _observersList;
    constructor(settings: IntersectionManagerSettings);
    observe(el: Element, settings?: IntersectionManagerSettings): void;
    private observerCallback;
    private applyOptions;
    getObserver(threshold: number): IntersectionObserver;
    getSettings(el: Element): IntersectionManagerSettings;
    setSettings(settings: IntersectionManagerSettings, el?: Element): IntersectionManagerSettings | undefined;
    static parseSettings(obj: IntersectionManagerSettings, onlyDefinedProps?: boolean): IntersectionManagerSettings;
}
//# sourceMappingURL=main.d.ts.map