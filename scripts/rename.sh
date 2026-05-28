#!/usr/bin/env bash
# Rename the placeholder name in the entire monorepo.
# Usage: ./scripts/rename.sh <kebab-name> <DisplayName>
# Example: ./scripts/rename.sh kidsy Kidsy
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: $0 <kebab-name> <DisplayName>"
  echo "Example: $0 kidsy Kidsy"
  exit 1
fi

KEBAB="$1"        # e.g. kidsy
DISPLAY="$2"      # e.g. Kidsy
UPPER=$(echo "$KEBAB" | tr '[:lower:]' '[:upper:]')

echo "Renaming:"
echo "  yourapp  -> $KEBAB"
echo "  YourApp  -> $DISPLAY"
echo

# Files to search (skip node_modules, builds, .git, this script itself)
find . \
  -type d \( -name node_modules -o -name .next -o -name .expo -o -name .turbo -o -name .git -o -name dist \) -prune -o \
  -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.toml" -o -name "*.yaml" -o -name "*.yml" -o -name "*.html" -o -name "*.css" -o -name "*.sql" -o -name "*.sh" -o -name ".env.example" -o -name ".gitignore" \) -print | while read -r f; do
    if [ "$f" = "./scripts/rename.sh" ]; then continue; fi
    # macOS sed needs -i ''; Linux sed needs -i. Detect.
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' -e "s/yourapp/$KEBAB/g" -e "s/YourApp/$DISPLAY/g" "$f"
    else
      sed -i -e "s/yourapp/$KEBAB/g" -e "s/YourApp/$DISPLAY/g" "$f"
    fi
done

# Rename any files/dirs that contain the placeholder
find . -depth -name "*yourapp*" -not -path "*/node_modules/*" -not -path "*/.git/*" | while read -r path; do
  newpath=$(echo "$path" | sed -e "s/yourapp/$KEBAB/g")
  mv "$path" "$newpath"
done

echo
echo "Done. Don't forget to:"
echo "  - Update apps/mobile/app.json bundleIdentifier + package"
echo "  - Update apps/web public title in app/[locale]/layout.tsx"
echo "  - Replace placeholder hero gradient with real photography"
echo "  - Drop a real logo into apps/web/public + apps/mobile/assets"
