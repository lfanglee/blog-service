import { getMongoRepository, getMongoManager } from 'typeorm';
import { ObjectID } from 'mongodb';
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

    public async findByIds(idArr: string[]) {
        const tagRepo = getMongoRepository<Tag>(Tag);
        const tags = await tagRepo.findByIds(idArr.map(id => new ObjectID(id)));
        return tags;
    }

    public async findByName(tagName: string) {
        const tagRepo = getMongoRepository<Tag>(Tag);
        const tag = await tagRepo.find({ name: tagName });
        return tag;
    }

    public async save(tag: Tag) {
        const tagRepo = getMongoRepository<Tag>(Tag);
        const res = await tagRepo.save(tag);
        return res;
    }

    public async findByIdAndUpdate(id: string, data: Partial<Tag>) {
        const tagRepo = getMongoRepository<Tag>(Tag);
        const tag = await tagRepo.findOneAndUpdate({
            _id: new ObjectID(id)
        }, {
            $set: data
        }, { upsert: false });
        return tag;
    }

    public async delete(id: string) {
        const tagRepo = getMongoRepository<Tag>(Tag);
        const res = await tagRepo.delete(id);
        return res;
    }
}
