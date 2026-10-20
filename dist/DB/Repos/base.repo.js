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
    constructor(model) {
        this.model = model;
    }
    // 1. Create Document
    createDocument(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.create(data);
        });
    }
    // 2. Find Single Document by Filters
    findOneDocument(filters_1) {
        return __awaiter(this, arguments, void 0, function* (filters, projection = {}, options = {}) {
            return yield this.model.findOne(filters, projection, options).exec();
        });
    }
    // 3. Find Single Document by ID
    findDocumentById(id_1) {
        return __awaiter(this, arguments, void 0, function* (id, projection = {}, options = {}) {
            return yield this.model.findById(id, projection, options).exec();
        });
    }
    // 4. Find Multiple Documents (With Pagination Support)
    findDocuments() {
        return __awaiter(this, arguments, void 0, function* (filters = {}, options = {}) {
            const { limit, skip, sort } = options, otherOptions = __rest(options, ["limit", "skip", "sort"]);
            const query = this.model.find(filters, null, otherOptions);
            if (sort)
                query.sort(sort);
            if (skip)
                query.skip(skip);
            if (limit)
                query.limit(limit);
            return yield query.exec();
        });
    }
    // 5. Update Document by ID
    updateDocument(id_1, updateData_1) {
        return __awaiter(this, arguments, void 0, function* (id, updateData, options = { new: true }) {
            return yield this.model.findByIdAndUpdate(id, updateData, Object.assign({ new: true }, options)).exec();
        });
    }
    // 6. Delete Document by ID
    deleteDocument(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findByIdAndDelete(id).exec();
        });
    }
    // 7. Count Documents Matching Filters
    countDocuments() {
        return __awaiter(this, arguments, void 0, function* (filters = {}) {
            return yield this.model.countDocuments(filters).exec();
        });
    }
}
exports.default = BaseRepository;
