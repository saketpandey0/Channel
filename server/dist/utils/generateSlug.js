"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlug = void 0;
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};
exports.generateSlug = generateSlug;
