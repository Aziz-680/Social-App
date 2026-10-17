import mongoose, { Schema } from 'mongoose';
import { IPost } from '../../Common/Types/interface.types';

// 1. Sub-schema for rich reactions (like, love, haha, etc.)
const reactionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
        default: 'like'
    }
}, {
    _id: false
});

// 2. Sub-schema for individual comments (Must be declared BEFORE postSchema)
const commentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Comment content cannot be empty'],
        trim: true,
        maxlength: 500
    },
    reactions: [reactionSchema]
}, {
    timestamps: true
});

// 3. Main Post Schema
const postSchema = new Schema<IPost>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: ""
    },
    media: [{
        type: String
    }],
    privacy: {
        type: String,
        enum: ['public', 'friends', 'only_me'],
        default: 'public'
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    reactions: [reactionSchema],
    comments: [commentSchema],
    isRepost: {
        type: Boolean,
        default: false
    },
    originalPostId: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        default: null
    }
}, {
    timestamps: true
});

const PostModel = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);
export default PostModel;