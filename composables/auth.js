export const useUser = () => {
	const user = useState("user", () => null);
	return user;
};