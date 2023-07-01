import cors from 'cors';
import { Application } from 'express';
import bodyParser from 'body-parser';
// import expressValidator from 'express-validator';

class Http {
	public static mount(express: Application): Application {
		console.log('Booting the HTTP middleware...');

		express.use(bodyParser.json());
		express.use(bodyParser.urlencoded({
			extended: false
		}));
		express.disable('x-powered-by');
		// express.use(expressValidator());
		// express.use(flash());
		express.use(cors());

		return express;
	}
}

export default Http;
