import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';

import { config } from '../config';

export interface ResponseBody {
    code: number,
    message: string,
    data: Object
}

export const resReturn = (data: Object, code: number = 0, message: string = '成功！') => ({
    code,
    message,
    data
});

export const log = (msg: any, type: 'log' | 'warn' | 'error' = 'log') => {
    const logFn: Function = console[type]; // log, warn, error

    logFn(`type: ${msg}`);

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const logFile = path.join(config.log, `${year}-${month}.log`);
    if (typeof msg === 'object') {
        if (msg instanceof Error) {
            msg = msg.message;
        } else {
            msg = JSON.stringify(msg);
        }
    }
    const data = `[ ${new Date().toLocaleString()} ] [ ${type} ] ${msg}\n`;

    fs.writeFileSync(logFile, data, { flag: 'a' });
};

export const time = () => Date.parse(new Date() as any) / 1000;

export const md5Decode = (pwd: string | Buffer | DataView) => crypto
    .createHash('md5')
    .update(pwd)
    .digest('hex');
