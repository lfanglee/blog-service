import { getMongoRepository } from 'typeorm';
import Tag from '../entity/tag';

export default class TagModel {
    public async findAll() {
        const tagRepo = getMongoRepository<Tag>(Tag);
        const tags = await tagRepo.find();
        return tags;
    }

    public async findAllWithPaging(page = 0, limit = 10) {
        const tagRepo = getMongoRepository<Tag>(Tag);
        const tags = await tagRepo.find({
            skip: page * limit,
            take: limit,
            order: {
                create_at: 'DESC'
            }
        });
        return tags;
    }

    public async count() {
        const tagRepo = getMongoRepository<Tag>(Tag);
        const count = await tagRepo.count();
        return count;
    }

    public async findById(tagId: string) {
        const tagRepo = getMongoRepository<Tag>(Tag);
        const tag = await tagRepo.findOne(tagId);
        return tag;
    }

    public async save(tag: Tag) {
        const tagRepo = getMongoRepository<Tag>(Tag);
        tagRepo.save(tag);
    }
}
