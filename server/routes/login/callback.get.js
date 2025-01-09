import { generateId } from "lucia";
import { auth0 } from "~/server/utils/auth";
import { sql } from "~/server/utils/auth"
const config = useRuntimeConfig()

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const code = query.code?.toString() ?? null;
	const state = query.state?.toString() ?? null;
	const storedState = getCookie(event, "auth0_oauth_state") ?? null;
	if (!code || !state || !storedState || state !== storedState) {
		throw createError({
			status: 400
		});
	}

	try {
		const tokens = await auth0.validateAuthorizationCode(code);
		const auth0UserResponse = await fetch(config.auth0Domain+"/userinfo", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});
		const auth0User = await auth0UserResponse.json();

		// Replace this with your own DB client.
		const existingUser = await sql`select * from auth_user where auth0_id=${auth0User.sub}`

		if (existingUser.length!=0) {
			console.log(existingUser[0])
			const session = await lucia.createSession(existingUser[0].id, {});
			appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
			return sendRedirect(event, "/browse");
		}

		const userId = generateId(15);

		// Replace this with your own DB client.
		await sql`insert into auth_user(id, full_name, auth0_id, email) values(${userId}, ${auth0User.name}, ${auth0User.sub}, ${auth0User.email})`

		const session = await lucia.createSession(userId, {});
		appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
		return sendRedirect(event, "/browse");
	} catch (e) {
		console.log(e)
		throw createError({
			status: 500
		});
	}
});