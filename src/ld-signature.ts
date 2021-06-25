import * as crypto from 'crypto';
import * as jsonld from 'jsonld';
import { CONTEXTS } from './contexts';
import { inspect } from 'util';
import fetch from 'node-fetch';
import { httpAgent, httpsAgent } from './agent';

// RsaSignature2017 based from https://github.com/transmute-industries/RsaSignature2017

export class LdSignature {
	public debug = false;
	public preLoad = true;
	public loderTimeout = 10 * 1000;

	constructor() {
	}

	public async signRsaSignature2017(data: any, privateKey: string, creator: string, domain?: string, created?: Date): Promise<any> {
		const options = {
			type: 'RsaSignature2017',
			creator,
			domain,
			nonce: crypto.randomBytes(16).toString('hex'),
			created: (created || new Date()).toISOString()
		} as {
			type: string;
			creator: string;
			domain: string;
			nonce: string;
			created: string;
		};

		if (!domain) {
			delete options.domain;
		}

		const toBeSigned = await this.createVerifyData(data, options);
		const signature = crypto.sign('sha256', Buffer.from(toBeSigned), privateKey);

		return {
			...data,
			signature: {
				...options,
				signatureValue: signature.toString('base64')
			}
		};
	}

	public async verifyRsaSignature2017(data: any, publicKey: string): Promise<boolean> {
		const toBeSigned = await this.createVerifyData(data, data.signature);
		return crypto.verify('sha256', Buffer.from(toBeSigned), publicKey, Buffer.from(data.signature.signatureValue, 'base64'));
	}

	public async createVerifyData(data: any, options: any) {
		const transformedOptions = {
			...options,
			'@context': 'https://w3id.org/identity/v1'
		};
		delete transformedOptions['type'];
		delete transformedOptions['id'];
		delete transformedOptions['signatureValue'];
		const canonizedOptions = await this.normalize(transformedOptions);
		const optionsHash = this.sha256(canonizedOptions);
		const transformedData = { ...data };
		delete transformedData['signature'];
		const cannonidedData = await this.normalize(transformedData);
		//console.log(cannonidedData);
		const documentHash = this.sha256(cannonidedData);
		const verifyData = `${optionsHash}${documentHash}`;
		return verifyData;
	}

	public async normalize(data: any) {
		const customLoader = this.getLoader();
		return await jsonld.normalize(data, {
			documentLoader: customLoader
		});
	}

	public async compact(data: any) {
		const customLoader = this.getLoader();
		return await jsonld.compact(data, data['@context'], {
			documentLoader: customLoader
		});
	}

	private getLoader() {
		return async (url, options) => {
			if (!url.match('^https?\:\/\/')) throw `Invalid URL ${url}`;

			if (this.preLoad) {
				if (url in CONTEXTS) {
					if (this.debug) console.debug(`PRELOADED: ${url}`);
					return {
						contextUrl: null,
						document: CONTEXTS[url],
						documentUrl: url
					};
				}
			}

			if (this.debug) console.debug(`FETCH: ${url}`);
			const document = await this.fetchDocument(url);
			return {
				contextUrl: null,
				document: document,
				documentUrl: url
			};
		};
	}

	private async fetchDocument(url: string) {
		const json = await fetch(url, {
			headers: {
				Accept: 'application/ld+json, application/json',
			},
			timeout: this.loderTimeout,
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

	public sha256(data: string): string {
		const hash = crypto.createHash('sha256');
		hash.update(data);
		return hash.digest('hex');
	}
}
