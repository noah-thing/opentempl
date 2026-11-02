import { describe, expect, it } from 'vitest';
import { allowedOrigin, cleanEmail, UUID, VERSION } from './validate';
import { ipBucket } from './ipKey';

describe('cleanEmail', () => {
	it('lowercases and trims', () => {
		expect(cleanEmail('  Ada@Example.ORG ')).toBe('ada@example.org');
	});
	it('accepts plus tags and subdomains', () => {
		expect(cleanEmail('a.b+news@mail.example.co.uk')).toBe('a.b+news@mail.example.co.uk');
	});
	it('rejects things that are not addresses', () => {
		for (const bad of ['', 'nope', 'a@b', 'a b@c.de', '@x.com', 'a@@x.com', 'a@x..com', '<a>@x.com', 42, null]) {
			expect(cleanEmail(bad)).toBeNull();
		}
	});
	it('rejects very long input', () => {
		expect(cleanEmail(`${'a'.repeat(250)}@x.com`)).toBeNull();
	});
});

describe('shapes', () => {
	it('knows a v4 uuid', () => {
		expect(UUID.test('3f2b8c1e-5a4d-4e6f-9a1b-2c3d4e5f6a7b')).toBe(true);
		expect(UUID.test('not-a-uuid')).toBe(false);
	});
	it('knows a version', () => {
		expect(VERSION.test('0.1.0')).toBe(true);
		expect(VERSION.test('latest')).toBe(false);
	});
});

describe('allowedOrigin', () => {
	it('allows the site, the desktop app and localhost', () => {
		expect(allowedOrigin('https://opentempl.org')).toBe('https://opentempl.org');
		expect(allowedOrigin('tavla://app')).toBe('tavla://app');
		expect(allowedOrigin('http://localhost:5181')).toBe('http://localhost:5181');
	});
	it('refuses everything else', () => {
		expect(allowedOrigin('https://evil.example')).toBeNull();
		expect(allowedOrigin('https://opentempl.org.evil.example')).toBeNull();
		expect(allowedOrigin(null)).toBeNull();
	});
});

describe('ipBucket', () => {
	it('keeps v4 and folds v6 to its /64', () => {
		expect(ipBucket('203.0.113.9')).toBe('203.0.113.9');
		expect(ipBucket('2001:db8:1:2:aaaa::1')).toBe(ipBucket('2001:0db8:0001:0002::ffff'));
		expect(ipBucket('2001:db8:1:3::1')).not.toBe(ipBucket('2001:db8:1:2::1'));
	});
});
