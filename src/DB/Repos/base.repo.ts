import mongoose from "mongoose";
import type { FilterQuery, UpdateQuery, QueryOptions, ProjectionType } from "mongoose";

export default abstract class BaseRepository<T> {
  constructor(protected model: mongoose.Model<T>) {}

  // 1. Create Document
  async createDocument(data: Partial<T> | any): Promise<T> {
    return await this.model.create(data);
  }

  // 2. Find Single Document by Filters
  async findOneDocument(
    filters: FilterQuery<T>,
    projection: ProjectionType<T> = {},
    options: QueryOptions = {}
  ): Promise<T | null> {
    return await this.model.findOne(filters, projection, options).exec();
  }

  // 3. Find Single Document by ID
  async findDocumentById(
    id: string | mongoose.Types.ObjectId,
    projection: ProjectionType<T> = {},
    options: QueryOptions = {}
  ): Promise<T | null> {
    return await this.model.findById(id, projection, options).exec();
  }

  // 4. Find Multiple Documents (With Pagination Support)
  async findDocuments(
    filters: FilterQuery<T> = {},
    options: QueryOptions = {}
  ): Promise<T[]> {
    const { limit, skip, sort, ...otherOptions } = options;

    const query = this.model.find(filters, null, otherOptions);

    if (sort) query.sort(sort);
    if (skip) query.skip(skip);
    if (limit) query.limit(limit);

    return await query.exec();
  }

  // 5. Update Document by ID
  async updateDocument(
    id: string | mongoose.Types.ObjectId,
    updateData: UpdateQuery<T>,
    options: QueryOptions = { new: true }
  ): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, updateData, { new: true, ...options }).exec();
  }

  // 6. Delete Document by ID
  async deleteDocument(
    id: string | mongoose.Types.ObjectId
  ): Promise<T | null> {
    return await this.model.findByIdAndDelete(id).exec();
  }

  // 7. Count Documents Matching Filters
  async countDocuments(filters: FilterQuery<T> = {}): Promise<number> {
    return await this.model.countDocuments(filters).exec();
  }
}