import * as Router from 'koa-router';

import { mapRoute, RouteItem, Routes } from '../decorators/router-decorator';
import Auth from './auth';
import Article from './article';
import Tag from './tag';
import File from './file';

const router = new Router({
    prefix: '/api'
});

class Controller {
    router: Router = router

    routes: Array<any> = [Auth, Article, Tag, File]

    constructor() {
        this.init();
    }

    init() {
        this.routes.forEach((routes: Routes) => {
            this.createAction(mapRoute(routes));
        });
    }

    createAction(actions: Routes) {
        const { prefix = '', RoutesList = [] } = actions;
        RoutesList.forEach((item: RouteItem) => {
            item.param && this.router.param(item.param, item.paramMiddleware);
            item.middlewares.length
                ? this.router[item.method](`${prefix}${item.route}`, ...item.middlewares, item.fn)
                : this.router[item.method](`${prefix}${item.route}`, item.fn);
        });
    }
}

export default new Controller().router;
