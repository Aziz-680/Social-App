import mongoose, { Schema } from 'mongoose';
import { IPost } from '../../Common/Types/interface.types';

const postSchema = new Schema<IPost>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // connect User model
        required: true
    },
    content: {
        type: String,
        required: [true, 'Post content is required'],
        trim: true,
        maxlength: 2000 
    },
    media: [{
        type: String // Optional array for image/video URLs
    }],
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User' // Links to the users who liked the post
    }]
}, {
    timestamps: true
});

const PostModel = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);
export default PostModel;