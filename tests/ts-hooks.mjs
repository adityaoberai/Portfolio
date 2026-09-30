// Lets `node --test` import the app's modules directly: extensionless TypeScript
// imports, and JSON imported without an attribute (Vite allows both; Node does not).
import { registerHooks } from 'node:module';

function resolveApp(specifier, context, next) {
	try {
		return next(specifier, context);
	} catch (error) {
		if (/^\.{1,2}\//.test(specifier) && !/\.[a-z]+$/.test(specifier))
			return next(`${specifier}.ts`, context);
		throw error;
	}
}

registerHooks({
	resolve(specifier, context, next) {
		const result = resolveApp(specifier, context, next);
		if (result.url.endsWith('.json'))
			return { ...result, importAttributes: { ...result.importAttributes, type: 'json' } };
		return result;
	}
});
