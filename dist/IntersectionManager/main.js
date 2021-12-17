"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IntersectionManager {
    constructor(settings) {
        this._settingsList = new Map();
        this._observersList = new Map();
        this._settings = IntersectionManager.parseSettings(settings, false);
    }
    observe(el, settings) {
        if (!(el instanceof Element)) {
            throw new Error("Unable to observe, not an Element");
        }
        const elSettings = settings
            ? IntersectionManager.parseSettings(settings)
            : this._settings;
        const observer = this.getObserver(elSettings.treshold);
        if (observer) {
            observer.observe(el);
            this._settingsList.set(el, elSettings);
        }
    }
    observerCallback(entries, observer) {
        entries.forEach((entry) => {
            const settings = this.applyOptions(entry);
            const el = entry.target;
            if (entry.isIntersecting && settings.observeOnce) {
                observer.unobserve(el);
            }
            const eventName = entry.isIntersecting
                ? "intersection"
                : "nointersection";
            const event = new CustomEvent(eventName);
            entry.target.dispatchEvent(event);
        });
    }
    applyOptions(entry) {
        const el = entry.target;
        const settings = this.getSettings(el);
        if (settings.toggleOpacity && el instanceof HTMLElement) {
            el.style.opacity = entry.isIntersecting ? "initial" : "0";
        }
        const classToAdd = entry.isIntersecting
            ? settings.intersectionClass
            : settings.noIntersectionClass;
        const classToRemove = entry.isIntersecting
            ? settings.noIntersectionClass
            : settings.intersectionClass;
        if (classToAdd)
            el.classList.add(classToAdd);
        if (classToRemove)
            el.classList.remove(classToRemove);
        if (entry.isIntersecting && settings.intersectionHandler) {
            settings.intersectionHandler(entry);
        }
        if (!entry.isIntersecting && settings.noIntersectionHandler) {
            settings.noIntersectionHandler(entry);
        }
        return settings;
    }
    /* Accessors */
    getObserver(threshold) {
        if (typeof threshold !== "number") {
            threshold = 1;
        }
        const observer = this._observersList.get(threshold);
        if (observer) {
            return observer;
        }
        const newObserver = new IntersectionObserver(this.observerCallback.bind(this), {
            threshold,
        });
        return newObserver;
    }
    getSettings(el) {
        if (!el)
            return this._settings;
        const elSettings = this._settingsList.get(el);
        if (elSettings) {
            return Object.assign(Object.assign({}, this._settings), elSettings);
        }
        return this._settings;
    }
    setSettings(settings, el) {
        if (typeof settings !== "object" || (el && !this._settingsList.get(el)))
            return;
        const newSettings = IntersectionManager.parseSettings(settings);
        if (!el) {
            this._settings = Object.assign(Object.assign({}, this._settings), newSettings);
            return this._settings;
        }
        const elSettings = this.getSettings(el);
        const newElSettings = Object.assign(Object.assign({}, elSettings), newSettings);
        const tresholdHasChanged = typeof settings === "object" &&
            typeof settings.treshold === "number" &&
            newSettings.treshold !== elSettings.treshold;
        if (tresholdHasChanged) {
            const actualObs = this.getObserver(elSettings.threshold);
            if (actualObs) {
                actualObs.unobserve(el);
            }
            this._settingsList.set(el, newElSettings);
        }
        else {
            /* treshould would default to 1 */
            newElSettings.treshold = elSettings.treshold;
            this._settingsList.set(el, newElSettings);
        }
    }
    /* Static methods */
    static parseSettings(obj, onlyDefinedProps = true) {
        const settings = {
            treshold: 1,
        };
        if (typeof obj !== "object")
            return settings;
        if (!onlyDefinedProps || typeof obj.observeOnce === "boolean") {
            settings.observeOnce = !!obj.observeOnce;
        }
        if (!onlyDefinedProps || typeof obj.toggleOpacity === "boolean") {
            settings.toggleOpacity = !!obj.toggleOpacity;
        }
        if (typeof obj.intersectionClass === "string") {
            settings.intersectionClass = obj.intersectionClass;
        }
        if (typeof obj.noIntersectionClass === "string") {
            settings.noIntersectionClass = obj.noIntersectionClass;
        }
        if (typeof obj.intersectionHandler === "function") {
            settings.intersectionHandler = obj.intersectionHandler;
        }
        if (typeof obj.noIntersectionHandler === "function") {
            settings.noIntersectionHandler = obj.noIntersectionHandler;
        }
        if (typeof obj.threshold === "number") {
            settings.threshold = Math.min(Math.max(obj.threshold, 0), 1);
        }
        return settings;
    }
}
exports.default = IntersectionManager;
