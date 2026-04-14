export const load = async ({ locals }: { locals: App.Locals }) => {
	const { session, user } = await locals.safeGetSession();
	return { session, user };
};
