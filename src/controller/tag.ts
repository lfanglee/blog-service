import * as Koa from 'koa';
import { getMongoRepository, MongoRepository, Repository } from 'typeorm';
import { ObjectID, ObjectId } from 'mongodb';
import { resReturn, log } from '../utils/index';
import tagEntity from '../entity/tag';
import {
    Controller, Get, Post, Del, Patch
} from '../decorators/router-decorator';

@Controller({ prefix: '/tag' })
export default class Tag {
    /**
     * 获取tags GET
     * @query pageSize 分页大小，默认取全部
     * @query pageNo 分页页数 默认为1
     */
    @Get('/')
    async getTags(ctx: Koa.Context) {
        const {
            pageSize = -1,
            pageNo = 1
        } = ctx.query;
        const tagRepo: MongoRepository<tagEntity> = getMongoRepository(tagEntity);
        try {
            const tagsTotal = await tagRepo.count();
            const tags = pageSize < 0 || pageNo <= 1
                ? await tagRepo.find()
                : await tagRepo.createEntityCursor()
                    .limit(+pageSize)
                    .skip(+pageSize * (+pageNo - 1))
                    .toArray();
            ctx.body = resReturn({
                tags,
                pagination: {
                    total: tagsTotal,
                    totalPage: pageSize >= 0 ? Math.ceil(tagsTotal / pageSize) : 1,
                    pageNo: pageNo > 1 ? pageNo : 1,
                    pageSize: pageSize >= 0 ? pageSize : -1,
                }
            });
        } catch (error) {
            ctx.body = resReturn(null, 500, '服务器内部错误');
        }
    }

    /**
     * 添加标签 POST
     * @body name 标签名
     * @body descript 标签描述
     */
    @Post('/')
    async addTag(ctx: Koa.Context) {
        const { name, descript } = ctx.request.body;
        const tagRepo: MongoRepository<tagEntity> = getMongoRepository(tagEntity);
        const res = await tagRepo.find({ name });
        if (res && res.length !== 0) {
            ctx.body = resReturn(null, 400, '已存在相同标签名');
            return;
        }
        const tag = tagRepo.create({ name, descript });
        try {
            await tagRepo.save(tag);
            ctx.body = resReturn(tag);
        } catch (err) {
            ctx.body = resReturn(null, 500, '发布标签失败');
        }
    }

    /**
     * 安给定的顺序对标签排序
     * @param ids 排序的ID数组
     */
    @Patch('/rank')
    async rankTag(ctx: Koa.Context) {
        const { ids } = ctx.request.body;
        const tagRepo: MongoRepository<tagEntity> = getMongoRepository(tagEntity);
        try {
            for (let i = 0, len = ids.length; i < len; i++) {
                await tagRepo.findOneAndUpdate(
                    { _id: new ObjectId(ids[i]) },
                    { $set: { sort: i + 1 } },
                    { upsert: false }
                ).catch(err => ctx.throw(500, '服务器内部错误'));
            }
            ctx.body = resReturn(null);
        } catch (err) {
            log(err, 'error');
            ctx.body = resReturn(null, 500, '服务器内部错误');
        }
    }

    /**
     * 更新标签
     * @param tagId 标签_id
     * @body name 标签名
     * @body descript 标签描述
     */
    @Patch('/:tagId', 'tagId', (tagId, ctx, next) => {
        if (tagId === 'rank') {
            ctx.status = 404;
            return;
        }
        next();
    })
    async updateTag(ctx: Koa.Context) {
        const { tagId } = ctx.params;
        const { name, descript } = ctx.request.body;
        const tagRepo: MongoRepository<tagEntity> = getMongoRepository(tagEntity);
        try {
            const tag = await tagRepo.findOne(tagId);
            if (!tag) {
                ctx.body = resReturn(null, 400, '标签不存在');
            }
            const newTag = tagRepo.merge(tag, { name, descript });
            await tagRepo.save(newTag);
            // const updateTag = await tagRepo.findOneAndUpdate(
            //     { _id: new ObjectID(tagId) },
            //     { $set: { name, descript } },
            //     { upsert: false, returnOriginal: false }
            // );
            ctx.body = resReturn(newTag);
        } catch (error) {
            log(error, 'error');
            ctx.body = resReturn(null, 500, '服务器内部错误');
        }
    }

    /**
     * 删除标签
     * @param tagId 标签_id
     */
    @Del('/:tagId')
    async delTag(ctx: Koa.Context) {
        const { tagId } = ctx.params;
        if (!tagId) {
            ctx.body = resReturn(null, 400, '无效参数');
            return;
        }
        const resRepo: MongoRepository<tagEntity> = getMongoRepository(tagEntity);
        try {
            const res = await resRepo.findOne(tagId);
            if (!res) {
                ctx.body = resReturn(null, 400, '标签不存在');
                return;
            }
            await resRepo.remove(res);
            ctx.body = resReturn(null);
        } catch (err) {
            ctx.body = resReturn(null, 500, '服务器内部错误');
        }
    }
}
