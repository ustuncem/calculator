#!/bin/sh
set -eu

base_url=${1%/}
html=$(curl --fail --silent --show-error --retry 10 --retry-delay 1 --retry-all-errors "$base_url/")
script=$(printf '%s\n' "$html" | sed -n 's|.*<script[^>]* src="\(/assets/[^"]*\.js\)".*|\1|p')
test -n "$script"
curl --fail --silent --show-error --output /dev/null "$base_url$script"
