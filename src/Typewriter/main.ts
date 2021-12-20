import {
    TypewriterElementData,
    TypewriterElementStatus,
    TypewriterSettings,
    TypewriterTextNodeData,
} from "./types.js";

export default class Typewriter {
    private _settings: TypewriterSettings;
    private _elementsData: Map<Element, TypewriterElementData> = new Map();

    constructor(settings: TypewriterSettings) {
        this._settings = Typewriter.parseSettings(settings);
    }

    initElement(el: Element, settings?: TypewriterSettings) {
        if (!el || !(el instanceof Element)) {
            throw new Error("Unable to parse, not an Element");
        }

        const textNodesData = this.parseElementData(el);
        const charsCount = this.parseElementCharsCount(textNodesData);
        const status = TypewriterElementStatus.Initial;
        const lastNodeIndex = textNodesData.length - 1;
        const lastCharIndex = textNodesData[lastNodeIndex].length - 1;
        const elSettings = settings
            ? Typewriter.parseSettings(settings)
            : undefined;
        const data: TypewriterElementData = {
            settings: elSettings,
            textNodesData,
            charsCount,
            status,
            lastNodeIndex,
            lastCharIndex,
        };
        this._elementsData.set(el, data);
    }

    clearText(el: Element) {
        this.stopText(el);
        if (!el || !(el instanceof Element)) return;
        const data = this._elementsData.get(el);
        if (!data) return;

        const { textNodesData } = data;
        textNodesData.forEach((tnd) => {
            tnd.node.textContent = "";
        });
        data.status = TypewriterElementStatus.Clear;
        data.lastNodeIndex = 0;
        data.lastCharIndex = 0;
    }

    async deleteText(el: Element) {
        if (!el || !(el instanceof Element)) return;
        const data = this._elementsData.get(el);
        if (!data || data.status === TypewriterElementStatus.InProgress) return;

        data.status = TypewriterElementStatus.InProgress;
        const settings = this.getSettings(el);
        const { lastNodeIndex, textNodesData } = data;
        let i = lastNodeIndex;
        for (; i >= 0; i--) {
            const { node, text } = textNodesData[i];
            if (!text || text === "" || !node.textContent) continue;

            while (node.textContent && node.textContent.length > 0) {
                // stop
                if (data.status !== TypewriterElementStatus.InProgress) {
                    data.lastNodeIndex = i;
                    data.lastCharIndex = node.textContent.length - 1;
                    return;
                }

                node.textContent = node.textContent.slice(0, -1);
                const { deleteModifier, timePerChar } = settings;
                // default timePerChar
                const timeToWait = this.getTimeToWait(settings);
                await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(null);
                    }, timeToWait);
                });
            }
        }
    }

    restoreText(el: Element) {
        this.stopText(el);
        if (!el || !(el instanceof Element)) return;
        const data = this._elementsData.get(el);
        if (!data) return;

        const { textNodesData } = data;
        textNodesData.forEach((tnd) => {
            tnd.node.textContent = tnd.text;
        });
        data.status = TypewriterElementStatus.Initial;
        data.lastNodeIndex = textNodesData.length - 1;
        data.lastCharIndex = textNodesData[data.lastNodeIndex].length - 1;
    }

    async writeText(el: Element) {
        if (!el || !(el instanceof Element)) return;
        const data = this._elementsData.get(el);
        if (!data || data.status === TypewriterElementStatus.InProgress) return;

        data.status = TypewriterElementStatus.InProgress;
        const settings = this.getSettings(el);
        const { lastCharIndex, lastNodeIndex, textNodesData } = data;
        for (let i = 0; i < textNodesData.length; i++) {
            const { node, text } = textNodesData[i];
            if (!text || text === "" || i < lastNodeIndex) continue;

            let j = i === lastNodeIndex ? lastCharIndex : 0;
            for (; j < text.length; j++) {
                // stop
                if (data.status !== TypewriterElementStatus.InProgress) {
                    data.lastNodeIndex = i;
                    data.lastCharIndex = j;
                    return;
                }

                const char = text[j];
                node.textContent += char;
                const timeToWait = this.getTimeToWait(settings, char);
                await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(null);
                    }, timeToWait);
                });
            }
        }
        data.status = TypewriterElementStatus.Initial;
        data.lastNodeIndex = textNodesData.length - 1;
        data.lastCharIndex = textNodesData[data.lastNodeIndex].text.length - 1;
    }

    stopText(el: Element) {
        if (!el || !(el instanceof Element)) return;
        const data = this._elementsData.get(el);
        if (!data || data.status !== TypewriterElementStatus.InProgress) return;

        data.status = TypewriterElementStatus.Partial;
    }

    private parseElementData(src: Element | Node) {
        let textNodesData: TypewriterTextNodeData[] = [];
        src.childNodes.forEach((node) => {
            if (!node.textContent) return;
            if (node.nodeType === 3) {
                textNodesData.push({
                    node,
                    text: node.textContent,
                    length: node.textContent.length,
                });
            } else {
                textNodesData = textNodesData.concat(
                    this.parseElementData(node)
                );
            }
        });
        return textNodesData;
    }

    private parseElementCharsCount(textNodesData: TypewriterTextNodeData[]) {
        let charsCount = 0;
        textNodesData.forEach((tn) => {
            charsCount += tn.length;
        });
        return charsCount;
    }

    private getTimeToWait(settings: TypewriterSettings, char?: string) {
        const timePerChar = settings.timePerChar || 25;
        // delete
        if (typeof char !== "string") {
            const deleteModifier = settings.deleteModifier || 1;
            return timePerChar * deleteModifier;
        }

        if (char.match(/\W/g)) {
            if (char.match(/[\@\{\}\[\]\(\)]/)) {
                return timePerChar * 2.5;
            }
            if (char.match(/[\,\>\<\%\$\€]/)) {
                return timePerChar * 5;
            }
            if (char.match(/[:;]/)) {
                return timePerChar * 10;
            }
            if (char.match(/[\.\?\!]/)) {
                return timePerChar * 15;
            }
        }
        return timePerChar;
    }

    /* accessors */
    getSettings(el: Element) {
        const data = this._elementsData.get(el);
        if (!data || !data.settings) return this._settings;
        return { ...this._settings, ...data.settings };
    }

    setSettings(settings: TypewriterSettings, el?: Element) {
        const newSettings = Typewriter.parseSettings(settings);
        if (!el) {
            this._settings = { ...this._settings, ...newSettings };
            return this._settings;
        }
        const data = this._elementsData.get(el);
        if (!data) {
            return;
        }
        data.settings = { ...data.settings, ...newSettings };
        return data.settings;
    }

    /* static methods */
    static parseSettings(
        obj: { [prop: string]: any } | TypewriterSettings,
        onlyDefinedProps = true
    ) {
        const settings: TypewriterSettings = {};
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
