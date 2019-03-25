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
    fn: Router.IMiddleware,
    methodName: string
}
export interface Routes {
    prefix?: string,
    RoutesList: Array<RouteItem>
    [key: string]: any
}

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

export function mapRoute(target: any): Routes {
    const options = target['$routerOpts'];
    const prototype = Object.getPrototypeOf(new target());
    const RoutesList = Object.getOwnPropertyNames(prototype)
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
        RoutesList
    };
}

export const Get = (path: string) => Request({ path, method: RequestMethod.GET });

export const Post = (path: string) => Request({ path, method: RequestMethod.POST });

export const Put = (path: string) => Request({ path, method: RequestMethod.PUT });

export const Del = (path: string) => Request({ path, method: RequestMethod.DEL });

export const Patch = (path: string) => Request({ path, method: RequestMethod.PATCH });

export const Head = (path: string) => Request({ path, method: RequestMethod.HEAD });

export const Options = (path: string) => Request({ path, method: RequestMethod.OPTIONS });

export const All = (path: string) => Request({ path, method: RequestMethod.ALL });
