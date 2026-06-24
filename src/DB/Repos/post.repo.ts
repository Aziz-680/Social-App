import { IPost } from "../../Common/Types/interface.types";
import PostModel from "../Models/post.model";
import BaseRepository from "./base.repo";

class PostRepository extends BaseRepository<IPost> {
    constructor() {
        super(PostModel);
    }

}

export default PostRepository;