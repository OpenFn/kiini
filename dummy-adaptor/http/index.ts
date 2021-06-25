import axios  from "axios";

export async function post(...args: Parameters<typeof axios.post>) {
	return axios.post(...args)
}
