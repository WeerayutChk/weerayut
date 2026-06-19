// 3d-scroll.js
// Option B: Per-Card Pixel Explosion (Image Particle Morphing)

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    // --- 1. Three.js Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xF4F2EE, 0.0005); 

    const fov = 75;
    const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 8000);
    
    function updateCameraZ() {
        const cameraZ = (window.innerHeight / 2) / Math.tan((fov / 2) * Math.PI / 180);
        camera.position.z = cameraZ;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    updateCameraZ();

    const isMobileDevice = window.innerWidth <= 600;
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !isMobileDevice });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobileDevice ? 1 : Math.min(window.devicePixelRatio, 2));

    // --- 2. Image Pixel Extraction Logic ---
    function extractPixelsFromImage(c, imgElement, callback) {
        if (!imgElement.complete || imgElement.naturalWidth === 0) {
            const onload = () => {
                imgElement.removeEventListener('load', onload);
                imgElement.removeEventListener('error', onerror);
                doExtract(c, imgElement, callback);
            };
            const onerror = () => {
                imgElement.removeEventListener('load', onload);
                imgElement.removeEventListener('error', onerror);
                doFallback(c, callback);
            };
            imgElement.addEventListener('load', onload);
            imgElement.addEventListener('error', onerror);
        } else {
            doExtract(c, imgElement, callback);
        }
    }

    function doExtract(c, img, callback) {
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
        
        // Use the aspect ratio of the actual card!
        const rect = c.targetEl.getBoundingClientRect();
        let aspect = rect.width / rect.height;
        if (aspect <= 0 || isNaN(aspect)) aspect = 3;
        
        const targetPixels = window.innerWidth <= 600 ? 1000 : 3000;
        let cols = Math.floor(Math.sqrt(targetPixels * aspect));
        let rows = Math.floor(cols / aspect);
        
        if (cols === 0 || rows === 0) { cols = 90; rows = 30; } // Safe fallback
        
        tempCanvas.width = cols;
        tempCanvas.height = rows;
        
        // Fill white/grey background for the card area
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, cols, rows);
        
        let imgData;
        try {
            // Draw image on the canvas at its relative DOM position
            const imgRect = img.getBoundingClientRect();
            if (imgRect.width > 0 && imgRect.height > 0) {
                const rw = cols / rect.width;
                const rh = rows / rect.height;
                const ix = (imgRect.left - rect.left) * rw;
                const iy = (imgRect.top - rect.top) * rh;
                const iw = imgRect.width * rw;
                const ih = imgRect.height * rh;
                ctx.drawImage(img, ix, iy, iw, ih);
            }
            imgData = ctx.getImageData(0, 0, cols, rows).data;
        } catch (e) {
            console.warn("Canvas CORS error, using fallback pixels.");
            return doFallback(c, callback);
        }
        
        const pData = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const idx = (y * cols + x) * 4;
                const r = imgData[idx] / 255;
                const g = imgData[idx+1] / 255;
                const b = imgData[idx+2] / 255;
                const a = imgData[idx+3] / 255;
                
                if (a > 0.1) {
                    pData.push({
                        nx: (x / cols) - 0.5,
                        ny: -((y / rows) - 0.5), // Inverted Y for 3D coordinates
                        color: new THREE.Color(r, g, b)
                    });
                }
            }
        }
        callback(pData);
    }

    function doFallback(c, callback) {
        const pData = [];
        const rect = c.targetEl.getBoundingClientRect();
        let aspect = rect.width / rect.height;
        if (aspect <= 0 || isNaN(aspect)) aspect = 3;
        
        const targetPixels = window.innerWidth <= 600 ? 1000 : 3000;
        let cols = Math.floor(Math.sqrt(targetPixels * aspect));
        let rows = Math.floor(cols / aspect);
        if (cols === 0 || rows === 0) { cols = 90; rows = 30; }
        
        const colorBg = new THREE.Color(0xf8f9fa); // White card bg
        const colorBorder = new THREE.Color(0xe9ecef); // Slightly darker for noise
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                pData.push({
                    nx: (x / cols) - 0.5,
                    ny: -((y / rows) - 0.5),
                    color: Math.random() > 0.8 ? colorBorder : colorBg
                });
            }
        }
        callback(pData);
    }

    // --- 3. Per-Card Particle Systems ---
    const createCircleTexture = () => {
        const tCanvas = document.createElement('canvas');
        tCanvas.width = 32; tCanvas.height = 32;
        const ctx = tCanvas.getContext('2d');
        ctx.beginPath(); ctx.arc(16, 16, 14, 0, Math.PI * 2);
        ctx.fillStyle = 'white'; ctx.fill();
        return new THREE.CanvasTexture(tCanvas);
    };
    const particleTexture = createCircleTexture();

    function createCardParticleSystem(card, pData) {
        const pCount = pData.length;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(pCount * 3);
        const colors = new Float32Array(pCount * 3);
        const chaos = [];
        
        for (let i = 0; i < pCount; i++) {
            // Initial state is exploded (scattered randomly in camera space)
            const cx = (Math.random() - 0.5) * window.innerWidth * 2;
            const cy = (Math.random() - 0.5) * window.innerHeight * 2;
            const cz = (Math.random() - 0.5) * 1500 + 400; // Popping out towards viewer
            
            positions[i*3] = cx;
            positions[i*3+1] = cy;
            positions[i*3+2] = cz;
            
            colors[i*3] = pData[i].color.r;
            colors[i*3+1] = pData[i].color.g;
            colors[i*3+2] = pData[i].color.b;
            
            chaos.push({ dx: cx, dy: cy, dz: cz });
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 3.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.95,
            map: particleTexture,
            alphaTest: 0.1,
            depthWrite: false
        });
        
        const ps = new THREE.Points(geometry, material);
        ps.visible = false; // Hidden initially
        scene.add(ps);
        
        card.particleSystem = ps;
        card.pData = pData;
        card.chaos = chaos;
        card.progress = 0;
    }

    // Initialize all cards
    const domCards = document.querySelectorAll('.reveal-element[data-3d-target="true"]');
    const cards = [];
    
    domCards.forEach((el, idx) => {
        const c = {
            id: idx,
            el: el,
            inViewport: false,
            assembling: false,
            revealed: false,
            visibleSince: 0,
            progress: 0,
            targetEl: el
        };
        
        // Find if this card has an image to use for pixels
        const img = el.querySelector('img');
        if (img) {
            c.targetEl = el; // Assemble onto the entire card rect
            extractPixelsFromImage(c, img, (pData) => {
                if (!c.particleSystem) createCardParticleSystem(c, pData);
            });
        } else {
            // Fallback for text-only cards
            doFallback(c, (pData) => {
                if (!c.particleSystem) createCardParticleSystem(c, pData);
            });
        }
        
        cards.push(c);
    });

    // --- 4. Intersection Observer with Sequential Queue ---
    const pendingCards = [];
    let isProcessingQueue = false;

    function processQueue() {
        if (pendingCards.length === 0) {
            isProcessingQueue = false;
            return;
        }
        isProcessingQueue = true;
        
        // Sort pending cards visually Top-to-Bottom, Left-to-Right
        pendingCards.sort((a, b) => {
            const rectA = a.el.getBoundingClientRect();
            const rectB = b.el.getBoundingClientRect();
            if (Math.abs(rectA.top - rectB.top) > 50) return rectA.top - rectB.top;
            return rectA.left - rectB.left;
        });
        
        const c = pendingCards.shift();
        
        if (c.inViewport && !c.assembling) {
            c.assembling = true;
            c.visibleSince = Date.now();
            c.revealed = false;
        }
        
        // 400ms stagger for the next card assembly
        setTimeout(processQueue, 400); 
    }

    const observer = new IntersectionObserver((entries) => {
        let queueChanged = false;
        entries.forEach(entry => {
            const c = cards.find(x => x.el === entry.target);
            if (!c) return;
            
            if (entry.isIntersecting) {
                if (c.leaveTimeout) {
                    clearTimeout(c.leaveTimeout);
                    c.leaveTimeout = null;
                }
                c.inViewport = true;
                if (!c.assembling && !pendingCards.includes(c)) {
                    pendingCards.push(c);
                    queueChanged = true;
                }
            } else {
                c.leaveTimeout = setTimeout(() => {
                    c.inViewport = false;
                    c.assembling = false;
                    c.revealed = false;
                    c.el.classList.remove('is-visible');
                    
                    const qIdx = pendingCards.indexOf(c);
                    if (qIdx !== -1) pendingCards.splice(qIdx, 1);
                }, 500); // 500ms debounce to prevent layout shift glitches
            }
        });
        
        if (queueChanged && !isProcessingQueue) {
            processQueue();
        }
    }, { threshold: 0.1 });

    cards.forEach(c => observer.observe(c.el));

    const resizeObserver = new ResizeObserver(() => {
        updateCameraZ();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    resizeObserver.observe(document.body);

    // --- 5. Animation & Physics Loop ---
    let mouseX = 0;
    let mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const time = clock.getElapsedTime();
        const now = Date.now();
        const innerW = window.innerWidth;
        const innerH = window.innerHeight;

        cards.forEach(c => {
            if (!c.particleSystem) return;
            
            // Handle DOM Reveal
            if (c.assembling && !c.revealed && (now - c.visibleSince > 1000)) {
                c.revealed = true;
                c.el.classList.add('is-visible');
            }
            
            // Handle Progress Lerp & Opacity Fading
            if (c.assembling) {
                c.progress += (1.0 - c.progress) * 0.05;
                c.particleSystem.visible = true;
                
                if (c.revealed) {
                    // Fade out slowly after the real image appears
                    c.particleSystem.material.opacity -= 0.03;
                    if (c.particleSystem.material.opacity <= 0) {
                        c.particleSystem.material.opacity = 0;
                        c.particleSystem.visible = false;
                    }
                } else {
                    // Fade in while assembling
                    c.particleSystem.material.opacity += 0.05;
                    if (c.particleSystem.material.opacity > 0.95) {
                        c.particleSystem.material.opacity = 0.95;
                    }
                }
            } else {
                c.progress += (0.0 - c.progress) * 0.08;
                // Fade out when scrolled away (disassembling)
                c.particleSystem.material.opacity -= 0.05;
                if (c.particleSystem.material.opacity <= 0) {
                    c.particleSystem.material.opacity = 0;
                    c.particleSystem.visible = false;
                    return; // Skip math when fully hidden
                }
            }
            
            // Target DOM Element bounds
            const rect = c.targetEl.getBoundingClientRect();
            const screenTop = rect.top; 
            const screenLeft = rect.left;
            
            const centerX = -innerW/2 + screenLeft + rect.width / 2;
            const centerY = innerH/2 - (screenTop + rect.height / 2);
            
            const positions = c.particleSystem.geometry.attributes.position.array;
            
            // Interpolate particles between Chaos and Assembled
            for (let i = 0; i < c.pData.length; i++) {
                // Target Assembled Position
                const tx = centerX + c.pData[i].nx * rect.width;
                const ty = centerY + c.pData[i].ny * rect.height;
                const tz = 0;
                
                // Exploded Position (fixed relative to camera)
                const ex = c.chaos[i].dx;
                const ey = c.chaos[i].dy;
                const ez = c.chaos[i].dz;
                
                const p = c.progress;
                
                // Add gentle floaty effect when assembled
                const floatY = Math.sin(time * 2 + i) * 2 * p;
                
                // Smooth Lerp
                positions[i*3] = ex + (tx - ex) * p;
                positions[i*3+1] = ey + (ty - ey) * p + floatY;
                positions[i*3+2] = ez + (tz - ez) * p;
            }
            
            c.particleSystem.geometry.attributes.position.needsUpdate = true;
        });

        const targetCamX = mouseX * 0.08;
        const targetCamY = mouseY * 0.08;
        camera.position.x += (targetCamX - camera.position.x) * 0.05;
        camera.position.y += (-targetCamY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }
    
    animate();
});
