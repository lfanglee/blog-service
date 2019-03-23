import * as Router from 'koa-router';

import { mapRoute } from '../decorators/router-decorator';
import test from './test';

const router = new Router({
    prefix: '/api'
});

router.get('/ii', async (ctx) => {
    ctx.body = 'Hello, World!';
});

function createAction(actions: any) {
    const { prefix = '', myRoutes = [] } = actions;
    myRoutes.forEach((item: any) => {
        (<any>router)[item.method](`${prefix}${item.route}`, item.fn);
    });
    console.log(router);
}
console.log(mapRoute(test));
createAction(mapRoute(test));

export default router;
