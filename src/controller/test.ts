import * as Koa from 'koa';
import { getMongoRepository, MongoRepository } from 'typeorm';
import { resReturn } from '../utils/index';
import testEntity from '../entity/test';
import {
    Controller, Get, Post, Del, Patch
} from '../decorators/router-decorator';

@Controller({ prefix: '/test' })
export default class Test {
    @Get('/')
    async getAllTest(ctx: Koa.Context) {
        const testRepo: MongoRepository<testEntity> = getMongoRepository(testEntity);
        const test = await testRepo.find();
        ctx.body = resReturn(test);
    }

    @Get('/count')
    async countTest(ctx: Koa.Context) {
        const testRepo: MongoRepository<testEntity> = getMongoRepository(testEntity);

        ctx.body = resReturn(await testRepo.find({ skip: 1, take: 2 }));
    }

    @Get('/:testId')
    async getTestItem(ctx: Koa.Context) {
        const testRepo: MongoRepository<testEntity> = getMongoRepository(testEntity);
        const test = await testRepo.findOne(ctx.params.testId);
        if (!test) {
            ctx.body = resReturn(null, 0, '获取的test不存在');
            return;
        }
        ctx.body = resReturn(test);
    }

    @Post('/')
    async addTest(ctx: Koa.Context) {
        const testRepo: MongoRepository<testEntity> = getMongoRepository(testEntity);
        const test = testRepo.create(ctx.request.body);
        await testRepo.save(test);
        ctx.body = resReturn(test);
    }

    @Del('/:testId')
    async delTest(ctx: Koa.Context) {
        const testRepo: MongoRepository<testEntity> = getMongoRepository(testEntity);
        const test = await testRepo.findOne(ctx.params.testId);
        if (!test) {
            ctx.body = resReturn(null, 0, '删除的test不存在');
            return;
        }
        await testRepo.remove(test);
        ctx.body = resReturn(test);
    }

    @Patch('/:testId')
    async updateTest(ctx: Koa.Context) {
        const testRepo: MongoRepository<testEntity> = getMongoRepository(testEntity);
        const test = await testRepo.findOne(ctx.params.testId);
        if (!test) {
            ctx.body = resReturn(null, 0, '更新的test不存在');
            return;
        }
        const updateTest = testRepo.merge(test, ctx.request.body);
        await testRepo.save(updateTest);
        ctx.body = resReturn(updateTest);
    }
}
