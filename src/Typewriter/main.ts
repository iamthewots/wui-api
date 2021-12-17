import { TypewriterElementData, TypewriterElementStatus, TypewriterSettings } from "..";

export default class Typewriter {
    private _settings: TypewriterSettings;
    private _elementsData: Map<Element, TypewriterElementData> = new Map();

    constructor(settings: TypewriterSettings) {
        this._settings = Typewriter.parseSettings(settings);
    }

    /* accessors */
    getOptions(el: Element) {}

    setOptions(settings: TypewriterSettings, el?: Element) {}

    /* static methods */
    static parseSettings(obj: TypewriterSettings, onlyDefinedProps = true) {
        const settings: TypewriterSettings = {
            timePerChar: 25,
            deleteModifier: 0.5,
        };
        if (typeof obj !== "object") return settings;

        if (!onlyDefinedProps || typeof obj.ignorePunctuation === "boolean") {
            settings.ignorePunctuation = !!obj.ignorePunctuation;
        }
        if (typeof obj.timePerChar === "number") {
            settings.timePerChar = obj.timePerChar;
        }
        if (typeof obj.deleteModifier === "number") {
            settings.deleteModifier = obj.deleteModifier;
        } else {
            settings.deleteModifier = settings.timePerChar;
        }
        return settings;
    }
}
