import { LANDBLOCK_NAME_URL } from '../../../lib/db';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	const res = await fetch(LANDBLOCK_NAME_URL(params.id));
	const data = await res.json();

	return {
		id: params.id,
		name: data['rows'][0][0]
	};
}
