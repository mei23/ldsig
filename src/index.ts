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
		"signature": {
			"type": "RsaSignature2017",
			"creator": "https://mastodon.cloud/users/transmute#main-key",
			"created": "2018-12-22T18:23:12Z",
			"signatureValue": "dO9UeEBI5Lab4hlAkv8jpSCBPP49/LGx+7wonkhYOeC1hzRLBSMCtUPrNEseugtsu4m7cv7ZOSKiyN/d+b9eEyK/iFKkAi2oEunQOoLsX4hsm451VakuH4eFMOJh2G77+yUwuebb74zKfKFeE/KR+yh7pxkr2LuFzNYTfSTpQaMmVE1LUy5XOMIsCWIE3LL4qZAdP5cLqCdPRgqCHsSafqL0EOHunNTzE/bTrM38ptuMEL2zGQTFif3NCtNzW1SvKvZSel03KQ6uNUZbdDD8i9IYbzJrmjzYz5owY/ospVB6f3KoS0TRgYFU25EIp/a8PWHz7uNSzJkBUnT514gRvA=="
		}
	};

	const signed = await ldSignature.signRsaSignature2017(data, kp.privateKey, 'https://example.com/users/1');
	console.log(signed);

	const verified = await ldSignature.verifyRsaSignature2017(signed, kp.publicKey);
	console.log(verified);
}

main();
