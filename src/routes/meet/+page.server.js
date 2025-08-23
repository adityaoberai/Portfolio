import  { redirect } from '@sveltejs/kit';

export const trailingSlash = 'ignore';

export async function load() {
    // Redirect to the Google Meet link
    redirect(302, 'https://meet.google.com/erv-qmct-yvc');
}