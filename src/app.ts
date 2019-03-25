import * as Koa from 'koa';
import * as dotenv from 'dotenv';
import * as helmet from 'koa-helmet';
import * as bodyParser from 'koa-bodyparser';
import 'reflect-metadata';

import connect from './utils/db';
import router from './controller';
import { log } from './utils/index';
import { config } from './config';

dotenv.config({ path: '.env' });

const app: Koa = new Koa();

connect();

app.use(helmet());
app.use(bodyParser());

app.use(async (ctx: Koa.Context, next) => {
    await next();
    log(`${ctx.method} ${ctx.url}`);
})

app.use(router.routes())
    .use(router.allowedMethods());

export default app;
