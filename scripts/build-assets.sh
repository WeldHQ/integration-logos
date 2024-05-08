# Generate the configuration file
npm run build:config

# Build the logos description file
./node_modules/typescript/bin/tsc -p logos/tsconfig.json

# Copy all image files to the dist folder
./node_modules/tsx/dist/cli.mjs ./scripts/flat-copy-image-files.ts ./logos/integrations ./dist
