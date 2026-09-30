// Lets `node --test` import the app's extensionless TypeScript modules directly.
import { registerHooks } from 'node:module';

registerHooks({
	resolve(specifier, context, next) {
		try {
			return next(specifier, context);
		} catch (error) {
			if (/^\.{1,2}\//.test(specifier) && !/\.[a-z]+$/.test(specifier))
				return next(`${specifier}.ts`, context);
			throw error;
		}
	}
});
