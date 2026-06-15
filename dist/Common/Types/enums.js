"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHANNELS = exports.GENDER = exports.PROVIDERS = exports.STATUS = exports.USER_ROLES = exports.TOKEN_TYPES = void 0;
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
var STATUS;
(function (STATUS) {
    STATUS["ACTIVE"] = "active";
    STATUS["INACTIVE"] = "inactive";
})(STATUS || (exports.STATUS = STATUS = {}));
var PROVIDERS;
(function (PROVIDERS) {
    PROVIDERS["GOOGLE"] = "google";
    PROVIDERS["SYSTEM"] = "system";
    PROVIDERS["FACEBOOK"] = "facebook";
})(PROVIDERS || (exports.PROVIDERS = PROVIDERS = {}));
;
var GENDER;
(function (GENDER) {
    GENDER["MALE"] = "male";
    GENDER["FEMALE"] = "female";
})(GENDER || (exports.GENDER = GENDER = {}));
// export const fileExtensions {
//     image= ['jpg', 'jpeg', 'png', 'gif'],
//     video= ['mp4', 'avi', 'mkv', 'mov'],
//     application= ['pdf', 'doc', 'docx']
// }
var CHANNELS;
(function (CHANNELS) {
    CHANNELS["EMAIL"] = "email";
    CHANNELS["PHONE"] = "phone";
})(CHANNELS || (exports.CHANNELS = CHANNELS = {}));
