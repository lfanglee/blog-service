import * as Koa from 'koa';
import { MongoRepository, getMongoRepository, ObjectLiteral } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Validator, validate } from 'class-validator';
import ArticleEntity from '../entity/article';
import TagEntity from '../entity/tag';
import {
    Controller, Get, Post, Patch, Del, Param
} from '../decorators/router-decorator';
import { resReturn, log } from '../utils/index';

const validator = new Validator();

@Controller({ prefix: '/article' })
export default class Article {
    /**
     * 获取文章列表
     * @query pageSize 分页大小
     * @query pageNo 分页页数
     * @query keyword 关键词
     * @query state 文章状态
     * @query publish 发布状态
     * @query tag 标签
     */
    @Get('/')
    async getArts(ctx: Koa.Context) {
        let {
            pageNo = 1,
            pageSize = 10
        } = ctx.query;

        if (!validator.isInt(+pageNo) || !validator.min(pageNo, 1)) {
            pageNo = 1;
        }
        if (!validator.isInt(+pageSize) || !validator.min(pageSize, 1)) {
            pageSize = -1;
        }

        const articleRepo: MongoRepository<ArticleEntity> = getMongoRepository(ArticleEntity);
        const tagRepo: MongoRepository<TagEntity> = getMongoRepository(TagEntity);
        try {
            const total: number = await articleRepo.count();
            const arts: ArticleEntity[] = pageSize === -1
                ? await articleRepo.find()
                : await articleRepo.createEntityCursor()
                    .skip((pageNo - 1) * pageSize)
                    .limit(pageSize)
                    .toArray();

            ctx.body = resReturn({
                list: await Promise.all(arts.map(async (art: any) => {
                    art.tags = await tagRepo.findByIds(
                        art.tags.map((i: string) => new ObjectId(i))
                    );
                    return art;
                })),
                pagination: {
                    total,
                    totalPage: pageSize === -1 ? 1 : Math.ceil(total / pageSize),
                    pageNo,
                    pageSize
                }
            });
        } catch (error) {
            log(error, 'error');
            ctx.body = resReturn(null, 500, '服务器内部错误');
        }
    }

    /**
     * 获取文章列表的timeline
     */
    @Get('/timeline')
    async getAllArtsWithTimeline(ctx: Koa.Context) {
        const articleRepo: MongoRepository<ArticleEntity> = getMongoRepository(ArticleEntity);

        try {
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
            if (articles && articles.length) {
                const yearList = [...new Set(articles.map(item => item._id.year))]
                    .sort((a, b) => b - a)
                    .map(year => {
                        const monthList: Array<any> = [];
                        articles.forEach(article => {
                            if (article._id.year === year) {
                                monthList.push({
                                    month: article._id.month,
                                    articleList: article.article.reverse()
                                });
                            }
                        });
                        return { year, monthList: monthList.sort((a, b) => b.month - a.month) };
                    });
                ctx.body = resReturn(yearList);
                return;
            }
            ctx.body = resReturn([]);
        } catch (error) {
            log(error, 'error');
            ctx.body = resReturn(null, 500, '服务器内部错误');
        }
    }

    /**
     * 获取文章详情
     * @param artId 文章ID
     */
    @Get('/:artId')
    @Param('artId', (artId, ctx, next) => {
        if (!validator.isMongoId(artId)) {
            ctx.status = 404;
            return;
        }
        return next();
    })
    async getArt(ctx: Koa.Context) {
        const { artId } = ctx.params;
        const articleRepo: MongoRepository<ArticleEntity> = getMongoRepository(ArticleEntity);
        const tagRepo: MongoRepository<TagEntity> = getMongoRepository(TagEntity);
        try {
            const art = await articleRepo.findOne(artId);
            if (!art) {
                ctx.body = resReturn(null, 400, '文章不存在');
                return;
            }
            art.meta.views++;
            await articleRepo.save(art);
            ctx.body = resReturn({
                ...art,
                tags: await tagRepo.findByIds(art.tags.map((i: string) => new ObjectId(i)))
            });
        } catch (error) {
            log(error, 'error');
            ctx.body = resReturn(null, 500, '服务器内部错误');
        }
    }

    /**
     * 上传文章
     * @body title 文章标题
     * @body keyword 关键词
     * @body content 文章内容
     * @body descript 文章简述
     * @body thumb 缩略图
     * @body state 文章状态 1：发布， 2：草稿
     * @body publish 是否发布 1：发布， 2：未发布
     * @body type 文章类别 1：code
     * @body tags 标签ID列表
     */
    @Post('/')
    async addArt(ctx: Koa.Context) {
        const {
            title, keyword, content, descript, thumb,
            state = 1, publish = 1, type = 1, tags
        } = ctx.request.body;
        const articleRepo: MongoRepository<ArticleEntity> = getMongoRepository(ArticleEntity);
        const tagRepo: MongoRepository<TagEntity> = getMongoRepository(TagEntity);
        try {
            console.log(tags);
            const article: ArticleEntity = articleRepo.create({
                title,
                keyword,
                descript,
                content,
                thumb,
                state: +state,
                publish: +publish,
                type: +type,
                tags: tags.split(','),
                meta: {
                    views: 0, comments: 0, likes: 0
                }
            });
            const validateErr = await validate(article, { skipMissingProperties: true });
            if (validateErr.length) {
                ctx.body = resReturn(validateErr.map(e => e.constraints), 400, '文章发布失败');
                return;
            }
            await articleRepo.save(article);
            ctx.body = resReturn({
                ...article,
                tags: await tagRepo.findByIds(
                    article.tags.map((i: string) => new ObjectId(i))
                )
            });
        } catch (error) {
            log(error, 'error');
            ctx.body = resReturn(null, 500, '服务器内部错误');
        }
    }

    /**
     * 修改文章
     * @param 参数同上传文章接口，传递需要修改的字段即可
     */
    @Patch('/:artId')
    async updateArt(ctx: Koa.Context) {
        const { artId } = ctx.params;
        const articleRepo: MongoRepository<ArticleEntity> = getMongoRepository(ArticleEntity);
        const tagRepo: MongoRepository<TagEntity> = getMongoRepository(TagEntity);
        try {
            const article: ArticleEntity = await articleRepo.findOne(artId);
            if (!article) {
                ctx.body = resReturn(null, 400, '文章不存在');
                return;
            }
            const updateData: ObjectLiteral = {};
            Object.entries(ctx.request.body).forEach(([k, v]) => {
                if (['title', 'keyword', 'content', 'descript', 'thumb',
                    'state', 'publish', 'type', 'tags'].includes(k)) {
                    updateData[k] = v;
                }
            });
            const updateArticle: ArticleEntity = articleRepo.merge(article, {
                ...updateData,
                state: +updateData.state,
                publish: +updateData.publish,
                type: +updateData.type,
                tags: updateData.tags.split(',')
            });
            const validateErr = await validate(updateArticle, { skipMissingProperties: true });
            if (validateErr.length) {
                ctx.body = resReturn(validateErr.map(e => e.constraints), 400, '文章更新失败');
                return;
            }
            await articleRepo.save(updateArticle);
            ctx.body = resReturn({
                ...updateArticle,
                tags: await tagRepo.findByIds(
                    article.tags.map((i: string) => new ObjectId(i))
                )
            });
        } catch (error) {
            log(error, 'error');
            ctx.body = resReturn(null, 500, '服务器内部错误');
        }
    }

    @Del('/:artId')
    async delArt(ctx: Koa.Context) {
        const { artId } = ctx.params;
        const articleRepo: MongoRepository<ArticleEntity> = getMongoRepository(ArticleEntity);
        try {
            const res = await articleRepo.findOne(artId);
            if (!res) {
                ctx.body = resReturn(null, 400, '文章不存在');
                return;
            }
            await articleRepo.remove(res);
            ctx.body = resReturn(null);
        } catch (err) {
            ctx.body = resReturn(null, 500, '服务器内部错误');
        }
    }
}
