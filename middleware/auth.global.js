export default defineNuxtRouteMiddleware(async () => {
	const user = useUser();
	const data = await $fetch("/api/user");
	if (data) {
		user.value = data;
	}
});