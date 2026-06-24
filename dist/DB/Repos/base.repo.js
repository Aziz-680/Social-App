"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
class BaseRepository {
    // object
    constructor(model) {
        this.model = model;
    }
    createDocument(data) {
        return this.model.create(data);
    }
    findOneDocument(filters, select = {}) {
        return this.model.findOne(filters).select(select);
    }
    findDocumentById(id) {
        return this.model.findById(id);
    }
    findDocuments(filters, options = {}) {
        const { limit, skip } = options, otherOptions = __rest(options, ["limit", "skip"]);
        const query = this.model.find(filters, null, otherOptions);
        if (limit && skip) {
            return query.limit(limit).skip(skip);
        }
        return query;
    }
    updateDocument(id, updateData, options = {}) {
        return this.model.findByIdAndUpdate(id, updateData, Object.assign({ new: true }, options));
    }
    deleteDocument(id) {
        return this.model.findByIdAndDelete(id);
    }
}
exports.default = BaseRepository;
