import { LdSignature } from './ld-signature';
import { genKeyPair } from './utils';

async function main() {
	const kp = await genKeyPair();

	const ldSignature = new LdSignature();
	ldSignature.debug = true;
	ldSignature.preLoad = false;

	const data = {
		"@context": [
			"https://w3id.org/identity/v1",
		],
		"title": "a",
		"xxxx": "x"
	};

	const compacted = await ldSignature.compact(data);
	console.log(`compacted: ${JSON.stringify(compacted)}`);

	const normalized = await ldSignature.normalize(data);
	console.log(`normalized: ${JSON.stringify(normalized)}`);

	const signed = await ldSignature.signRsaSignature2017(data, kp.privateKey, 'https://example.com/users/1');
	console.log(signed);

	const verified = await ldSignature.verifyRsaSignature2017(signed, kp.publicKey);
	console.log(verified);
}

main();
