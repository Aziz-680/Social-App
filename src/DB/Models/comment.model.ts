import mongoose, { Schema } from 'mongoose';
import { IComment } from '../../Common/Types/interface.types';

const commentSchema = new Schema<IComment>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', //  connect comment author
        required: true
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'Post', //  Links to the specific post
        required: true
    },
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,
        maxlength: 500
    }
}, {
    timestamps: true
});

const CommentModel = mongoose.models.Comment || mongoose.model<IComment>('Comment', commentSchema);
export default CommentModel;