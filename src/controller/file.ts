import * as Koa from 'koa';
import * as multer from 'koa-multer';
import * as fs from 'fs';
import { Controller, Post } from '../decorators/router-decorator';
import { resReturn } from '../utils/index';

const storage = multer.diskStorage({
    destination(ctx, file, cb) {
        cb(null, `uploads/${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`);
    },
    filename(ctx, file, cb) {
        const fileNameArr = file.originalname.split('.');
        cb(null, `${Date.now()}.${fileNameArr[fileNameArr.length - 1]}`);
    }
});
const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 10
    },
    fileFilter(ctx, file, cb) {
        // cb(null, false) for file not accepted
        cb(null, true);
    }
});

@Controller({ prefix: '/upload' })
export default class File {
    @Post('/', async (ctx: Koa.Context, next) => {
        const path = `uploads/${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
        await next();
    }, upload.single('file'))
    async uploadFile(ctx: Koa.Context) {
        ctx.body = resReturn((<any>ctx.req).file.path);
    }
}
