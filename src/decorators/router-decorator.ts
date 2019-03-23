import * as Router from 'koa-router';

export enum RequestMethod {
    GET = 'get',
    POST = 'post'
}

type Method = RequestMethod;

export function Request({ url, method }: { url: string, method: Method}): MethodDecorator {
    return (target: any, handleFun: string, descriptor: PropertyDescriptor) => {
        if (!target['$route']) {
            target['$route'] = {};
        }
        if (!target.$route[method]) {
            target.$route[method] = {};
        }
        target.$route[method][url] = {
            url,
            handleFun
        };
    };
}

export function Controller(options: Router.IRouterOptions = {}): ClassDecorator {
    return target => {
        const router = new Router(options);
        Object.keys((<any>target).route).forEach(method => {
            Object.keys((<any>target).route[method]).forEach(url => {
                const route = (<any>target).route[method][url];
                (<any>router)[method](url, (<any>target)[route.handleFun]);
            });
        });
    };
}
