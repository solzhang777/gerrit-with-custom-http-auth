import { Express, Request, Response } from 'express';
import log4js, { Logger } from 'log4js';

export default class GerritAuthController {

    private static logger: Logger = log4js.getLogger('GerritController');

    // a memory users table,  you can instead it with any db tables
    private authsList = [
        { login: 'root', password: '111111' },
        { login: 'yourlogin', password: 'yourpassword' },
        { login: 'tom', password: '111111' },
        { login: 'felix', password: '111111' },
        { login: 'clark', password: '111111' },
        { login: 'mac', password: '111111' }
    ]

    constructor(private express: Express) {
        this.dispatch();
        GerritAuthController.logger.debug("GerritAuthController init");
    }

    private dispatch(): void {
        this.express.post('/gerrit/login', (req: Request, res: Response) => { this.login(req, res); });
        this.express.get('/gerrit/login', (req: Request, res: Response) => { this.login(req, res); });
        this.express.post('/gerrit/logout', (req: Request, res: Response) => { this.logout(req, res); });
    }

    private login(req: Request, res: Response): void {

        const b64auth: string = (req.headers.authorization || '').split(' ')[1] || '';
        const [login, password] = new Buffer(b64auth, 'base64').toString().split(':');

        if (this.verifyUser(login, password)) {
            console.log(`${login} login success`);
            res.status(200).send('ok');
        } else {
            console.log(`${login} login should be authenticate.`);
            res.set('WWW-Authenticate', 'Basic realm="Gerrit2 Code Review"'); // change this
            res.status(401).send('Authentication required.'); // custom message
        }
    }

    private logout(req: Request, res: Response): void {
        res.status(200).send('logout');
    }

    private verifyUser(login: string, password: string): boolean {
        const auth = this.authsList.filter(auth => login === auth.login && password === auth.password);
        return auth && auth.length === 1;
    }

};
