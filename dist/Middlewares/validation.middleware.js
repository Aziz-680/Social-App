"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../Common/Utils");
const validation = (schema) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const validationErrors = [];
        for (const key in schema) {
            const validkey = key;
            const result = (_a = schema[validkey]) === null || _a === void 0 ? void 0 : _a.safeParse(req[validkey]);
            if (result && !result.success) {
                validationErrors.push(...result.error.issues);
            }
        }
        if (validationErrors.length) {
            const formattedErrors = validationErrors.map(err => ({
                field: err.path.map((segment) => String(segment)).join('.'),
                message: err.message
            }));
            return next(new Utils_1.BadRequestException('Validation error', formattedErrors));
        }
        next();
    });
};
exports.default = validation;
