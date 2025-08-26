"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const requireAdmin = (req, res, next) => {
    var _a;
    const userRole = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.role;
    if (!userRole || !['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
        res.status(403).json({ error: "Admin access required" });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
