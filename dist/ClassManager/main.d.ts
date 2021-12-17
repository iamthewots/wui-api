import { ClassManagerSettings } from "./types";
export default class ClassManager {
    protected _el: Element;
    protected _settings: ClassManagerSettings;
    protected _classTimeouts: Map<string, number[]>;
    constructor(el: Element, settings: ClassManagerSettings);
    add(className: string, settings?: ClassManagerSettings): void;
    remove(className: string, settings?: ClassManagerSettings): void;
    private manage;
    private manageSelfClass;
    private manageChildrenClass;
    private clearClassTimeouts;
    private applyClass;
    get settings(): ClassManagerSettings;
    set settings(val: ClassManagerSettings);
    static parseSettings(obj: ClassManagerSettings, onlyDefinedProps?: boolean): ClassManagerSettings;
}
//# sourceMappingURL=main.d.ts.map