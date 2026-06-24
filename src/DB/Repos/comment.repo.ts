import { IComment } from "../../Common/Types/interface.types";
import CommentModel from "../Models/comment.model";
import BaseRepository from "./base.repo";

class CommentRepository extends BaseRepository<IComment> {
    constructor() {
        super(CommentModel);
    }
}

export default CommentRepository;