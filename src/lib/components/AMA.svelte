<script>
	let question = '';
	let name = '';
	let email = '';
	let isSubmitting = false;
	let submitMessage = '';

	async function handleSubmit() {
		if (!question.trim()) {
			submitMessage = 'Please enter a question.';
			return;
		}

		isSubmitting = true;
		submitMessage = '';

		try {
			// For now, just simulate a submission
			await new Promise((resolve) => setTimeout(resolve, 1000));
			submitMessage = `Thank you for your question! I'll get back to you soon.`;
			question = '';
			name = '';
			email = '';
		} catch (error) {
			submitMessage = 'Something went wrong. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<section id="ama">
	<h2>Ask Me Anything</h2>

	<form on:submit|preventDefault={handleSubmit}>
		<div class="form-group">
			<label for="name">Name</label>
			<input
				type="text"
				id="name"
				bind:value={name}
				placeholder="Aditya Oberai"
				disabled={isSubmitting}
				required
			/>
		</div>

		<div class="form-group">
			<label for="email">Email</label>
			<input
				type="email"
				id="email"
				bind:value={email}
				placeholder="aditya.oberai@example.com"
				disabled={isSubmitting}
				required
			/>
		</div>

		<div class="form-group">
			<label for="question">Your Question</label>
			<textarea
				id="question"
				bind:value={question}
				placeholder="What would you like to know?"
				rows="4"
				disabled={isSubmitting}
				required
			></textarea>
		</div>

		<button type="submit" disabled={isSubmitting}>
			{isSubmitting ? 'Sending...' : 'Send Question'}
		</button>

		{#if submitMessage}
			<p
				class="submit-message"
				class:success={submitMessage.includes('Thank you')}
				class:error={submitMessage.includes('wrong')}
			>
				{submitMessage}
			</p>
		{/if}
	</form>
</section>

<style>
	section {
		width: 100%;
		max-width: 500px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	form {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-family: 'Lato', sans-serif;
		font-weight: 600;
		color: var(--text-color);
		text-align: left;
	}
	textarea,
	input {
		font-family: 'Lato', sans-serif;
		font-size: 1rem;
		padding: 0.75rem 1rem;
		border: 2px solid var(--text-color);
		border-radius: 0.5rem;
		background-color: var(--background-color);
		color: var(--text-color);
		resize: vertical;
		min-height: 2rem;
	}

	textarea:focus,
	input:focus {
		outline: none;
		border-color: var(--accent-color);
	}

	textarea:disabled,
	input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	button {
		font-family: 'Lato', sans-serif;
		font-weight: 500;
		font-size: 1rem;
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: max-content;
		border: 2px solid var(--text-color);
		border-radius: 1rem;
		color: var(--text-color);
		padding: 0.75rem 1rem;
		text-align: center;
		background-color: transparent;
		cursor: pointer;
		transition: all 0.3s ease;
		text-decoration: none;
	}

	button:hover:not(:disabled) {
		border-color: var(--accent-color);
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.submit-message {
		padding: 0.75rem;
		border-radius: 0.5rem;
		text-align: center;
		font-weight: 500;
	}

	.submit-message.success {
		background-color: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
	}

	.submit-message.error {
		background-color: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
	}

	@media (max-width: 768px) {
		section {
			width: 90%;
		}
	}

	@media (max-width: 480px) {
		textarea,
		input,
		button {
			padding: 0.5rem;
		}
	}
</style>
