WEBPACK = ./node_modules/webpack/bin/webpack.js
APP     = app.js
SRC     = $(shell find ./src -name "*.js") ./test.js
PREFIX  = /mnt/sda1
HOST    = onion

.PHONY: deploy run

$(APP):$(SRC)
	$(WEBPACK)

clean:
	rm $(APP)

deploy:$(APP)
	scp $(APP) $(HOST):$(PREFIX)

run:
	ssh $(HOST) -- node $(PREFIX)/$(APP)


