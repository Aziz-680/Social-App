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
const Utils_1 = require("../Common/Utils"); // Adjust path if needed
const validation = (schema) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        // 1. Explicitly type this as an array of Zod issues to appease TS
        const validationErrors = [];
        for (const key in schema) {
            const validkey = key;
            const result = (_a = schema[validkey]) === null || _a === void 0 ? void 0 : _a.safeParse(req[validkey]);
            if (result && !result.success) {
                // 2. USE THE SPREAD OPERATOR (...) HERE
                // This flattens the errors so they don't become an array inside an array!
                validationErrors.push(...result.error.issues);
            }
        }
        // 3. Clean format output for your global handler
        if (validationErrors.length) {
            // Map the errors cleanly to match your custom error expectations
            const formattedErrors = validationErrors.map(err => ({
                field: err.path.map((segment) => String(segment)).join('.'),
                message: err.message
            }));
            // Pass the error to next() instead of throwing inside async middleware!
            return next(new Utils_1.BadRequestException('Validation error', formattedErrors));
        }
        next();
    });
};
exports.default = validation;
