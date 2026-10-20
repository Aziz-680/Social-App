import { IUser } from "../../Common/Types/interface.types"; 
import UserModel from "../Models/user.model";
import BaseRepository from "./base.repo";

class UserRepository extends BaseRepository<IUser> {
    constructor() {
        super(UserModel);
    }

    // Explicit override to guarantee execution and avoid abstract method errors
    override findDocumentById = async (id: string | any): Promise<IUser | null> => {
        return await UserModel.findById(id).exec();
    }
}

export default UserRepository;