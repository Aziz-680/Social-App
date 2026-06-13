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
exports.responseFormatter = void 0;
// Added 'export' right here!
const responseFormatter = (handler) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const result = yield handler(req, res, next);
        if (res.headersSent)
            return;
        return res.status(((_a = result === null || result === void 0 ? void 0 : result.meta) === null || _a === void 0 ? void 0 : _a.statusCode) || 200).json({
            success: true,
            message: result.message || 'success',
            data: result.data || result,
            meta: result.meta || {}
        });
    });
};
exports.responseFormatter = responseFormatter;
