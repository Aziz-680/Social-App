"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_ROLES = exports.TOKEN_TYPES = void 0;
var TOKEN_TYPES;
(function (TOKEN_TYPES) {
    TOKEN_TYPES["ACCESS"] = "ACCESS";
    TOKEN_TYPES["REFRESH"] = "REFRESH";
})(TOKEN_TYPES || (exports.TOKEN_TYPES = TOKEN_TYPES = {}));
var USER_ROLES;
(function (USER_ROLES) {
    USER_ROLES["USER"] = "USER";
    USER_ROLES["ADMIN"] = "ADMIN";
})(USER_ROLES || (exports.USER_ROLES = USER_ROLES = {}));
