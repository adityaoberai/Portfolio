import  { redirect } from '@sveltejs/kit';

export async function load() {
    // Redirect to the Google Meet link
    throw redirect(302, 'https://meet.google.com/erv-qmct-yvc');
}