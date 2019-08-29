import { getMongoRepository } from 'typeorm';
import * as MarkdownIt from 'markdown-it';
import Article from '../entity/article';
import Tag from '../entity/tag';

const md = new MarkdownIt();

export default class ArticleModel {
    public async count() {
        const articleRepo = getMongoRepository<Article>(Article);
        const count = articleRepo.count();
        return count;
    }

    public async findAll() {
        const articleRepo = getMongoRepository<Article>(Article);
        const articles = await articleRepo.find();
        return articles;
    }

    public async findAllFinishedAndPublished() {
        const articleRepo = getMongoRepository<Article>(Article);
        const articles = await articleRepo.find({
            where: {
                state: 1,
                publish: 1
            }
        });
        return articles;
    }

    public async findById(articleId: string) {
        const articleRepo = getMongoRepository<Article>(Article);
        const article = await articleRepo.findOne(articleId);
        return article;
    }

    public async findByTagAndCount(tag: Tag) {
        const articleRepo = getMongoRepository<Article>(Article);
        const articles = await articleRepo.findAndCount({
            where: {
                tags: { $all: [tag.id.toString()] }
            }
        });
        return articles;
    }

    public async findAllWithPaging(page = 0, limit = 10) {
        const articleRepo = getMongoRepository<Article>(Article);
        const tags = await articleRepo.find({
            skip: page * limit,
            take: limit,
            order: {
                create_at: 'DESC'
            }
        });
        return tags;
    }

    public async findAllFinishedAndPublishWithPaging(page = 0, limit = 10) {
        const articleRepo = getMongoRepository<Article>(Article);
        const tags = await articleRepo.find({
            where: {
                state: 1,
                publish: 1
            },
            skip: page * limit,
            take: limit,
            order: {
                create_at: 'DESC'
            }
        });
        return tags;
    }

    public async timeline() {
        const articleRepo = getMongoRepository<Article>(Article);
        const articles = await articleRepo.aggregate([
            { $match: { state: 1, publish: 1 } },
            {
                $project: {
                    year: { $year: '$create_at' },
                    month: { $month: '$create_at' },
                    title: 1,
                    create_at: 1
                }
            },
            {
                $group: {
                    _id: {
                        year: '$year',
                        month: '$month'
                    },
                    article: {
                        $push: {
                            title: '$title',
                            _id: '$_id',
                            create_at: '$create_at'
                        }
                    }
                }
            }
        ]).toArray();
        return articles;
    }

    public async save(article: Article) {
        const articleRepo = getMongoRepository<Article>(Article);
        article.descript = md.render(article.content).replace(/<[^>]*>/g, '').slice(0, 135);
        const res = await articleRepo.save(article);
        return res;
    }

    public async delete(articleId: string) {
        const articleRepo = getMongoRepository<Article>(Article);
        const res = await articleRepo.delete(articleId);
        return res;
    }
}
