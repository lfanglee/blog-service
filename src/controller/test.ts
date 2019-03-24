import * as Koa from 'koa';
import { Controller, Get, Post } from '../decorators/router-decorator';

@Controller({ prefix: '/test' })
export default class Test {
    @Get('/a')
    async hello(ctx: Koa.Context) {
        ctx.body = 'Hello, World';
    }

    @Post('/b')
    async test(ctx: Koa.Context) {
        ctx.body = 'b';
    }
}
