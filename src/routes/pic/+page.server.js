import { redirect } from "@sveltejs/kit";

export async function load() {
    // Redirect to the image URL
    throw redirect(301, '/aditya.jpg');
}