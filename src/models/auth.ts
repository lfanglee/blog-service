import { getMongoRepository } from 'typeorm';
import { ObjectID } from 'mongodb';
import Auth from '../entity/auth';

export default class AuthModel {
    public async count() {
        const authRepo = getMongoRepository<Auth>(Auth);
        const count = await authRepo.count();
        return count;
    }

    public async findByUsername(username: string) {
        const authRepo = getMongoRepository<Auth>(Auth);
        const user = await authRepo.findOne({ username });
        return user;
    }

    public async save(user: Auth) {
        const authRepo = getMongoRepository<Auth>(Auth);
        const res = await authRepo.save(user);
        return res;
    }

    public async update(id: string, data: Partial<Auth>) {
        const authRepo = getMongoRepository<Auth>(Auth);
        const updateAuth = await authRepo.update(id, data);
        return updateAuth;
    }
}
