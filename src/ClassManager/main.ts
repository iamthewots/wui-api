import {
    ClassManagerMethod,
    ClassManagerSettings,
    ClassManagerTarget,
} from "./types";

export default class ClassManager {
    protected _el: Element;
    protected _settings: ClassManagerSettings;
    protected _classTimeouts: Map<string, number[]> = new Map();

    constructor(el: Element, settings: ClassManagerSettings) {
        if (!(el instanceof Element)) {
            throw new Error("Unable to register, not an Element");
        }
        this._el = el;
        this._settings = ClassManager.parseSettings(settings, false);
    }

    add(className: string, settings?: ClassManagerSettings) {
        this.manage(ClassManagerMethod.Add, className, settings);
    }

    remove(className: string, settings?: ClassManagerSettings) {
        this.manage(ClassManagerMethod.Remove, className, settings);
    }

    private manage(
        method: ClassManagerMethod,
        className: string,
        customSettings?: ClassManagerSettings
    ) {
        if (typeof className !== "string") return;

        this.clearClassTimeouts(className);
        const settings = customSettings
            ? {
                  ...this._settings,
                  ...ClassManager.parseSettings(customSettings),
              }
            : this._settings;
        if (settings.target === ClassManagerTarget.Self) {
            this.manageSelfClass(method, className, settings);
        }
        if (settings.target === ClassManagerTarget.Children) {
            this.manageChildrenClass(method, className, settings);
        }
    }

    private manageSelfClass(
        method: ClassManagerMethod,
        className: string,
        settings: ClassManagerSettings
    ) {
        this.applyClass(this._el, method, className);
    }

    private manageChildrenClass(
        method: ClassManagerMethod,
        className: string,
        settings: ClassManagerSettings
    ) {
        const { children } = this._el;
        if (!children || children.length === 0) return;

        const classTimeouts: number[] = [];
        let higherTimeToWait = 0;
        let lastChild: Element;
        const isIndexInverted =
            settings.invert ||
            (method === ClassManagerMethod.Add && settings.invertAdd) ||
            (method === ClassManagerMethod.Remove && settings.invertRemove);
        for (let i = 0; i < children.length; i++) {
            const index = isIndexInverted ? children.length - 1 - i : i;
            const child = children.item(index);
            if (!child) continue;

            lastChild = child;
            const classAlreadyApplied = child.classList.contains(className);
            const shouldSkipChild =
                !settings.reactive ||
                (classAlreadyApplied && method === ClassManagerMethod.Add) ||
                (!classAlreadyApplied && method === ClassManagerMethod.Remove);
            if (shouldSkipChild) continue;

            const shouldIgnoreInterval =
                (settings.ignoreIntervalOnAdd &&
                    method === ClassManagerMethod.Add) ||
                (settings.ignoreIntervalOnRemove &&
                    method === ClassManagerMethod.Remove);
            if (!settings.queue || shouldIgnoreInterval) {
                this.applyClass(child, method, className);
                continue;
            }

            let timeToWait = 0;
            if (typeof settings.interval === "number") {
                timeToWait = settings.interval * i;
            } else if (
                Array.isArray(settings.interval) &&
                settings.interval.length > 0
            ) {
                if (i >= 0 && i < settings.interval.length) {
                    timeToWait = settings.interval[i];
                } else {
                    const lastIndex = settings.interval.length - 1;
                    timeToWait =
                        settings.interval[lastIndex] * (i - lastIndex + 1);
                }
            }
            if (timeToWait > higherTimeToWait) {
                higherTimeToWait = timeToWait;
            }
            const timeout = setTimeout(() => {
                if (!child) return;
                this.applyClass(child, method, className);
            }, timeToWait);
            classTimeouts.push(timeout);
        }
        if (classTimeouts.length > 0) {
            this._classTimeouts.set(className, classTimeouts);
        }
    }

    private clearClassTimeouts(className: string) {
        const timeouts = this._classTimeouts.get(className);
        if (timeouts && timeouts.length > 0) {
            for (const timeout of timeouts) {
                clearTimeout(timeout);
            }
        }
    }

    private applyClass(
        target: Element,
        method: ClassManagerMethod,
        className: string
    ) {
        const fn = method === ClassManagerMethod.Add ? "add" : "remove";
        target.classList[fn](className);
        const eventName =
            method === ClassManagerMethod.Add ? "addclass" : "removeclass";
        const event = new CustomEvent(eventName, {
            detail: className,
        });
        target.dispatchEvent(event);
    }

    // accessors
    get settings() {
        return this._settings;
    }

    set settings(val: ClassManagerSettings) {
        const newSettings = ClassManager.parseSettings(val);
        this._settings = { ...this._settings, ...newSettings };
    }

    // static methods
    static parseSettings(
        obj: { [prop: string]: any } | ClassManagerSettings,
        onlyDefinedProps = true
    ) {
        const settings: ClassManagerSettings = {
            target: ClassManagerTarget.Self,
        };
        if (typeof obj !== "object") return settings;

        if (!onlyDefinedProps || typeof obj.queue === "boolean") {
            settings.queue = !!obj.queue;
        }
        if (!onlyDefinedProps || typeof obj.invert === "boolean") {
            settings.invert = !!obj.invert;
        }
        if (!onlyDefinedProps || typeof obj.invertAdd === "boolean") {
            settings.invertAdd = !!obj.invertAdd;
        }
        if (!onlyDefinedProps || typeof obj.invertRemove === "boolean") {
            settings.invertRemove = !!obj.invertRemove;
        }
        if (!onlyDefinedProps || typeof obj.reactive === "boolean") {
            settings.reactive = !!obj.reactive;
        }
        if (!onlyDefinedProps || typeof obj.ignoreIntervalOnAdd === "boolean") {
            settings.ignoreIntervalOnAdd = !!obj.ignoreIntervalOnAdd;
        }
        if (
            !onlyDefinedProps ||
            typeof obj.ignoreIntervalOnRemove === "boolean"
        ) {
            settings.ignoreIntervalOnRemove = !!obj.ignoreIntervalOnRemove;
        }
        if (!onlyDefinedProps || typeof obj.emitEvents === "boolean") {
            settings.emitEvents = !!obj.emitEvents;
        }
        if (
            obj.target &&
            Object.values(ClassManagerTarget).includes(obj.target)
        ) {
            settings.target = obj.target;
        }
        if (Array.isArray(obj.interval)) {
            settings.interval = obj.interval.filter((val) => {
                return typeof val === "number";
            });
        }

        return settings;
    }
}
