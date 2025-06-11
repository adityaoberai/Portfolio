<script>
    import { getPinkIcon, socialLinks } from "$lib/constants/links";
    import aditya from '$lib/assets/aditya.jpg';
</script>

<section id="socials">
    <img class="display-picture" src={aditya} alt="Aditya Oberai">
    <h1>Aditya Oberai</h1>
    <p>DevRel, Communities, and Open Source</p>
    <div class="social-icons">
        {#each socialLinks as { url, type, name }}
            <a class="social-icon" href={url} target = "_blank" rel="noopener noreferrer" aria-label={name}>
                <span class={getPinkIcon(type)}></span>
            </a>
        {/each}
    </div>
</section>

<style>
    section {
        gap: 1rem;
    }
    
    .display-picture {
        border-radius: 50%;
        border: 2px solid var(--accent-color);
        box-shadow: 0 0 10px 0 var(--accent-color);
        width: 200px;
        height: auto;
    }

    .social-icons {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.5rem;
        padding: 0 1rem;
    }

    .social-icon {
        border-radius: 50%;
        padding: 0.25rem;
        color: var(--text-color);
    }

    .social-icon:hover {
        color: var(--accent-color);
    }

    .social-icon span {
        font-size: 1.6rem;
    }

    @media (max-width: 768px) {
        .display-picture {
            width: 150px;
        }

        .social-icon span {
            font-size: 1.35rem;
        }

        section {
            gap: 0.75rem;
        }
    }
</style>