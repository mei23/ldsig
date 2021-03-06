import { genRsaKeyPair } from './keypair';
import { LdSignature } from './ld-signature';

async function main() {
	const kp = await genRsaKeyPair();

	const ldSignature = new LdSignature();
	ldSignature.debug = true;
	ldSignature.preLoad = true;

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
