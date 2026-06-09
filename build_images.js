const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // Make sure to run 'npm install sharp'

const IMAGES_DIR = path.join(__dirname, 'images');
const OPTIMIZED_DIR = path.join(__dirname, 'optimized_images');
const OUTPUT_FILE = path.join(__dirname, 'image_data.js');

const VALID_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

// Ensure optimized directory exists
if (!fs.existsSync(OPTIMIZED_DIR)) {
    fs.mkdirSync(OPTIMIZED_DIR, { recursive: true });
}

async function processImage(inputPath, relativePath, fileName) {
    const parsedPath = path.parse(fileName);
    const outFileName = `${parsedPath.name}.webp`; // Always output as webp
    
    // Create subfolder structure in optimized_images
    const outDirPath = path.join(OPTIMIZED_DIR, relativePath);
    if (!fs.existsSync(outDirPath)) {
        fs.mkdirSync(outDirPath, { recursive: true });
    }

    const outputPath = path.join(outDirPath, outFileName);

    // Skip if the optimized file already exists (to save time on subsequent builds)
    if (!fs.existsSync(outputPath)) {
        try {
            await sharp(inputPath)
                .resize({ width: 1920, withoutEnlargement: true }) // Max width 1920px
                .webp({ quality: 80 }) // 80% quality webp compression
                .toFile(outputPath);
            console.log(`[Optimized] ${path.join(relativePath, outFileName)}`);
        } catch (err) {
            console.error(`[Error] Failed to process ${inputPath}:`, err);
        }
    }

    // Return the relative web path for the frontend (e.g. "optimized_images/donaus/foo/bar.webp")
    return `optimized_images/${relativePath.replace(/\\/g, '/')}/${outFileName}`;
}

async function build() {
    console.log('Scanning and optimizing images... This may take a while the first time.');
    
    let tree = {};
    let totalImages = 0;
    
    if (fs.existsSync(IMAGES_DIR)) {
        const rootItems = fs.readdirSync(IMAGES_DIR, { withFileTypes: true });
        
        for (const item of rootItems) {
            if (item.isDirectory() && item.name !== 'logo') {
                const categoryName = item.name;
                const categoryPath = path.join(IMAGES_DIR, categoryName);
                
                const projects = fs.readdirSync(categoryPath, { withFileTypes: true });
                tree[categoryName] = {};

                for (const projFolder of projects) {
                    if (projFolder.isDirectory()) {
                        const projName = projFolder.name;
                        const projPath = path.join(categoryPath, projName);
                        
                        const files = fs.readdirSync(projPath, { withFileTypes: true });
                        
                        // Filter valid images and sort naturally
                        let imageFiles = files
                            .filter(f => f.isFile() && VALID_EXTENSIONS.has(path.extname(f.name).toLowerCase()))
                            .map(f => f.name)
                            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

                        if (imageFiles.length > 0) {
                            tree[categoryName][projName] = [];
                            for (const imgName of imageFiles) {
                                const inputPath = path.join(projPath, imgName);
                                const relPath = path.join(categoryName, projName);
                                
                                // Process and get the new path
                                const finalWebPath = await processImage(inputPath, relPath, imgName);
                                tree[categoryName][projName].push(finalWebPath);
                                totalImages++;
                            }
                            console.log(` - [${categoryName}] > [${projName}]: processed ${imageFiles.length} images`);
                        }
                    }
                }
            }
        }
    }

    // Export both the nested tree and a flat data array for easy lookup
    const fileContent = `// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.\n// Run 'npm run build' or 'node build_images.js' to update this file.\n\nwindow.IMAGE_TREE = ${JSON.stringify(tree, null, 2)};\n`;
    
    fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf8');
    
    console.log(`\nBuild successful!`);
    console.log(`Processed ${totalImages} images into 'optimized_images' folder.`);
    console.log(`Saved mappings to ${OUTPUT_FILE}`);
}

build();
