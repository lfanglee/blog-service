import * as Koa from 'koa';
import { MongoRepository, getMongoRepository, ObjectLiteral } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Validator, validate } from 'class-validator';
import articleEntity from '../entity/article';
import tagEntity from '../entity/tag';
import {
    Controller, Get, Post, Patch, Del
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

        const articleRepo: MongoRepository<articleEntity> = getMongoRepository(articleEntity);
        const tagRepo: MongoRepository<tagEntity> = getMongoRepository(tagEntity);
        try {
            const total: number = await articleRepo.count();
            const arts: articleEntity[] = pageSize === -1
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
     * 获取文章详情
     * @param artId 文章ID
     */
    @Get('/:artId', 'artId', (artId, ctx, next) => {
        if (!validator.isMongoId(artId)) {
            ctx.status = 404;
            return;
        }
        return next();
    })
    async getArt(ctx: Koa.Context) {
        const { artId } = ctx.params;
        const articleRepo: MongoRepository<articleEntity> = getMongoRepository(articleEntity);
        const tagRepo: MongoRepository<tagEntity> = getMongoRepository(tagEntity);
        try {
            const art = await articleRepo.findOne(artId);
            if (!art) {
                ctx.body = resReturn(null, 400, '文章不存在');
                return;
            }
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
        const articleRepo: MongoRepository<articleEntity> = getMongoRepository(articleEntity);
        try {
            const article: articleEntity = articleRepo.create({
                title,
                keyword,
                descript,
                content,
                thumb,
                state,
                publish,
                type,
                tags,
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
            ctx.body = resReturn(article);
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
        const articleRepo: MongoRepository<articleEntity> = getMongoRepository(articleEntity);
        try {
            const article: articleEntity = await articleRepo.findOne(artId);
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
            const updateArticle: articleEntity = articleRepo.merge(article, updateData);
            const validateErr = await validate(updateArticle, { skipMissingProperties: true });
            if (validateErr.length) {
                ctx.body = resReturn(validateErr.map(e => e.constraints), 400, '文章更新失败');
                return;
            }
            await articleRepo.save(updateArticle);
            ctx.body = resReturn(updateArticle);
        } catch (error) {
            log(error, 'error');
            ctx.body = resReturn(null, 500, '服务器内部错误');
        }
    }

    @Del('/:artId')
    async delArt(ctx: Koa.Context) {
        const { artId } = ctx.params;
        const articleRepo: MongoRepository<articleEntity> = getMongoRepository(articleEntity);
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
