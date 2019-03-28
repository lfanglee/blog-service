import * as Koa from 'koa';
import { ObjectLiteral } from 'typeorm';
import Auth from '../utils/auth';

export default async (ctx: Koa.Context, next: () => Promise<any>) => {
    const whiteList: ObjectLiteral = {
        '/api/login': { url: '/api/login', method: 'POST' }
    };

    const isInWhiteList = () => Reflect.has(whiteList, ctx.request.url)
        && whiteList[ctx.request.url].method === ctx.request.method;

    if (!isInWhiteList() && !Object.is(ctx.request.method, 'GET') && !Auth.verified(ctx.request)) {
        ctx.throw(401, '非管理员禁止访问');
    }

    await next();
};
