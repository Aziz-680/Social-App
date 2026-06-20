import { IUser } from "../../Common/Types/interface.types"; 
import UserModel from "../Models/user.model";
import BaseRepository from "./base.repo";

class UserRepository extends BaseRepository<IUser> {
    constructor() {
        super(UserModel);
    }

}

export default UserRepository;