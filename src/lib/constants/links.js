export function getPinkIcon(type) {
    switch (type) {
        case 'linkedin': return 'icon-linkedin'
        case 'github': return 'icon-github'
        case 'twitter': return 'icon-twitter'
        case 'instagram': return 'icon-instagram'
        case 'email': return 'icon-mail'
        case 'newspaper': return 'icon-newspaper'
        case 'camera': return 'icon-camera'
        case 'external-link': return 'icon-external-link'
        case 'ama': return 'icon-annotation'
        default: return 'icon-external-link'
    }
}

export const socialLinks = [
    {
        name: 'Instagram',
        url: 'https://instagram.com/adityaoberai1',
        type: 'instagram'
    },
    { 
        name: 'X',
        url: 'https://x.com/adityaoberai',
        type: 'twitter'
    },
    {
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/in/adityaoberai1/',
        type: 'linkedin'
    },
    {
        name: 'GitHub',
        url: 'https://github.com/adityaoberai',
        type: 'github'
    },
    {
        name: 'Email',
        url: 'mailto:aditya@oberai.dev',
        type: 'email'
    }
];

export const featureLinks = [
    {
        name: 'Anonymously ask me a question',
        url: 'https://betweenus.today/creator/aditya',
        type: 'ama'
    },
    {
        name: 'Read my newsletter on Substack',
        url: 'https://oberai.substack.com/',
        type: 'newspaper'
    },
    {
        name: 'Sponsor my work on GitHub',
        url: 'https://github.com/sponsors/adityaoberai',
        type: 'github'
    },
    {
        name: "Find my photography on Pexels",
        url: 'https://www.pexels.com/@oberai',
        type: 'camera'
    },
    {
        name: 'View my resume',
        url: '/resume/',
        type: 'external-link'
    }
];
