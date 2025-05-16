#!/bin/bash
# Script to update all API URLs from port 5001 to 5002

find ./storyweave/client/src -type f -name "*.js" -exec sed -i '' 's|http://localhost:5001|http://localhost:5002|g' {} \;

echo "Updated all API URLs from port 5001 to port 5002"
