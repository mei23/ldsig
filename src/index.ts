import { signRsaSignature2017, verifyRsaSignature2017 } from './ld-signature';
import { genKeyPair } from './utils';

async function main() {
	const kp = await genKeyPair();

	const signed = await signRsaSignature2017({'a': 1}, kp.privateKey, 'https://example.com/users/1');
	console.log(signed);

	const verified = await verifyRsaSignature2017(signed, kp.publicKey);
	console.log(verified);
}

main();
