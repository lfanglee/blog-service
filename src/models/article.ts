import { getMongoRepository } from 'typeorm';
import Article from '../entity/article';
import Tag from '../entity/tag';

export default class ArticleModel {
    public async findByTagAndCount(tag: Tag) {
        const articleRepo = getMongoRepository<Article>(Article);
        const articles = await articleRepo.findAndCount({
            where: {
                tags: { $all: [tag.id.toString()] }
            }
        });
        return articles;
    }
}
