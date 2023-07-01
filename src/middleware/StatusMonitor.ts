import { Application } from 'express';
import expressStatusMonitor from 'express-status-monitor';

class StatusMonitor {
	public mount (express: Application): Application {
		console.log('Booting StatusMonitor...');

		const monitorOptions: object = {
			title: 'Status Monitor',
			path: '/status-monitor',
			spans: [
				{
					interval: 1, 		// Every second
					retention: 60		// Keep 60 data-points in memory
				},
				{
					interval: 5,
					retention: 60
				},
				{
					interval: 15,
					retention: 60
				}
			],
			chartVisibility: {
				mem: true,
				rps: true,
				cpu: true,
				load: true,
				statusCodes: true,
				responseTime: true
			},
			healthChecks: [
				{
					protocol: 'http',
					host: 'localhost',
					path: '/',
					port: '8000'
				}
			]
		};
		express.use(expressStatusMonitor(monitorOptions));
		return express;
	}
}

export default new StatusMonitor;
