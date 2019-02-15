import Express, { Request, Response, NextFunction } from 'express';
import log4js, { Logger } from 'log4js';
import log4jsextend from 'log4js-extend';
import GerritAuthController from './controller/gerrit-auth.controller';

log4js.configure({
    appenders: {
        logfiles: { type: 'file', filename: 'server.log' },
        consoles: { type: 'console' }
    },
    categories: { default: { appenders: ['logfiles', 'consoles'], level: 'debug' } }
});

log4jsextend(log4js, {
    path: __dirname,
    format: "at @name (@file:@line:@column)"
});

class App {

    private static logger: Logger = log4js.getLogger('App');

    private app: Express.Express;
    private port: number = 3000;

    constructor() {
        this.app = Express();
    }
    public run(): void {

        this.app.listen(this.port);
        App.logger.info(`Gerrit auth server start, port[${this.port}]`);

        this.app.all('*', function (req: Request, res: Response, next: NextFunction) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
            res.header("X-Powered-By", ' 3.2.1')
            res.header("Content-Type", "application/json;charset=utf-8");
            next();
        });

        // register controller
        new GerritAuthController(this.app);
    }
}

new App().run();
