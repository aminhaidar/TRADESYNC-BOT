#!/bin/bash
# Find all JavaScript files containing the port reference and update them
grep -l "localhost:5000" $(find . -type f -name "*.js" -o -name "*.jsx" -o -name "*.json") | while read file; do
  echo "Updating $file"
  # Make a backup
  cp "$file" "${file}.bak"
  # Replace all instances of localhost:5000 with localhost:5001
  sed -i '' 's/localhost:5000/localhost:5001/g' "$file"
done
echo "Port update complete!"
