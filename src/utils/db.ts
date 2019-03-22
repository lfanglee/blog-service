import * as mongoose from 'mongoose';
import { config } from '../config';
import { log } from './index';

(<any>mongoose).Promise = global.Promise;

export const db = mongoose;

export const connect = (callback?: Function) => {
    const connectString = `mongodb://${config.user}:${config.password}@${config.serverName}:${config.databasePort}/${config.database}`;
    const options = {
        useNewUrlParser: true,
        useCreateIndex: true
    };
    mongoose.connect(connectString, options, (err) => {
        if (err) {
            log(`${err}, mongodb Authentication failed`, 'error');
        }
    });
    mongoose.connection.on('open', () => {
        log('mongodb load success...');
        callback && callback();
    });
    mongoose.connection.on('error', (err) => {
        log(`${err} mongodb connect error`, 'error');
    });

    return mongoose;
};
