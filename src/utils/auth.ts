import * as jwt from 'jsonwebtoken';
import * as Koa from 'koa';

import { config } from '../config';

export default class Auth {
    static authToken(ctx: Koa.Request) {
        if (ctx.headers && ctx.headers.authorization) {
            const authInfo = ctx.headers.authorization.split(' ');
            if (authInfo.length === 2 && authInfo[0] === 'TOKEN') {
                return authInfo[1];
            }
        }
        return false;
    }

    static verified(ctx: Koa.Request) {
        const token = Auth.authToken(ctx);
        if (token) {
            try {
                const decodeToken = jwt.verify(token, config.jwtSecret);
                if ((<any>decodeToken).exp > Math.floor(Date.now() / 1000)) {
                    return true;
                }
            } catch (e) {
                console.log(e);
            }
        }
        return false;
    }
}
