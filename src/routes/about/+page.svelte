<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import { site } from '$lib/data/site';
</script>

<PageMeta
	title="About"
	description="The person behind the work: how Aditya Oberai found his way from hackathons to leading Developer Relations at Appwrite, and what he cares about along the way."
	path="/about"
/>

<article class="mx-auto max-w-2xl px-6 py-16 md:px-8 md:py-24">
	<p class="eyebrow">About</p>
	<h1 class="mt-6 text-h1">Making complicated things make sense.</h1>
	<p class="mt-6 text-lede italic text-secondary">
		That's the thread through everything I do: developer relations, writing, speaking, teaching, and
		the occasional photograph.
	</p>

	<!-- The photographic plate -->
	<figure class="mx-auto mt-10 w-60 md:float-right md:ml-8 md:mt-2">
		<div class="rounded-md border border-hairline p-1.5">
			<img
				src={site.portrait}
				alt="Aditya Oberai"
				width="240"
				height="240"
				loading="eager"
				class="w-full rounded-[3px]"
			/>
		</div>
		<figcaption class="eyebrow mt-2 text-center">Plate I · The author</figcaption>
	</figure>

	<p class="drop-cap mt-10 text-body">
		I'm Aditya Oberai, and I lead Developer Relations at Appwrite, an open-source backend platform.
		My job sits at the intersection of engineering and communication: product launches,
		documentation, education, and community. The throughline is simple: when a developer meets a
		tool, I want that first conversation to go well.
	</p>

	<section class="mt-14">
		<h2 class="eyebrow">
			<span class="text-accent">01</span> <span aria-hidden="true">·</span> Career journey
		</h2>
		<p class="mt-5 text-body">
			My path into developer relations started at hackathons. As a computer science student, I spent
			weekends building things against deadlines and helping other students do the same, first as a
			participant, then as a mentor and organizer in communities like Major League Hacking, which
			named me one of its Top 50 Hackers in 2021. That same year, a project called CodeCapture,
			built so students without computers could learn to code, won the Education category at the
			Microsoft Imagine Cup's India chapter. It taught me something that stuck: the technology was
			the easy half. Explaining it was the work.
		</p>
		<p class="mt-4 text-body">
			I joined Appwrite in 2021 as a Developer Advocate, when both the platform and its community
			were young. Over four years I answered thousands of questions on Discord and GitHub, wrote
			more than 140 articles, launched an education program that reached 15,000+ students, ran
			hackathons for 7,000+ developers, and helped onboard 70,000+ new community members through
			initiatives like Hacktoberfest. In December 2025, I stepped into leading Developer Relations
			at Appwrite, owning our public-facing product releases, content strategy, and the AI
			documentation that helps developers build with Appwrite through tools like Claude Code and
			Cursor.
		</p>
	</section>

	<section class="mt-14">
		<h2 class="eyebrow">
			<span class="text-accent">02</span> <span aria-hidden="true">·</span> What I care about
		</h2>
		<p class="mt-5 text-body">
			Three things, mostly. <em>Clear communication</em>: documentation, blog posts, and launch
			announcements are products in their own right, and they deserve the same care as the code they
			describe. <em>Education</em>: Appwrite Education, CodeCapture, and most of my writing exist
			because someone, somewhere, is learning this for the first time.
			<em>Communities</em>: not audiences but communities, places where people know each other's
			names, answer each other's questions, and stay long after the swag runs out.
		</p>
	</section>

	<section class="mt-14">
		<h2 class="eyebrow">
			<span class="text-accent">03</span> <span aria-hidden="true">·</span> How I work
		</h2>
		<p class="mt-5 text-body">
			Evidence over adjectives: I'd rather show you a launch, an article, or a number than call
			myself passionate. Teaching over selling: if the product is good, explaining it honestly is
			the best marketing there is. And writing things down: most problems in developer relations
			turn out to be documentation problems wearing a costume.
		</p>
	</section>

	<section class="mt-14">
		<h2 class="eyebrow">
			<span class="text-accent">04</span> <span aria-hidden="true">·</span> Beyond work
		</h2>
		<p class="mt-5 text-body">
			When I'm not working, I'm usually holding a camera. Photography started as a conference habit
			(hallways, cities, people mid-laugh) and turned into a serious pursuit; my archive lives on <ExternalLink
				href="https://www.pexels.com/@oberai">Pexels</ExternalLink
			>, free for anyone to use. I write about developer relations, developer tools, and whatever
			I'm currently figuring out at
			<ExternalLink href="https://oberai.blog">oberai.blog</ExternalLink>. And I still show up at
			hackathons, these days usually on the judging side.
		</p>
	</section>

	<div class="mt-14 border-t border-hairline pt-10">
		<p class="text-body text-secondary">Prefer the formal version?</p>
		<p class="mt-4">
			<a href={site.resume} class="btn-secondary" download>Download résumé</a>
		</p>
	</div>
</article>
