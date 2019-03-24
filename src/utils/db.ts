import { createConnection, Connection, ConnectionOptions } from 'typeorm';
import { join } from 'path';
import { config } from '../config';
import { log } from './index';
import Test from '../entity/test';

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
    ],
    synchronize: true,
};

const connect: Promise<Connection> = createConnection(connectionOpts);

connect.then(async (connection: Connection) => {
    log('mongodb load success...');
    const test = new Test();
    test.name = 'test1';

    await connection.manager.save(test);
}).catch((err) => {
    log(`${err} mongodb connect error`, 'error');
});

export default connect;
