import { Lucia } from "lucia";
import { PostgresJsAdapter } from "@lucia-auth/adapter-postgresql";
import postgres from "postgres";
import { webcrypto } from "node:crypto";
import { Auth0 } from "arctic";

const config = useRuntimeConfig()

const appDomain = config.auth0Domain;

export const auth0 = new Auth0(appDomain, config.auth0ClientId, config.auth0ClientSecret, "https://flipclip.vercel.app/login/callback");

Object.defineProperty(globalThis, 'crypto', {
	value: webcrypto,
	writable: false,
	configurable: true,
	enumerable: true,
  });

export const sql = postgres(useRuntimeConfig().dbUri, {
	ssl: {
		rejectUnauthorized: false
	}
});

const adapter = new PostgresJsAdapter(sql, {
	user: "auth_user",
	session: "user_session"
});

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !import.meta.dev
		}
	},
    getUserAttributes: (attributes) => {
		return {
			// attributes has the type of DatabaseUserAttributes
			auth0Id: attributes.auth0_id,
			email: attributes.email,
            photo_url: attributes.photo_url,
            fullname: attributes.full_name,
			clips: attributes.clips
		};
	}
})