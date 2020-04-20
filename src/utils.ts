import * as crypto from 'crypto';
import * as util from 'util';

const generateKeyPair = util.promisify(crypto.generateKeyPair);

export async function genKeyPair(
	type: 'rsa' | 'ec' = 'rsa',
	rsaLength = 2048,
	ecParam: 'prime256v1' | 'secp384r1' | 'secp521r1' | 'curve25519' = 'prime256v1'
) {
	if (type === 'rsa') {
		return await generateKeyPair('rsa', {
			modulusLength: rsaLength,
			publicKeyEncoding: {
				type: 'spki',
				format: 'pem'
			},
			privateKeyEncoding: {
				type: 'pkcs8',
				format: 'pem',
				cipher: undefined,
				passphrase: undefined
			}
		});
	}

	if (type === 'ec') {
		return await generateKeyPair('ec', {
			namedCurve: ecParam,
			publicKeyEncoding: {
				type: 'spki',
				format: 'pem'
			},
			privateKeyEncoding: {
				type: 'pkcs8',
				format: 'pem',
				cipher: undefined,
				passphrase: undefined
			}
		});
	}

	throw 'Unknown type';
}
