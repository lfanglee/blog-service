import * as Koa from 'koa';
import * as dotenv from 'dotenv';
import * as helmet from 'koa-helmet';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';

import * as mongodb from './utils/db';
import { config } from './config';

dotenv.config({ path: '.env' });

const app = new Koa();
const router = new Router();

mongodb.connect();

app.use(helmet());
app.use(bodyParser());

router.get('/*', async (ctx: Koa.Context) => {
    ctx.body = 'Hello, World!';
});

app.use(router.routes())
    .use(router.allowedMethods());

export default app;
