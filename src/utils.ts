import * as http from 'http';
import * as https from 'https';
import fetch from 'node-fetch';

export async function fetchDocument(url: string) {
	const json = await fetch(url, {
		headers: {
			Accept: 'application/ld+json, application/json',
		},
		timeout: 10 * 1000,
		agent: u => u.protocol == 'http:' ? httpAgent : httpsAgent,
	}).then(res => {
		if (!res.ok) {
			throw `${res.status} ${res.statusText}`;
		} else {
			return res.json();
		}
	});

	return json;
}

export const httpAgent = new http.Agent({
	keepAlive: true,
	keepAliveMsecs: 30 * 1000
});

export const httpsAgent = new https.Agent({
	keepAlive: true,
	keepAliveMsecs: 30 * 1000
});
