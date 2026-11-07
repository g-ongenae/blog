# Update automatically generated files
ZOLA_VERSION ?= 0.19.1
ZOLA_INSTALL_DIR ?= /usr/local/bin

.PHONY: install build generate tree serve sync-terminal

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

generate:
	cd content/tell && bash ../../scripts-build-tell.sh
	python3 scripts/build-posts.py think code
	$(MAKE) tree

tree:
	python3 scripts/build-tree.py

build: generate
	zola build

sync-terminal:
	cp ../g-ongenae.github.io/src/terminal.js static/terminal.js

# Serve on all network interfaces so other devices on the LAN can connect.
# Open http://<this-computer-local-ip>:1111 from the other computer.
serve: generate
	@mkdir -p public
	zola serve --interface 0.0.0.0 --port 1111 --base-url /
