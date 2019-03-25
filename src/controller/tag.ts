import * as Koa from 'koa';
import { getMongoRepository, MongoRepository } from 'typeorm';
import { resReturn } from '../utils/index';
import tagEntity from '../entity/tag';
import {
    Controller, Get, Post, Del, Patch
} from '../decorators/router-decorator';

@Controller({ prefix: '/tag' })
export default class Tag {
    @Get('/')
    async getTags(ctx: Koa.Context) {
        const {
            pageSize = -1,
            pageNo = 1
        } = ctx.query;
        const tagRepo: MongoRepository<tagEntity> = getMongoRepository(tagEntity);
        const tags = pageSize < 0 || pageNo < 1
            ? await tagRepo.find()
            : await tagRepo.createCursor({})
                .limit(+pageSize)
                .skip(+pageSize * (+pageNo - 1))
                .toArray();
        ctx.body = resReturn(tags);
    }

    @Post('/')
    async addTag(ctx: Koa.Context) {
        const { name, descript } = ctx.request.body;
        const tagRepo: MongoRepository<tagEntity> = getMongoRepository(tagEntity);
        const res = await tagRepo.find({ name });
        if (res && res.length !== 0) {
            ctx.body = resReturn(null, 0, '已存在相同标签名');
            return;
        }
        const tag = tagRepo.create({ name, descript });
        try {
            await tagRepo.save(tag);
            ctx.body = resReturn(tag);
        } catch (err) {
            ctx.body = resReturn(null, 0, '发布标签失败');
        }
    }

    @Patch('/:tagId')
    async updateTag(ctx: Koa.Context) {
        const { tagId } = ctx.params;
        const { name, descript } = ctx.request.body;
        const tagRepo: MongoRepository<tagEntity> = getMongoRepository(tagEntity);
        try {
            const tag = await tagRepo.findOne(tagId);
            if (!tag) {
                ctx.body = resReturn(null, 0, '标签不存在');
            }
            const updateTag = tagRepo.merge(tag, { name, descript });
            await tagRepo.save(updateTag);
            ctx.body = resReturn(updateTag);
        } catch (error) {
            ctx.body = resReturn(null, 0, '服务器内部错误');
        }
    }

    @Del('/:tagId')
    async delTag(ctx: Koa.Context) {
        const { tagId } = ctx.params;
        if (!tagId) {
            ctx.body = resReturn(null, 0, '无效参数');
            return;
        }
        const resRepo: MongoRepository<tagEntity> = getMongoRepository(tagEntity);
        try {
            const res = await resRepo.findOne(tagId);
            if (!res) {
                ctx.body = resReturn(null, 0, '标签不存在');
                return;
            }
            await resRepo.remove(res);
            ctx.body = resReturn(res);
        } catch (err) {
            ctx.body = resReturn(null, 0, '服务器内部错误');
        }
    }
}
