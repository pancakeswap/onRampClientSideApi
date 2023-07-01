
import { Application } from 'express'
import CORS from './Cors';
import Http from './Http';
import StatusMonitor from './StatusMonitor';


class Kernel {
	public static init (express: Application): Application {
		express = CORS.mount(express);
		express = Http.mount(express);
		express = StatusMonitor.mount(express);
		return express;
	}
}

export default Kernel;
