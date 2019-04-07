import * as Koa from 'koa';
import * as dotenv from 'dotenv';
import * as helmet from 'koa-helmet';
import * as bodyParser from 'koa-bodyparser';
import * as serve from 'koa-static';
import * as mount from 'koa-mount';
import * as path from 'path';
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
app.use(mount('/uploads', serve(path.join(__dirname, '../uploads'))));
app.use(bodyParser());

// record request
app.use(async (ctx: Koa.Context, next) => {
    await next();
    if (!ctx.url.startsWith('/api')) {
        return;
    }
    log(`${ctx.method} ${ctx.url}`);
});

app.use(async (ctx: Koa.Context, next) => {
    try {
        await next();
    } catch (error) {
        log(error, 'error');
        ctx.body = resReturn(null, 500, '服务器内部错误');
    }
    if (/^4\d{2}$/.test(ctx.status.toString())) {
        ctx.body = resReturn(null, ctx.status, '无效的请求');
    }
});

app.use(router.routes())
    .use(router.allowedMethods());

export default app;
