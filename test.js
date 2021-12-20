import { ClassManager, IntersectionManager, Typewriter } from "./dist/index.js";

console.log("Test file loaded");

/* Typewriter */
const twTarget = document.getElementById("tw-target");
const tw = new Typewriter();
tw.initElement(twTarget);

const twButtons = {};
"write,delete,stop,restore,clear".split(",").forEach((buttonId) => {
    const fn = buttonId + "Text";
    const btn = document.getElementById(buttonId);
    btn.addEventListener("click", () => {
        console.log("Click!");
        tw[fn](twTarget);
    });
});

/* ClassManager */
const cmTarget = document.getElementById("cm-target");
const cmInput = document.getElementById("class-name");
const cm = new ClassManager(cmTarget);

"add,remove".split(",").forEach((buttonId) => {
    const fn = buttonId;
    const btn = document.getElementById(buttonId);
    btn.addEventListener("click", () => {
        const className = cmInput.value;
        cm[fn](className);
    });
});

/* IntersectionManager */
const imTarget = document.getElementById("im-target");
const im = new IntersectionManager({
    threshold: 0.5,
    intersectionHandler: () => {
        alert("Intersection");
    },
    noIntersectionHandler: () => {
        alert("No intersection");
    },
});
im.observe(imTarget);
