<script>
    import Intro from "$lib/components/Intro.svelte";
    import Links from "$lib/components/Links.svelte";
</script>

<main>
    <Intro />
    <hr>
    <Links />
</main>

<style>
    main {
        width: 100%;
        max-width: 800px;
        min-height: 100vh;
        margin: auto;
        padding: 3rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        box-sizing: border-box;
    }

    hr {
        width: 90%;
        margin: 1rem auto;
        border: 1px solid var(--accent-color);
    }

    @media (max-width: 768px) {
        main {
            gap: 0.5rem;
            padding: 2rem;
        }
    }

    @media (max-width: 480px) {
        hr {
            width: 95%;
        }
    }
</style>