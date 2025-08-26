"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcReadTime = void 0;
const calcReadTime = (text) => {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
};
exports.calcReadTime = calcReadTime;
