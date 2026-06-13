import mongoose from "mongoose";

import type { FilterQuery }  from "mongoose";

export default abstract class BaseRepository<T> {

    // object
    constructor( protected model:mongoose.Model<T>){}

    createDocument(data:T):Promise<T>{
        return this.model.create(data);
    }

    findOneDocument(filters:FilterQuery<T>, select={}):Promise<T | null>{
        return this.model.findOne(filters).select(select);
    }

    findDocumentById(id: string | any):Promise<T | null>{
        return this.model.findById(id);
    }

    findDocuments(filters:FilterQuery<T>, options:mongoose.QueryOptions):Promise<T[]>{
        const { limit , skip , ...otherOptions }= options
        const query = this.model.find(filters, otherOptions);
        if(limit && skip) {
            return query.limit(limit).skip(skip)
        }
        return query
    }
}