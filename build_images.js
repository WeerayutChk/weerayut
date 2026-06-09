const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // Added sharp for image compression

const IMAGES_DIR = path.join(__dirname, 'images');
const OUTPUT_FILE = path.join(__dirname, 'image_data.js');

const VALID_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
// Maximum width for images to save space
const MAX_WIDTH = 1280; 

// We use an async function to compress an image in-place
async function processImage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    // Skip GIFs as sharp doesn't animate them well without extra config, 
    // and skip webp if we assume they are already compressed.
    if (ext === '.gif') return;

    try {
        const stats = fs.statSync(filePath);
        // Only process if file is larger than 300KB to save time on already small files
        if (stats.size > 300 * 1024) {
            const tempPath = filePath + '.tmp';
            
            await sharp(filePath)
                .resize({ width: MAX_WIDTH, withoutEnlargement: true })
                .jpeg({ quality: 80, force: false }) // force:false means it keeps png as png
                .png({ quality: 80, force: false })
                .webp({ quality: 80, force: false })
                .toFile(tempPath);
                
            // Replace original with compressed version
            fs.renameSync(tempPath, filePath);
            return true; // Indicates it was compressed
        }
    } catch (err) {
        console.error(`Error processing image ${filePath}:`, err.message);
    }
    return false;
}

async function getImagesData(dirPath, globalStats) {
    let imageData = {};

    if (!fs.existsSync(dirPath)) {
        return imageData;
    }

    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    let currentDirFiles = [];
    
    for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        if (item.isDirectory()) {
            // Recursively read subdirectories
            const subData = await getImagesData(fullPath, globalStats);
            imageData = { ...imageData, ...subData };
        } else if (item.isFile()) {
            if (VALID_EXTENSIONS.has(path.extname(item.name).toLowerCase())) {
                // Process the image (compress if necessary)
                const wasCompressed = await processImage(fullPath);
                if (wasCompressed) globalStats.compressedCount++;
                
                currentDirFiles.push(item.name);
            }
        }
    }

    if (currentDirFiles.length > 0) {
        // Use the deepest folder name as the key
        const folderName = path.basename(dirPath);
        
        // Sort naturally
        currentDirFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        
        // Create relative paths from the base 'images' directory
        imageData[folderName] = currentDirFiles.map(file => {
            const relativePath = path.relative(__dirname, dirPath).replace(/\\/g, '/');
            return `${relativePath}/${file}`;
        });
    }

    return imageData;
}

async function build() {
    console.log('Scanning and compressing images... (This might take a few minutes if there are many large images)');
    
    let tree = {};
    let totalImages = 0;
    let globalStats = { compressedCount: 0 };
    
    if (fs.existsSync(IMAGES_DIR)) {
        const rootItems = fs.readdirSync(IMAGES_DIR, { withFileTypes: true });
        
        for (const item of rootItems) {
            if (item.isDirectory() && item.name !== 'logo') {
                const categoryPath = path.join(IMAGES_DIR, item.name);
                const projectsData = await getImagesData(categoryPath, globalStats);
                
                if (Object.keys(projectsData).length > 0) {
                    tree[item.name] = projectsData;
                    for (const proj in projectsData) {
                        totalImages += projectsData[proj].length;
                        console.log(` - [${item.name}] > [${proj}]: found ${projectsData[proj].length} images`);
                    }
                }
            }
        }
    }

    // Export both the nested tree and a flat data array for easy lookup
    const fileContent = `// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.\n// Run 'npm run build' or 'node build_images.js' to update this file.\n\nwindow.IMAGE_TREE = ${JSON.stringify(tree, null, 2)};\n`;
    
    fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf8');
    
    console.log(`\nBuild and Compression successful!`);
    console.log(`Found ${totalImages} images mapped into categories.`);
    console.log(`Successfully compressed ${globalStats.compressedCount} large images.`);
    console.log(`Saved mappings to ${OUTPUT_FILE}`);
}

build();
