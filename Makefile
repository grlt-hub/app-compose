build:
	rm -rf ./dist && npx tsup src/index.ts --minify --format esm --dts

test:
	npx vitest --coverage

lint:
	npx knip && npx size-limit

prepublish:
	make build && make lint && make test

publish:
	pnpm i && make prepublish && npx clean-publish
