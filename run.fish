#!/bin/fish

cd (dirname (status filename)) || exit 1

set -q XDG_RUNTIME_DIR && set -l bundle_dir $XDG_RUNTIME_DIR || set -l bundle_dir /tmp
set -q XDG_CACHE_HOME && set -l cache_dir $XDG_CACHE_HOME/caelestia || set -l cache_dir $HOME/.cache/caelestia
set -q XDG_STATE_HOME && set -l state_dir $XDG_STATE_HOME/caelestia || set -l state_dir $HOME/.local/state/caelestia

mkdir -p $cache_dir

./node_modules/.bin/esbuild app.tsx --bundle --minify-whitespace --minify-identifiers --outfile=$bundle_dir/caelestia.js \
    --external:console --external:system --external:cairo --external:gettext --external:'file://*' --external:'gi://*' --external:'resource://*' \
    --define:HOME=\"$HOME\" --define:CACHE=\"$cache_dir\" --define:STATE=\"$state_dir\" --define:SRC=\"(pwd)\" --format=esm --platform=neutral --main-fields=module,main

gjs -m $bundle_dir/caelestia.js
