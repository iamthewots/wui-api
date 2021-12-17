"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassManagerMethod = exports.ClassManagerTarget = void 0;
var ClassManagerTarget;
(function (ClassManagerTarget) {
    ClassManagerTarget[ClassManagerTarget["Self"] = 0] = "Self";
    ClassManagerTarget[ClassManagerTarget["Children"] = 1] = "Children";
})(ClassManagerTarget = exports.ClassManagerTarget || (exports.ClassManagerTarget = {}));
var ClassManagerMethod;
(function (ClassManagerMethod) {
    ClassManagerMethod[ClassManagerMethod["Remove"] = 0] = "Remove";
    ClassManagerMethod[ClassManagerMethod["Add"] = 1] = "Add";
})(ClassManagerMethod = exports.ClassManagerMethod || (exports.ClassManagerMethod = {}));
