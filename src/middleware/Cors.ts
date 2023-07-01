
import cors from 'cors';
import { Application } from 'express';


class CORS {
	public mount(express: Application): Application {
		console.log('Booting the CORS middleware...');

		const options = {
			origin: 'http://localhost:8000',
			optionsSuccessStatus: 200
		};

		express.use(cors(options));

		return express;
	}
}

export default new CORS;
