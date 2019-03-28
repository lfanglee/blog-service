import * as Koa from 'koa';
import * as dotenv from 'dotenv';
import * as helmet from 'koa-helmet';
import * as bodyParser from 'koa-bodyparser';
import 'reflect-metadata';

import connect from './utils/db';
import router from './controller';
import { log, resReturn } from './utils/index';

import interceptor from './middlewares/interceptor';
import Auth from './controller/auth';

dotenv.config({ path: '.env' });

const app: Koa = new Koa();

connect(); // connect database

// middlewares
app.use(interceptor);
app.use(Auth.initAdmin);

app.use(helmet());
app.use(bodyParser());

// record request
app.use(async (ctx: Koa.Context, next) => {
    await next();
    log(`${ctx.method} ${ctx.url}`);
});

app.use(async (ctx: Koa.Context, next) => {
    try {
        await next();
    } catch (error) {
        log(error, 'error');
        ctx.body = resReturn(null, 500, '服务器内部错误');
    }
    if ([400, 404, 405].includes(ctx.status)) {
        ctx.body = resReturn(null, ctx.status, '无效的请求');
    }
});

app.use(router.routes())
    .use(router.allowedMethods());

export default app;
