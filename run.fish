#!/bin/fish

cd (dirname (status filename)) || exit 1

set -q XDG_RUNTIME_DIR && set bundle_dir $XDG_RUNTIME_DIR || set bundle_dir /tmp
set -q XDG_CACHE_HOME && set cache_dir $XDG_CACHE_HOME/caelestia || set cache_dir $HOME/.cache/caelestia

mkdir -p $cache_dir

./node_modules/.bin/esbuild app.tsx --bundle --outfile=$bundle_dir/caelestia.js \
    --external:console --external:system --external:cairo --external:gettext --external:'file://*' --external:'gi://*' --external:'resource://*' \
    --define:HOME=\"$HOME\" --define:CACHE=\"$cache_dir\" --define:SRC=\"(pwd)\" --format=esm --platform=neutral --main-fields=module,main

gjs -m $bundle_dir/caelestia.js
