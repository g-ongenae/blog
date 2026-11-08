# Update automatically generated files
ZOLA_VERSION ?= 0.21.0
ZOLA_INSTALL_DIR ?= /usr/local/bin

.PHONY: install build generate tree check serve sync-terminal

install:
	@set -eu; \
	case "$$(uname -s)-$$(uname -m)" in \
		Linux-x86_64) target=x86_64-unknown-linux-gnu ;; \
		Linux-aarch64|Linux-arm64) target=aarch64-unknown-linux-gnu ;; \
		Darwin-x86_64) target=x86_64-apple-darwin ;; \
		Darwin-arm64) target=aarch64-apple-darwin ;; \
		*) echo "Unsupported platform: $$(uname -s)-$$(uname -m)" >&2; exit 1 ;; \
	esac; \
	tmp_dir="$$(mktemp -d)"; \
	archive="$$tmp_dir/zola.tar.gz"; \
	echo "Installing Zola $(ZOLA_VERSION) for $$target..."; \
	curl --fail --silent --show-error --location \
		"https://github.com/getzola/zola/releases/download/v$(ZOLA_VERSION)/zola-v$(ZOLA_VERSION)-$$target.tar.gz" \
		--output "$$archive"; \
	tar --extract --gzip --file "$$archive" --directory "$$tmp_dir"; \
	sudo install --mode 0755 "$$tmp_dir/zola" "$(ZOLA_INSTALL_DIR)/zola"; \
	"$(ZOLA_INSTALL_DIR)/zola" --version

node_modules: package-lock.json
	npm ci
	@touch node_modules

generate: node_modules
	node scripts/build-tell.ts
	node scripts/build-posts.ts think code speak
	$(MAKE) tree

tree: node_modules
	node scripts/build-tree.ts

check: node_modules
	npm run check

build: generate
	zola build

sync-terminal:
	cp ../g-ongenae.github.io/src/terminal.js static/terminal.js

# Serve on all network interfaces so other devices on the LAN can connect.
# Open http://<this-computer-local-ip>:1111 from the other computer.
serve: generate
	@mkdir -p public
	zola serve --interface 0.0.0.0 --port 1111 --base-url /
