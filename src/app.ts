import * as Koa from 'koa';
import * as dotenv from 'dotenv';
import * as helmet from 'koa-helmet';
import * as bodyParser from 'koa-bodyparser';

import * as mongodb from './utils/db';
import router from './controller';
import { config } from './config';

dotenv.config({ path: '.env' });

const app = new Koa();

mongodb.connect();

app.use(helmet());
app.use(bodyParser());

app.use(router.routes())
    .use(router.allowedMethods());

export default app;
