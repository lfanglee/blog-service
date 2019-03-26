import * as Router from 'koa-router';

export enum RequestMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DEL = 'del',
    PATCH = 'patch',
    HEAD = 'head',
    OPTIONS = 'options',
    ALL = 'all'
}

type Method = RequestMethod;

export interface RouteItem {
    route: string,
    method: Method,
    param: string,
    middleware: Router.IParamMiddleware,
    fn: Router.IMiddleware,
    methodName: string
}
export interface Routes {
    prefix?: string,
    RoutesList: Array<RouteItem>
    [key: string]: any
}

export function Request(
    {
        path, method, param, middleware
    }: { path: string, method: Method, param?: string, middleware?: Router.IParamMiddleware }
): MethodDecorator {
    return (target: any, key: string, descriptor: PropertyDescriptor) => {
        target[key]['$method'] = method;
        target[key]['$path'] = path;
        target[key]['$param'] = param;
        target[key]['$middleware'] = middleware;
    };
}

export function Controller(options: Router.IRouterOptions = {}): ClassDecorator {
    return (target: any) => {
        target['$routerOpts'] = options;
    };
}

export function mapRoute(target: any): Routes {
    const options = target['$routerOpts'];
    const prototype = Object.getPrototypeOf(new target());
    const RoutesList = Object.getOwnPropertyNames(prototype)
        .filter(item => item !== 'constructor' && prototype[item] instanceof Function)
        .map(methodName => {
            const fn = prototype[methodName];
            const route = fn['$path'];
            const method = fn['$method'];
            const param = fn['$param'];
            const middleware = fn['$middleware'];
            return {
                route,
                method,
                param,
                middleware,
                fn,
                methodName
            };
        });
    return {
        ...options,
        RoutesList
    };
}

export const Get = (
    path: string, param?: string, middleware?: Router.IParamMiddleware
) => Request({
    path, method: RequestMethod.GET, param, middleware
});

export const Post = (
    path: string, param?: string, middleware?: Router.IParamMiddleware
) => Request({
    path, method: RequestMethod.POST, param, middleware
});

export const Put = (
    path: string, param?: string, middleware?: Router.IParamMiddleware
) => Request({
    path, method: RequestMethod.PUT, param, middleware
});

export const Del = (
    path: string, param?: string, middleware?: Router.IParamMiddleware
) => Request({
    path, method: RequestMethod.DEL, param, middleware
});

export const Patch = (
    path: string, param?: string, middleware?: Router.IParamMiddleware
) => Request({
    path, method: RequestMethod.PATCH, param, middleware
});

export const Head = (
    path: string, param?: string, middleware?: Router.IParamMiddleware
) => Request({
    path, method: RequestMethod.HEAD, param, middleware
});

export const Options = (
    path: string, param?: string, middleware?: Router.IParamMiddleware
) => Request({
    path, method: RequestMethod.OPTIONS, param, middleware
});

export const All = (
    path: string, param?: string, middleware?: Router.IParamMiddleware
) => Request({
    path, method: RequestMethod.ALL, param, middleware
});
