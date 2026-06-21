import mongoose from "mongoose";
import type { FilterQuery, UpdateQuery, QueryOptions } from "mongoose";

export default abstract class BaseRepository<T> {

    // object
    constructor(protected model: mongoose.Model<T>) {}

    createDocument(data: T | any): Promise<T> {
        return this.model.create(data);
    }

    findOneDocument(filters: FilterQuery<T>, select = {}): Promise<T | null> {
        return this.model.findOne(filters).select(select);
    }

    findDocumentById(id: string | any): Promise<T | null> {
                console.log(id);

        return this.model.findById(id);
    }

    findDocuments(filters: FilterQuery<T>, options: QueryOptions = {}): Promise<T[]> {
        const { limit, skip, ...otherOptions } = options;
        const query = this.model.find(filters, null, otherOptions);
        
        if (limit && skip) {
            return query.limit(limit).skip(skip) as any;
        }
        return query as any;
    }


    updateDocument(id: string | any, updateData: UpdateQuery<T>, options: QueryOptions = {}): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, updateData, { new: true, ...options });
    }

    deleteDocument(id: string | any): Promise<T | null> {
        return this.model.findByIdAndDelete(id);
    }
}