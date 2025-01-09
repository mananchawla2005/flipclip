import { generateState } from "arctic";
import { auth0 } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
	const state = generateState();
	const config = useRuntimeConfig()
	console.log(config)
	console.log(config.auth0Domain, config.auth0ClientId, config.auth0ClientSecret)
	const url = await auth0.createAuthorizationURL(state, {
		scopes: ['profile', 'email']
	});
	setCookie(event, "auth0_oauth_state", state, {
		path: "/",
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	});
	return sendRedirect(event, url.toString());
});