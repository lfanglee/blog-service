import * as Koa from 'koa';
import * as dotenv from 'dotenv';
import * as helmet from 'koa-helmet';
import * as bodyParser from 'koa-bodyparser';
import 'reflect-metadata';

import connection from './utils/db';
import router from './controller';
import { config } from './config';

dotenv.config({ path: '.env' });

const app: Koa = new Koa();

connection.then(() => {});

app.use(helmet());
app.use(bodyParser());

app.use(router.routes())
    .use(router.allowedMethods());

export default app;
