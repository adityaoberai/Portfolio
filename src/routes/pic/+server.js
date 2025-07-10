import { redirect } from "@sveltejs/kit";

export async function GET() {
    // Redirect to the image URL
    throw redirect(301, '/aditya.jpg');
}