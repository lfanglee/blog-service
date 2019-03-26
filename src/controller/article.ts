import * as Koa from 'koa';
import { MongoRepository, getMongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import articleEntity from '../entity/article';
import tagEntity from '../entity/tag';
import {
    Controller, Get, All, Post
} from '../decorators/router-decorator';
import { resReturn, log } from '../utils/index';

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

        pageNo < 1 && (pageNo = 1);
        if (pageSize <= 0) {
            pageSize = -1;
            pageNo = 1;
        }

        const articleRepo: MongoRepository<articleEntity> = getMongoRepository(articleEntity);
        try {
            const total = await articleRepo.count();
            const arts = pageSize === -1
                ? await articleRepo.find()
                : await articleRepo.createEntityCursor()
                    .skip((pageNo - 1) * pageSize)
                    .limit(pageSize);
            ctx.body = resReturn({
                list: arts,
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
    @Get('/:artId')
    async getArt(ctx: Koa.Context) {
        const { artId } = ctx.params;
        const articleRepo: MongoRepository<articleEntity> = getMongoRepository(articleEntity);
        try {
            const art = await articleRepo.find(artId);
            if (!art) {
                ctx.body = resReturn(null, 400, '文章不存在');
            }
            ctx.body = resReturn(art);
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
        const tagRepo: MongoRepository<tagEntity> = getMongoRepository(tagEntity);
        try {
            const tagsList: tagEntity[] = await tagRepo.findByIds(
                tags.map((i: string) => new ObjectId(i))
            );
            const article: articleEntity = articleRepo.create({
                title,
                keyword,
                descript,
                content,
                thumb,
                state,
                publish,
                type,
                meta: {
                    views: 0, comments: 0, likes: 0
                }
            });
            article.tag = tagsList;

            await articleRepo.save(article);
            ctx.body = resReturn(article);
        } catch (error) {
            log(error, 'error');
            ctx.body = resReturn(null, 500, '服务器内部错误');
        }
    }
}
