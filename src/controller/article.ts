import * as Koa from 'koa';
import {
    Controller, Get, All
} from '../decorators/router-decorator';

@Controller({ prefix: '/article' })
export default class Article {
    @Get('/a')
    async hello(ctx: Koa.Context) {
        ctx.body = 'Hello, World';
    }

    @Get('/c')
    async c(ctx: Koa.Context) {
        ctx.body = 'c';
    }

    @All('/c')
    async test(ctx: Koa.Context) {
        ctx.body = 'b';
    }
}
