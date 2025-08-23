import { redirect } from "@sveltejs/kit";

export const trailingSlash = 'ignore';

export async function load() {
    // Redirect to the image URL
    redirect(301, '/aditya.jpg');
}