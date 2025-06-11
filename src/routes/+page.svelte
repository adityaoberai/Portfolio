<script>
    import Intro from "$lib/components/Intro.svelte";
    import Links from "$lib/components/Links.svelte";
</script>

<svelte:head>
    <title>Aditya Oberai</title>
    <meta name="description" content="DevRel, Communities, and Open Source" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://oberai.dev/" />
    <meta property="og:title" content="Aditya Oberai" />
    <meta property="og:description" content="DevRel, Communities, and Open Source" />
    <meta property="og:image" content="https://oberai.dev/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Aditya Oberai" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://oberai.dev/" />
    <meta property="twitter:title" content="Aditya Oberai" />
    <meta property="twitter:description" content="DevRel, Communities, and Open Source" />
    <meta property="twitter:image" content="https://oberai.dev/og.png" />
    <meta property="twitter:creator" content="@adityaoberai1" />
    
    <!-- Additional meta tags -->
    <meta name="author" content="Aditya Oberai" />
    <meta name="keywords" content="Aditya Oberai, DevRel, Developer Relations, Communities, Open Source, Portfolio" />
    <link rel="canonical" href="https://oberai.dev/" />
</svelte:head>

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