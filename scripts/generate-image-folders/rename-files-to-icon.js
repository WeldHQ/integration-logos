const fs = require("fs");
const path = require("path");

function renameToIcon(filePath) {
  const fileName = path.basename(filePath);
  const fileExt = path.extname(filePath);

  const extensions = [".svg", ".png", ".webp"];

  if (
    fileName.toLowerCase() === "icon" &&
    extensions.includes(fileExt.toLowerCase())
  ) {
    return; // If the file is already named 'icon' and in svg or png format, do nothing
  }

  if (extensions.includes(fileExt.toLowerCase())) {
    const newPath = path.join(path.dirname(filePath), "icon" + fileExt);
    fs.renameSync(filePath, newPath);
    console.log(`Renamed ${fileName} to icon${fileExt}`);
  }
}

function scanDirectory(directory) {
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${directory}: ${err}`);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error reading file ${filePath}: ${err}`);
          return;
        }
        if (stats.isDirectory()) {
          scanDirectory(filePath); // If it's a directory, recursively scan it
        } else {
          renameToIcon(filePath); // If it's a file, check and rename if necessary
        }
      });
    });
  });
}

const startingDirectory = "../../public/images/integrations"; // You can change this to the path of your folder
scanDirectory(startingDirectory);
