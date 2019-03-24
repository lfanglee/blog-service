import * as Koa from 'koa';
import { getRepository, Repository } from 'typeorm';
import testEntity from '../entity/test';
import {
    Controller, Get, Post, Del
} from '../decorators/router-decorator';

@Controller({ prefix: '/test' })
export default class Test {
    @Get('/')
    async allTest(ctx: Koa.Context) {
        const testRepo: Repository<testEntity> = getRepository(testEntity);
        const test = await testRepo.find();
        ctx.body = {
            data: test
        };
    }

    @Get('/:testId')
    async testItem(ctx: Koa.Context) {
        const testRepo: Repository<testEntity> = getRepository(testEntity);
        const test = await testRepo.findOne(ctx.params.testId);
        if (!test) {
            ctx.status = 404;
            return;
        }
        ctx.body = {
            data: test
        };
    }

    @Post('/')
    async addTest(ctx: Koa.Context) {
        const testRepo: Repository<testEntity> = getRepository(testEntity);
        const test = testRepo.create(ctx.request.body);
        await testRepo.save(test);
        ctx.body = {
            data: test
        };
    }

    @Del('/:testId')
    async delTest(ctx: Koa.Context) {
        const testRepo: Repository<testEntity> = getRepository(testEntity);
        const test = await testRepo.findOne(ctx.params.testId);
        await testRepo.remove(test);
        ctx.body = {
            data: test
        };
    }
}
