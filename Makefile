build:
	rm -rf ./dist && npx tsc --noEmit --project ./tsconfig.json && npx tsup src/index.ts --minify terser --format esm --dts

test:
	npx vitest --coverage

lint:
	npx knip && npx size-limit

prepublish:
	make build && make lint && make test

publish:
	npm i && make prepublish && npx clean-publish
