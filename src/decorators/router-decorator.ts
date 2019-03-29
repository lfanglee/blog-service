import * as Router from 'koa-router';
import * as Koa from 'koa';

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
    middlewares: Array<Koa.Middleware>,
    param: string,
    paramMiddleware: Router.IParamMiddleware,
    fn: Router.IMiddleware,
    methodName: string
}
export interface Routes {
    prefix?: string,
    RoutesList: Array<RouteItem>
    [key: string]: any
}

export function Request(
    { path, method, middlewares }: {
        path: string, method: Method, middlewares?: Array<Koa.Middleware>
    }
): MethodDecorator {
    return (target: any, key: string, descriptor: PropertyDescriptor) => {
        target[key]['$method'] = method;
        target[key]['$path'] = path;
        target[key]['$middlewares'] = middlewares;
    };
}

export function Param(param: string, middleware: Router.IParamMiddleware) {
    return (target: any, key: string, descriptor: PropertyDescriptor) => {
        target[key]['$param'] = param;
        target[key]['$paramMiddleware'] = middleware;
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
            const middlewares = fn['$middlewares'];
            const param = fn['$param'];
            const paramMiddleware = fn['$paramMiddleware'];
            return {
                route,
                method,
                middlewares,
                param,
                paramMiddleware,
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
    path: string, ...middlewares: Array<Koa.Middleware>
) => Request({ path, method: RequestMethod.GET, middlewares });

export const Post = (
    path: string, ...middlewares: Array<Koa.Middleware>
) => Request({ path, method: RequestMethod.POST, middlewares });

export const Put = (
    path: string, ...middlewares: Array<Koa.Middleware>
) => Request({ path, method: RequestMethod.PUT, middlewares });

export const Del = (
    path: string, ...middlewares: Array<Koa.Middleware>
) => Request({ path, method: RequestMethod.DEL, middlewares });

export const Patch = (
    path: string, ...middlewares: Array<Koa.Middleware>
) => Request({ path, method: RequestMethod.PATCH, middlewares });

export const Head = (
    path: string, ...middlewares: Array<Koa.Middleware>
) => Request({ path, method: RequestMethod.HEAD, middlewares });

export const Options = (
    path: string, ...middlewares: Array<Koa.Middleware>
) => Request({ path, method: RequestMethod.OPTIONS, middlewares });

export const All = (
    path: string, ...middlewares: Array<Koa.Middleware>
) => Request({ path, method: RequestMethod.ALL, middlewares });
