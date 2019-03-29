import * as Koa from 'koa';
import { getMongoRepository, MongoRepository, Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Validator, validate } from 'class-validator';
import { resReturn, log } from '../utils/index';
import tagEntity from '../entity/tag';
import {
    Controller, Get, Post, Del, Patch, Param
} from '../decorators/router-decorator';

const validator = new Validator();

@Controller({ prefix: '/tag' })
export default class Tag {
    /**
     * 获取tags GET
     * @query pageSize 分页大小，默认取全部
     * @query pageNo 分页页数 默认为1
     */
    @Get('/')
    async getTags(ctx: Koa.Context) {
        let {
            pageSize = -1,
            pageNo = 1
        } = ctx.query;

        if (!validator.isInt(+pageNo) || !validator.min(pageNo, 1)) {
            pageNo = 1;
        }
        if (!validator.isInt(+pageSize) || !validator.min(pageSize, 1)) {
            pageSize = -1;
        }

        const tagRepo: MongoRepository<tagEntity> = getMongoRepository(tagEntity);
        try {
            const tagsTotal = await tagRepo.count();
            const tags = pageSize === -1
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
                    pageNo,
                    pageSize
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
        try {
            const res = await tagRepo.find({ name });
            if (res && res.length !== 0) {
                ctx.body = resReturn(null, 400, '已存在相同标签名');
                return;
            }
            const tag = tagRepo.create({ name, descript });
            const ValidateErr = await validate(tag, { skipMissingProperties: true });
            if (ValidateErr.length) {
                ctx.body = resReturn(ValidateErr.map(e => e.constraints), 400, '发布标签失败');
                return;
            }
            await tagRepo.save(tag);
            ctx.body = resReturn(tag);
        } catch (err) {
            ctx.body = resReturn(null, 500, '发布标签失败');
        }
    }

    /**
     * 按照给定的顺序对标签排序
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
                ).catch(err => {
                    log(err, 'error');
                    ctx.throw(500, '服务器内部错误');
                });
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
    @Patch('/:tagId')
    @Param('tagId', (tagId, ctx, next) => {
        if (!validator.isMongoId(tagId)) {
            ctx.status = 404;
            return;
        }
        return next();
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
            const validateErr = await validate(newTag, { skipMissingProperties: true });
            if (validateErr.length) {
                ctx.body = resReturn(validateErr.map(e => e.constraints), 400, '更新标签失败');
                return;
            }
            await tagRepo.save(newTag);
            // 以下更新方法不会触发typeorm 的 updateDate 装饰器
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
