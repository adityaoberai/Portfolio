import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests/browser',
	fullyParallel: false,
	workers: 1,
	timeout: 30000,
	use: {
		// Use full Chromium's headless mode so native Shift-click windows behave like headed Chrome.
		channel: 'chromium',
		baseURL: 'http://127.0.0.1:4173',
		viewport: { width: 1440, height: 1000 },
		launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
			? {
					executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
					args: [
						'--no-sandbox',
						'--disable-dev-shm-usage',
						'--use-gl=angle',
						'--use-angle=swiftshader',
						'--enable-unsafe-swiftshader'
					]
				}
			: undefined,
		screenshot: 'only-on-failure',
		trace: 'retain-on-failure'
	},
	webServer: {
		command: 'npm run start',
		env: { HOST: '127.0.0.1', PORT: '4173', ORIGIN: 'http://127.0.0.1:4173' },
		url: 'http://127.0.0.1:4173/world',
		reuseExistingServer: false
	}
});
