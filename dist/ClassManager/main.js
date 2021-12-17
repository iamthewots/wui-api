"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
class ClassManager {
    constructor(el, settings) {
        this._classTimeouts = new Map();
        if (!(el instanceof Element)) {
            throw new Error("Invalid element");
        }
        this._el = el;
        this._settings = ClassManager.parseSettings(settings, false);
    }
    add(className, settings) {
        this.manage(types_1.ClassManagerMethod.Add, className, settings);
    }
    remove(className, settings) {
        this.manage(types_1.ClassManagerMethod.Remove, className, settings);
    }
    manage(method, className, customSettings) {
        if (typeof className !== "string")
            return;
        this.clearClassTimeouts(className);
        const settings = customSettings
            ? Object.assign(Object.assign({}, this._settings), ClassManager.parseSettings(customSettings)) : this._settings;
        if (settings.target === types_1.ClassManagerTarget.Self) {
            this.manageSelfClass(method, className, settings);
        }
        if (settings.target === types_1.ClassManagerTarget.Children) {
            this.manageChildrenClass(method, className, settings);
        }
    }
    manageSelfClass(method, className, settings) {
        this.applyClass(this._el, method, className);
    }
    manageChildrenClass(method, className, settings) {
        const { children } = this._el;
        if (!children || children.length === 0)
            return;
        const classTimeouts = [];
        let higherTimeToWait = 0;
        let lastChild;
        const isIndexInverted = settings.invert ||
            (method === types_1.ClassManagerMethod.Add && settings.invertAdd) ||
            (method === types_1.ClassManagerMethod.Remove && settings.invertRemove);
        for (let i = 0; i < children.length; i++) {
            const index = isIndexInverted ? children.length - 1 - i : i;
            const child = children.item(index);
            if (!child)
                continue;
            lastChild = child;
            const classAlreadyApplied = child.classList.contains(className);
            const shouldSkipChild = !settings.reactive ||
                (classAlreadyApplied && method === types_1.ClassManagerMethod.Add) ||
                (!classAlreadyApplied && method === types_1.ClassManagerMethod.Remove);
            if (shouldSkipChild)
                continue;
            const shouldIgnoreInterval = (settings.ignoreIntervalOnAdd &&
                method === types_1.ClassManagerMethod.Add) ||
                (settings.ignoreIntervalOnRemove &&
                    method === types_1.ClassManagerMethod.Remove);
            if (!settings.queue || shouldIgnoreInterval) {
                this.applyClass(child, method, className);
                continue;
            }
            let timeToWait = 0;
            if (typeof settings.interval === "number") {
                timeToWait = settings.interval * i;
            }
            else if (Array.isArray(settings.interval) &&
                settings.interval.length > 0) {
                if (i >= 0 && i < settings.interval.length) {
                    timeToWait = settings.interval[i];
                }
                else {
                    const lastIndex = settings.interval.length - 1;
                    timeToWait =
                        settings.interval[lastIndex] * (i - lastIndex + 1);
                }
            }
            if (timeToWait > higherTimeToWait) {
                higherTimeToWait = timeToWait;
            }
            const timeout = setTimeout(() => {
                if (!child)
                    return;
                this.applyClass(child, method, className);
            }, timeToWait);
            classTimeouts.push(timeout);
        }
        if (classTimeouts.length > 0) {
            this._classTimeouts.set(className, classTimeouts);
        }
    }
    clearClassTimeouts(className) {
        const timeouts = this._classTimeouts.get(className);
        if (timeouts && timeouts.length > 0) {
            for (const timeout of timeouts) {
                clearTimeout(timeout);
            }
        }
    }
    applyClass(target, method, className) {
        const fn = method === types_1.ClassManagerMethod.Add ? "add" : "remove";
        target.classList[fn](className);
        const eventName = method === types_1.ClassManagerMethod.Add ? "addclass" : "removeclass";
        const event = new CustomEvent(eventName, {
            detail: className,
        });
        target.dispatchEvent(event);
    }
    // accessors
    get settings() {
        return this._settings;
    }
    set settings(val) {
        const newSettings = ClassManager.parseSettings(val);
        this._settings = Object.assign(Object.assign({}, this._settings), newSettings);
    }
    // static methods
    static parseSettings(obj, onlyDefinedProps = true) {
        const settings = {
            target: types_1.ClassManagerTarget.Self,
        };
        if (typeof obj !== "object")
            return settings;
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
        if (!onlyDefinedProps ||
            typeof obj.ignoreIntervalOnRemove === "boolean") {
            settings.ignoreIntervalOnRemove = !!obj.ignoreIntervalOnRemove;
        }
        if (!onlyDefinedProps || typeof obj.emitEvents === "boolean") {
            settings.emitEvents = !!obj.emitEvents;
        }
        if (obj.target &&
            Object.values(types_1.ClassManagerTarget).includes(obj.target)) {
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
exports.default = ClassManager;
