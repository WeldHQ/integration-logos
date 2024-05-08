# Function to copy all contents of a folder recursively to another folder
copy_contents_recursive() {
    local source="$1"
    local target="$2"
    # Copy all contents recursively
    rsync -av "$source/" "$target"
}

# Generate the configuration file
npm run build:config

# Build the logos description file
./node_modules/typescript/bin/tsc -p logos/tsconfig.json

# Copy all assets to the dist folder
copy_contents_recursive "./logos/integrations" "./dist/integrations"
