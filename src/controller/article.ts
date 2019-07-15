import * as Koa from 'koa';
import { MongoRepository, getMongoRepository, ObjectLiteral } from 'typeorm';
import { Validator, validate } from 'class-validator';
import models from '../models';
import ArticleModel from '../models/article';
import TagModel from '../models/tag';
import ArticleEntity from '../entity/article';
import {
    Controller, Get, Post, Patch, Del, Param
} from '../decorators/router-decorator';
import { resReturn, log } from '../utils/index';

const validator = new Validator();

@Controller({ prefix: '/article' })
export default class Article {
    model: ArticleModel = models.getInstance<ArticleModel>(ArticleModel);

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
        pageNo = +pageNo;
        pageSize = +pageSize;

        if (!validator.isInt(pageNo) || !validator.min(pageNo, 1)) {
            pageNo = 1;
        }
        if (!validator.isInt(pageSize) || !validator.min(pageSize, 1)) {
            pageSize = -1;
        }

        const tagInst: TagModel = models.getInstance<TagModel>(TagModel);
        try {
            const total: number = await this.model.count();
            const arts: ArticleEntity[] = pageSize === -1
                ? await this.model.findAll()
                : await this.model.findAllWithPaging(pageNo - 1, pageSize);

            ctx.body = resReturn({
                list: await Promise.all(arts.map(async (art: any) => {
                    art.tags && art.tags.length && (art.tags = await tagInst.findByIds(art.tags));
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
        try {
            const articles = await this.model.timeline();
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
        const tagInst: TagModel = models.getInstance<TagModel>(TagModel);
        try {
            const art = await this.model.findById(artId);
            if (!art) {
                ctx.body = resReturn(null, 400, '文章不存在');
                return;
            }
            art.meta.views++;
            await this.model.save(art);
            ctx.body = resReturn({
                ...art,
                tags: (art.tags && art.tags.length)
                    ? await tagInst.findByIds(art.tags)
                    : []
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
        const tagInst: TagModel = models.getInstance<TagModel>(TagModel);
        try {
            const article: ArticleEntity = articleRepo.create({
                title,
                keyword,
                descript,
                content,
                thumb,
                state: +state,
                publish: +publish,
                type: +type,
                tags: tags ? tags.split(',') : [],
                meta: {
                    views: 0, comments: 0, likes: 0
                }
            });
            const validateErr = await validate(article, { skipMissingProperties: true });
            if (validateErr.length) {
                ctx.body = resReturn(validateErr.map(e => e.constraints), 400, '文章发布失败');
                return;
            }
            await this.model.save(article);
            ctx.body = resReturn({
                ...article,
                tags: await tagInst.findByIds(article.tags)
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
        const tagInst: TagModel = models.getInstance<TagModel>(TagModel);
        try {
            const article: ArticleEntity = await this.model.findById(artId);
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
                state: +updateData.state || article.state || 1,
                publish: +updateData.publish || article.publish || 1,
                type: +updateData.type || article.type || 1,
                tags: updateData.tags ? updateData.tags.split(',') : []
            });
            const validateErr = await validate(updateArticle, { skipMissingProperties: true });
            if (validateErr.length) {
                ctx.body = resReturn(validateErr.map(e => e.constraints), 400, '文章更新失败');
                return;
            }
            await this.model.save(updateArticle);
            ctx.body = resReturn({
                ...updateArticle,
                tags: await tagInst.findByIds(article.tags)
            });
        } catch (error) {
            log(error, 'error');
            ctx.body = resReturn(null, 500, '服务器内部错误');
        }
    }

    @Del('/:artId')
    async delArt(ctx: Koa.Context) {
        const { artId } = ctx.params;
        try {
            const res = await this.model.findById(artId);
            if (!res) {
                ctx.body = resReturn(null, 400, '文章不存在');
                return;
            }
            await this.model.delete(artId);
            ctx.body = resReturn(null);
        } catch (err) {
            ctx.body = resReturn(null, 500, '服务器内部错误');
        }
    }
}
