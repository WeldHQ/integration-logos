const fs = require("fs");
const path = require("path");

// Function to create folder for each word
function createFolders(filePath) {
  // Read the file asynchronously
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    // Split the file content into an array of words
    const words = data.split("\n").map((word) => word.trim());

    // Create a folder for each word
    words.forEach((word) => {
      // Create the folder synchronously
      fs.mkdirSync(
        `../../public/images/integrations/${word}`,
        { recursive: true },
        (err) => {
          if (err) {
            console.error("Error creating folder:", err);
            return;
          }
          console.log(`Folder "${word}" created successfully.`);
        }
      );
    });
  });
}

// Path to the file containing list of words
const filePath = path.join(__dirname, "integration-ids.txt");

// Call the function to create folders
createFolders(filePath);
