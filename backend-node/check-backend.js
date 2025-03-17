const fs = require('fs');
const path = require('path');

// Find server.js or app.js
const serverFiles = ['server.js', 'app.js', 'index.js'];
let foundServerFile = null;

for (const file of serverFiles) {
  if (fs.existsSync(path.join(__dirname, file))) {
    foundServerFile = file;
    break;
  }
}

if (!foundServerFile) {
  console.error("Couldn't find server file.");
  process.exit(1);
}

// Read the content
const content = fs.readFileSync(path.join(__dirname, foundServerFile), 'utf8');

// Check for port configuration
const portRegex = /(?:const|let|var)\s+PORT\s*=\s*(?:process\.env\.PORT\s*\|\|\s*)?(\d+)/;
const portMatch = content.match(portRegex);

if (portMatch) {
  const port = portMatch[1];
  console.log(`Found port configuration: ${port}`);
  
  if (port !== '5001') {
    console.log(`\nWARNING: Port is set to ${port}, not 5001!`);
    
    // Create a fixed version that uses port 5001
    const fixedContent = content.replace(
      portRegex,
      `const PORT = process.env.PORT || 5001 // Fixed to use port 5001`
    );
    
    // Save backup
    fs.writeFileSync(path.join(__dirname, `${foundServerFile}.bak`), content);
    
    // Write fixed version
    fs.writeFileSync(path.join(__dirname, foundServerFile), fixedContent);
    
    console.log(`\nFixed! Original backed up to ${foundServerFile}.bak`);
    console.log(`Please restart your backend server!`);
  } else {
    console.log("\nBackend port is correctly set to 5001!");
  }
} else {
  console.error("Couldn't find PORT configuration in server file.");
}

// Also check for socket.io CORS configuration
const corsRegex = /cors:\s*{([^}]*)}/;
const corsMatch = content.match(corsRegex);

if (corsMatch) {
  console.log("\nFound CORS configuration:");
  console.log(corsMatch[0]);
  
  if (!corsMatch[0].includes('origin')) {
    console.log("\nWARNING: CORS configuration might be missing origin setting!");
  }
} else {
  console.log("\nWARNING: No explicit CORS configuration found for socket.io!");
}

console.log("\nBackend check complete!");
