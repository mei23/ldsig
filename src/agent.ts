import * as http from 'http';
import * as https from 'https';
const cache = require('lookup-dns-cache');

export const httpAgent = new http.Agent({
		keepAlive: true,
		keepAliveMsecs: 30 * 1000,
		lookup: cache.lookup,
	} as http.AgentOptions);

export const httpsAgent = new https.Agent({
		keepAlive: true,
		keepAliveMsecs: 30 * 1000,
		lookup: cache.lookup,
	});
