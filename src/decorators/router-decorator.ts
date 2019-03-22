import * as KoaRouter from 'koa-router';

type Method = 'get' | 'post';

export const RequestMethod = {
    GET: 'get',
    POST: 'post'
};

export function Request({ url: string, method: Method }) {
    return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
        const fn = descriptor.value;
        descriptor.value = (router) => {
            router[method](url, async (ctx, next) => {
                await fn(ctx, next);
            });
        };
    };
}

export function Controller({ prefix: string }) {
    const router = new KoaRouter();
    if (prefix) {
        router.prefix(prefix);
    }
    return (target) => {
        const reqList = Object.getOwnPropertyDescriptors(target.prototype);
        Object.entries(reqList).forEach(([k, v]) => {
            if (k !== 'constructor') {
                v(router);
            }
        });
        return router;
    }
}
