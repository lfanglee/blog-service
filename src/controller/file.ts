import * as Koa from 'koa';
import * as multer from 'koa-multer';
import * as fs from 'fs';
import { getMongoRepository } from 'typeorm';
import { validate, Validator } from 'class-validator';
import { Controller, Post, Get } from '../decorators/router-decorator';
import { resReturn, log } from '../utils/index';
import models from '../models';
import FileModel from '../models/files';
import FileEntity from '../entity/files';

const validator = new Validator();

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
    model: FileModel = models.getInstance<FileModel>(FileModel);

    @Get('/')
    async getUploadFileList(ctx: Koa.Context) {
        let {
            pageNo = 1,
            pageSize = 10
        } = ctx.query;
        pageNo = +pageNo;
        pageSize = +pageSize;

        if (!validator.isInt(pageNo) || !validator.min(pageNo, 1)) {
            pageNo = 1;
        }
        if (!validator.isInt(pageSize) || !validator.min(pageSize, 1)) {
            pageSize = -1;
        }

        try {
            const files: [FileEntity[], number] = pageSize === -1
                ? await this.model.findAndCount(0, Infinity)
                : await this.model.findAndCount(pageNo - 1, pageSize);

            ctx.body = resReturn({
                list: files[0],
                pagination: {
                    total: files[1],
                    totalPage: pageSize === -1 ? 1 : Math.ceil(files[1] / pageSize),
                    pageNo,
                    pageSize
                }
            });
        } catch (error) {
            log(error, 'error');
            ctx.body = resReturn(null, 500, '服务器内部错误');
        }
    }

    @Post('/', async (ctx: Koa.Context, next) => {
        const path = `uploads/${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
        await next();
    }, upload.single('file'))
    async uploadFile(ctx: Koa.Context) {
        const {
            originalname, filename, path, size
        } = (<any>ctx.req).file;
        const fileRepo = getMongoRepository<FileEntity>(FileEntity);
        try {
            const file = fileRepo.create({
                originName: originalname,
                savedName: filename,
                path,
                size
            });
            const validateErr = await validate(file, { skipMissingProperties: true });
            if (validateErr.length) {
                ctx.body = resReturn(validateErr.map(e => e.constraints), 400, '上传文件失败失败');
                return;
            }
            await this.model.save(file);
            ctx.body = resReturn(file);
        } catch (error) {
            log(error, 'error');
            ctx.body = resReturn(null, 500, '服务器内部错误');
        }
    }
}
