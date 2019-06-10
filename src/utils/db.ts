import { createConnection, Connection, ConnectionOptions } from 'typeorm';
import { join } from 'path';
import { config } from '../config';
import { log } from './index';

const parentDir = join(__dirname, '..');

const connectionOpts: ConnectionOptions = {
    type: 'mongodb',
    host: config.serverName,
    port: config.databasePort,
    username: config.user,
    password: config.password,
    database: config.database,
    useNewUrlParser: true,
    entities: [
        `${parentDir}/entity/*.ts`,
        `${parentDir}/entity/*.js`
    ],
    synchronize: true,
};

const connect = () => createConnection(connectionOpts)
    .then(async (connection: Connection) => {
        log('mongodb load success...');
    }).catch((err) => {
        log(`${err} mongodb connect error`, 'error');
    });

export default connect;
