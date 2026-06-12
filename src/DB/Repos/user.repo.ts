import type { IUser } from "../../Common/Types/interface.types.js";
import User from "../Models/user.model.js";
import BaseRepository from "./base.repo.js";

class UserRepository extends BaseRepository<IUser>{
    constructor(){
        super(User)
    }
}

export default UserRepository