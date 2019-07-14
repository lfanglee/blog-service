import { getMongoRepository, MongoRepository } from 'typeorm';
import File from '../entity/files';

export default class FileModel {
    public async findAndCount(page = 0, limit = 10) {
        const fileRepo: MongoRepository<File> = getMongoRepository(File);
        const files = await fileRepo.findAndCount({
            skip: limit * page,
            take: limit,
            order: {
                create_at: 'DESC'
            }
        });
        return files;
    }

    public async save(file: File) {
        const fileRepo = getMongoRepository<File>(File);
        const res = await fileRepo.save(file);
        return res;
    }
}
