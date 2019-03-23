import { BaseContext } from 'koa';
import { Request, Controller, RequestMethod } from '../decorators/router-decorator';

@Controller({ prefix: '/test' })
export default class Test {
    @Request({ path: '/a', method: RequestMethod.GET })
    async hello(ctx: BaseContext) {
        ctx.body = 'Hello, World';
    }

    @Request({ path: '/b', method: RequestMethod.POST })
    async test(ctx: BaseContext) {
        ctx.body = 'b';
    }
}
