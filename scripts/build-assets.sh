# Function to copy all contents of a folder recursively to another folder
copy_contents_recursive() {
    local source="$1"
    local target="$2"

    # Copy all contents recursively
    rsync -av "$source/" "$target"
}

copy_contents_recursive "./logos" "./dist"
copy_contents_recursive "./types" "./dist"