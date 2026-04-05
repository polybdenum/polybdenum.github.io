#!/bin/bash
set -euo pipefail

if [ $# -ne 1 ]; then
    echo "Usage: $0 <search-string>" >&2
    exit 1
fi

matches=()
for f in _drafts/*; do
    [ -e "$f" ] || continue
    if [[ "$f" == *"$1"* ]]; then
        matches+=("$f")
    fi
done

if [ ${#matches[@]} -eq 0 ]; then
    echo "No drafts matching '$1'" >&2
    exit 1
elif [ ${#matches[@]} -gt 1 ]; then
    echo "Multiple drafts matching '$1':" >&2
    printf '  %s\n' "${matches[@]}" >&2
    exit 1
fi

echo "Publishing ${matches[0]}"
bundle exec jekyll publish "${matches[0]}"
