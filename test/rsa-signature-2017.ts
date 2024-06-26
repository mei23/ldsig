import * as assert from 'assert';
import { LdSignature } from '../src/ld-signature';
import { genRsaKeyPair, genEcKeyPair } from '../src/keypair';
import { fetchDocument } from '../src/utils';

const data = {
	"@context": [
		"https://w3id.org/identity/v1",
	],
	"title": "a",
};

const alsoKnownAsDuplicated = {
	"@context": [
		"https://www.w3.org/ns/activitystreams",
		"https://w3id.org/identity/v1",
		{
			"alsoKnownAs": { '@id': 'as:alsoKnownAs', '@type': '@id' },
		}
	],
	"title": "a",
	"alsoKnownAs": "https://example.com/user/a"
};

describe('RsaSignature2017', () => {
	it('Basic sign/verify', async () => {
		const ldSignature = new LdSignature();
		ldSignature.debug = true;

		const rsa1 = await genRsaKeyPair();

		const signed = await ldSignature.signRsaSignature2017(data, rsa1.privateKey, 'https://example.com/users/1');
		const verified = await ldSignature.verifyRsaSignature2017(signed, rsa1.publicKey);
		assert.strictEqual(verified, true);
	});

	it('Verification fails if another key', async () => {
		const ldSignature = new LdSignature();
		ldSignature.debug = true;

		const rsa1 = await genRsaKeyPair();
		const kp2 = await genRsaKeyPair();

		const signed = await ldSignature.signRsaSignature2017(data, rsa1.privateKey, 'https://example.com/users/1');
		const verified = await ldSignature.verifyRsaSignature2017(signed, kp2.publicKey);
		assert.strictEqual(verified, false);
	});

	it('Verification fails if tampered', async () => {
		const ldSignature = new LdSignature();
		ldSignature.debug = true;

		const rsa1 = await genRsaKeyPair();

		const signed = await ldSignature.signRsaSignature2017(data, rsa1.privateKey, 'https://example.com/users/1');

		const tampered = { ...signed };
		tampered.title = 'b';

		const verified = await ldSignature.verifyRsaSignature2017(tampered, rsa1.publicKey);
		assert.strictEqual(verified, false);
	});

	it('Rejects if signature.type is not RsaSignature2017', async () => {
		const ldSignature = new LdSignature();
		ldSignature.debug = true;

		const rsa1 = await genRsaKeyPair();

		const signed = await ldSignature.signRsaSignature2017(data, rsa1.privateKey, 'https://example.com/users/1');

		const another = { ...signed };
		another.signature.type = 'AnotherSignature';

		await assert.rejects(ldSignature.verifyRsaSignature2017(data, rsa1.publicKey), {
			message: 'signature is not RsaSignature2017'
		});
	});

	it('Rejects if privateKey is not rsa', async () => {
		const ldSignature = new LdSignature();
		ldSignature.debug = true;

		const ec1 = await genEcKeyPair();

		await assert.rejects(ldSignature.signRsaSignature2017(data, ec1.privateKey, 'https://example.com/users/1'), {
			message: 'privateKey is not rsa'
		});
	});

	it('Rejects if publicKey is not rsa', async () => {
		const ldSignature = new LdSignature();
		ldSignature.debug = true;

		const rsa1 = await genRsaKeyPair();
		const ec1 = await genEcKeyPair();

		const signed = await ldSignature.signRsaSignature2017(data, rsa1.privateKey, 'https://example.com/users/1');

		await assert.rejects(ldSignature.verifyRsaSignature2017(signed, ec1.publicKey), {
			message: 'publicKey is not rsa'
		});
	});

	/*
	it('Basic sign/verify no preLoad', async () => {
		const ldSignature = new LdSignature();
		ldSignature.preLoad = false;
		ldSignature.fetchFunc = fetchDocument;
		ldSignature.debug = true;

		const rsa1 = await genRsaKeyPair();

		const signed = await ldSignature.signRsaSignature2017(data, rsa1.privateKey, 'https://example.com/users/1');
		const verified = await ldSignature.verifyRsaSignature2017(signed, rsa1.publicKey);
		assert.strictEqual(verified, true);
	});
	*/

	it('alsoKnownAsはリモートとローカル両方の@contextに存在します、大丈夫？', async () => {
		const ldSignature = new LdSignature();
		ldSignature.debug = true;

		const rsa1 = await genRsaKeyPair();

		const compacted = await ldSignature.compact(alsoKnownAsDuplicated);
		assert.strictEqual(compacted.alsoKnownAs, 'https://example.com/user/a', 'ちゃんとJSON-LDで認識されてる？');

		const signed = await ldSignature.signRsaSignature2017(alsoKnownAsDuplicated, rsa1.privateKey, 'https://example.com/users/1');
		const verified = await ldSignature.verifyRsaSignature2017(signed, rsa1.publicKey);
		assert.strictEqual(verified, true);
	});

	it('Mastodon', async () => {
		const ldSignature = new LdSignature();
		ldSignature.debug = true;

		const verified = await ldSignature.verifyRsaSignature2017(activity, actor.publicKey.publicKeyPem);
		assert.strictEqual(verified, true);
	});

	/*
	it('Mastodon no preLoad', async () => {
		const ldSignature = new LdSignature();
		ldSignature.preLoad = false;
		ldSignature.fetchFunc = fetchDocument;
		ldSignature.debug = true;

		const verified = await ldSignature.verifyRsaSignature2017(activity, actor.publicKey.publicKeyPem);
		assert.strictEqual(verified, true);
	});
	*/
});

// TODO: ちゃんと自分のに置き換える
const activity = {
	"@context": [
	  "https://www.w3.org/ns/activitystreams",
	  "https://w3id.org/security/v1",
	  {
		"manuallyApprovesFollowers": "as:manuallyApprovesFollowers",
		"sensitive": "as:sensitive",
		"movedTo": {
		  "@id": "as:movedTo",
		  "@type": "@id"
		},
		"Hashtag": "as:Hashtag",
		"ostatus": "http://ostatus.org#",
		"atomUri": "ostatus:atomUri",
		"inReplyToAtomUri": "ostatus:inReplyToAtomUri",
		"conversation": "ostatus:conversation",
		"toot": "http://joinmastodon.org/ns#",
		"Emoji": "toot:Emoji",
		"focalPoint": {
		  "@container": "@list",
		  "@id": "toot:focalPoint"
		},
		"featured": {
		  "@id": "toot:featured",
		  "@type": "@id"
		},
		"schema": "http://schema.org#",
		"PropertyValue": "schema:PropertyValue",
		"value": "schema:value"
	  }
	],
	"id": "https://mastodon.cloud/6b269e34-4a33-43a4-a764-eda6c5a21863",
	"type": "Follow",
	"actor": "https://mastodon.cloud/users/transmute",
	"object": "https://transmute.ngrok.io/u/alice",
	"signature": {
	  "type": "RsaSignature2017",
	  "creator": "https://mastodon.cloud/users/transmute#main-key",
	  "created": "2018-12-22T18:23:12Z",
	  "signatureValue": "dO9UeEBI5Lab4hlAkv8jpSCBPP49/LGx+7wonkhYOeC1hzRLBSMCtUPrNEseugtsu4m7cv7ZOSKiyN/d+b9eEyK/iFKkAi2oEunQOoLsX4hsm451VakuH4eFMOJh2G77+yUwuebb74zKfKFeE/KR+yh7pxkr2LuFzNYTfSTpQaMmVE1LUy5XOMIsCWIE3LL4qZAdP5cLqCdPRgqCHsSafqL0EOHunNTzE/bTrM38ptuMEL2zGQTFif3NCtNzW1SvKvZSel03KQ6uNUZbdDD8i9IYbzJrmjzYz5owY/ospVB6f3KoS0TRgYFU25EIp/a8PWHz7uNSzJkBUnT514gRvA=="
	}
};

const actor = {
	"@context": [
	  "https://www.w3.org/ns/activitystreams",
	  "https://w3id.org/security/v1",
	  {
		"manuallyApprovesFollowers": "as:manuallyApprovesFollowers",
		"sensitive": "as:sensitive",
		"movedTo": {
		  "@id": "as:movedTo",
		  "@type": "@id"
		},
		"Hashtag": "as:Hashtag",
		"ostatus": "http://ostatus.org#",
		"atomUri": "ostatus:atomUri",
		"inReplyToAtomUri": "ostatus:inReplyToAtomUri",
		"conversation": "ostatus:conversation",
		"toot": "http://joinmastodon.org/ns#",
		"Emoji": "toot:Emoji",
		"focalPoint": {
		  "@container": "@list",
		  "@id": "toot:focalPoint"
		},
		"featured": {
		  "@id": "toot:featured",
		  "@type": "@id"
		},
		"schema": "http://schema.org#",
		"PropertyValue": "schema:PropertyValue",
		"value": "schema:value"
	  }
	],
	"id": "https://mastodon.cloud/users/transmute",
	"type": "Person",
	"following": "https://mastodon.cloud/users/transmute/following",
	"followers": "https://mastodon.cloud/users/transmute/followers",
	"inbox": "https://mastodon.cloud/users/transmute/inbox",
	"outbox": "https://mastodon.cloud/users/transmute/outbox",
	"featured": "https://mastodon.cloud/users/transmute/collections/featured",
	"preferredUsername": "transmute",
	"name": "",
	"summary": "<p></p>",
	"url": "https://mastodon.cloud/@transmute",
	"manuallyApprovesFollowers": false,
	"publicKey": {
	  "id": "https://mastodon.cloud/users/transmute#main-key",
	  "owner": "https://mastodon.cloud/users/transmute",
	  "publicKeyPem": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0AC6WSd/sVBc95NOwHA5\nuIgllOKIpHw2LT5zKKSGR2ykOKh3I6oMIqaPyqUSiiLpGGfYMmN6s/XcoreHyb3N\nx4He6QW9lb+BKQUPOewiHVA9qKwqHJTlTkXN2j3/Xy3rUducmWUGkk1sH01AxvJ5\niTl7c6kInNSQIba/ov5IYg9shHI62eC4E6InsYSMqSQk7dz33pkb9Fr2Xz6Mw74W\nlUHa/e8ad7GR6oLJ0d8acdc1lK4fsN8wx5AmjVUZhyK3JB/sgJ1apk3Uy3EtYm2M\nG4ui/E2Yj3M/SV7bHEI0RE0euTa3ihvt28sT8jmjIYOd56X3hl8Y3bxw+o1hVv3T\nXwIDAQAB\n-----END PUBLIC KEY-----\n"
	},
	"tag": [],
	"attachment": [],
	"endpoints": {
	  "sharedInbox": "https://mastodon.cloud/inbox"
	}
};
