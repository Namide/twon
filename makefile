install:
	docker run -ti --rm \
		-v $(shell pwd):/usr/src/app \
		-w /usr/src/app \
		-u "node" \
		node:slim \
		npm install

code:
	docker run -ti --rm \
		-v $(shell pwd):/usr/src/app \
		-w /usr/src/app \
		-p 3001\:3001 \
		-u "node" \
		node:slim \
		bash

lint:
	docker run -ti --rm \
		-v $(shell pwd):/usr/src/app \
		-w /usr/src/app \
		-u "node" \
		node:slim \
		npm run lint

build:
	docker run -ti --rm \
		-v $(shell pwd):/usr/src/app \
		-w /usr/src/app \
		-u "node" \
		node:slim \
		npm run build

publish:
	docker run -ti --rm \
		-v $(shell pwd):/usr/src/app \
		-w /usr/src/app \
		-u "node" \
		node:slim \
		sh -c "npm adduser; npm run build; npm publish"
