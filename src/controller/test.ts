import { BaseContext } from 'koa';
import { Request, Controller, RequestMethod } from '../decorators/router-decorator';

@Controller({ prefix: '/api/test' })
export default class Test {
    @Request({ url: '/a', method: RequestMethod.GET })
    async hello(ctx: BaseContext) {
        ctx.body = 'Hello, World';
    }
}
