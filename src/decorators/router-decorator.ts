import * as Router from 'koa-router';

export enum RequestMethod {
    GET = 'get',
    POST = 'post'
}

type Method = RequestMethod;

export function Request({ path, method }: { path: string, method: Method}): MethodDecorator {
    return (target: any, key: string, descriptor: PropertyDescriptor) => {
        target[key]['$method'] = method;
        target[key]['$path'] = path;
    };
}

export function Controller(options: Router.IRouterOptions = {}): ClassDecorator {
    return (target: any) => {
        target['$routerOpts'] = options;
    };
}

export function mapRoute(target: any) {
    const options = target['$routerOpts'];
    const prototype = Object.getPrototypeOf(new target());
    const myRoutes = Object.getOwnPropertyNames(prototype)
        .filter(item => item !== 'constructor' && prototype[item] instanceof Function)
        .map(methodName => {
            const fn = prototype[methodName];
            const route = fn['$path'];
            const method = fn['$method'];
            return {
                route,
                method,
                fn,
                methodName
            };
        });
    return {
        ...options,
        myRoutes
    };
}
