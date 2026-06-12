import UserRepository from "../../DB/Repos/user.repo.js"

class AuthService {

    constructor(
        private userRepository :UserRepository = new UserRepository()
    ){
    }

    health = (body:object)=>{
        this.userRepository.findDocuments({},{})
        return body
    }

}

export default new AuthService()