import * as crypto from 'crypto';
import * as jsonld from 'jsonld';
import { CONTEXTS } from './contexts';
import { inspect } from 'util';

// RsaSignature2017 based from https://github.com/transmute-industries/RsaSignature2017

export class LdSignature {
	public debug = false;
	public preLoad = true;

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

		const signer = crypto.createSign('sha256');
		signer.update(toBeSigned);
		signer.end();

		const signature = signer.sign(privateKey);

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
		const verifier = crypto.createVerify('sha256');
		verifier.update(toBeSigned);
		return verifier.verify(publicKey, data.signature.signatureValue, 'base64');
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

	private getLoader() {
		return async (url, options) => {
			if (!url.match('^https?\:\/\/')) throw `Invalid URL ${url}`;

			if (this.preLoad) {
				if (url in CONTEXTS) {
					if (this.debug) console.debug(`HIT: ${url}`);
					return {
						contextUrl: null,
						document: CONTEXTS[url],
						documentUrl: url
					};
				}
			}

			if (this.debug) console.debug(`MISS: ${url}`);
			const result = await (jsonld as any).documentLoaders.node()(url);
			return result;
		};
	}

	public sha256(data: string): string {
		const hash = crypto.createHash('sha256');
		hash.update(data);
		return hash.digest('hex');
	}
}
