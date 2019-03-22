import * as fs from 'fs';
import * as path from 'path';

import { config } from '../config';

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
