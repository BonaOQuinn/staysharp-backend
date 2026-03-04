// ==================== GALLERY PAGE SCRIPT ====================
// Automatically fetches ALL images from Supabase Gallery folder

// Supabase configuration
const SUPABASE_URL = 'https://txioesoxmxprlhnivcle.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4aW9lc294bXhwcmxobml2Y2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MjcyMjUsImV4cCI6MjA4NjQwMzIyNX0._tmjg6n9BlAjrMZVvPwjg3hsmCZIOvJifo_slurLQd8'; // You'll need to add this
const SUPABASE_BUCKET = 'staysharp_rotation';
const SUPABASE_FOLDER = 'Gallery';

// State management
let allImages = [];
let currentFilter = 'all';
let currentLightboxIndex = 0;

// Initialize gallery on page load
(function() {
    'use strict';

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGallery);
    } else {
        initGallery();
    }
})();

async function initGallery() {
    console.log('🎨 Initializing gallery...');

    try {
        // Fetch all images from Supabase bucket
        await fetchAllImages();
        console.log(`✅ Loaded ${allImages.length} images`);

        // Render the gallery
        renderGallery();

        // Setup filter buttons
        setupFilters();

        // Setup lightbox
        setupLightbox();

        console.log('✅ Gallery initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing gallery:', error);
        showError(error.message);
    }
}

// Fetch all images from Supabase Storage
async function fetchAllImages() {
    try {
        // Option 1: Using Supabase Storage API to list files
        const response = await fetch(
            `${SUPABASE_URL}/storage/v1/object/list/${SUPABASE_BUCKET}?prefix=${SUPABASE_FOLDER}/`,
            {
                headers: {
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'apikey': SUPABASE_ANON_KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch images: ${response.status}`);
        }

        const files = await response.json();
        console.log('📁 Found files:', files);

        // Filter for image files only and create image objects
        allImages = files
            .filter(file => {
                const ext = file.name.toLowerCase();
                return ext.endsWith('.jpg') || 
                       ext.endsWith('.jpeg') || 
                       ext.endsWith('.png') || 
                       ext.endsWith('.webp');
            })
            .map((file, index) => {
                // Auto-categorize based on filename patterns (customize as needed)
                let category = 'vibes'; // default
                const filename = file.name.toLowerCase();
                
                if (filename.includes('cut') || filename.includes('fade') || filename.includes('hair') || filename.includes('blend')) {
                    category = 'haircuts';
                } else if (filename.includes('beard') || filename.includes('trim')) {
                    category = 'beard';
                }

                return {
                    id: index + 1,
                    filename: file.name,
                    fullPath: `${SUPABASE_FOLDER}/${file.name}`,
                    category: category,
                    alt: `Stay Sharp barbershop - ${file.name.replace(/\.(jpg|jpeg|png|webp)$/i, '')}`
                };
            });

        console.log(`✅ Processed ${allImages.length} image files`);
        
    } catch (error) {
        console.error('❌ Error fetching images:', error);
        
        // Fallback: If API fails, try using known filenames
        console.log('⚠️ Falling back to public URL access...');
        await fetchImagesPublicFallback();
    }
}

// Fallback method: Try to load images using public URLs
async function fetchImagesPublicFallback() {
    // List of your known filenames from the screenshot
    const knownFiles = [
        'adrian-blends.jpg',
        'diego-holder.jpg',
        'dno.jpg',
        'fadesbyluis.jpg',
        'gerard.jpg',
        'gucci_cut.jpg',
        'gucci_cut2.png',
        'howto.jpg',
        'JD_cut.png',
        'jpkuttz.jpg',
        'nolen.jpg',
        'otawni.jpg',
        'RG_cut.png'
    ];

    allImages = knownFiles.map((filename, index) => {
        let category = 'vibes';
        const name = filename.toLowerCase();
        
        if (name.includes('cut') || name.includes('fade') || name.includes('blend')) {
            category = 'haircuts';
        }

        return {
            id: index + 1,
            filename: filename,
            fullPath: `${SUPABASE_FOLDER}/${filename}`,
            category: category,
            alt: `Stay Sharp barbershop - ${filename.replace(/\.(jpg|jpeg|png|webp)$/i, '')}`
        };
    });

    console.log(`✅ Using fallback with ${allImages.length} images`);
}

// Generate Supabase public URL
function getPublicUrl(fullPath) {
    return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${fullPath}`;
}

// Render the gallery grid
function renderGallery(filter = 'all') {
    const grid = document.getElementById('masonryGrid');
    if (!grid) return;

    currentFilter = filter;

    // Filter images based on category
    const filteredImages = filter === 'all' 
        ? allImages 
        : allImages.filter(img => img.category === filter);

    console.log(`📸 Rendering ${filteredImages.length} images for filter: ${filter}`);

    // Clear existing content
    grid.innerHTML = '';

    if (filteredImages.length === 0) {
        grid.innerHTML = '<div class="gallery-status"><p>No images found in this category.</p></div>';
        return;
    }

    // Create masonry items
    filteredImages.forEach((image, index) => {
        const item = document.createElement('div');
        item.className = 'masonry-item';
        item.setAttribute('data-category', image.category);
        item.setAttribute('data-index', index);
        
        const img = document.createElement('img');
        img.src = getPublicUrl(image.fullPath);
        img.alt = image.alt;
        img.loading = 'lazy';
        
        // Handle image load errors
        img.onerror = function() {
            console.error('Failed to load image:', image.filename);
            this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
        };
        
        const overlay = document.createElement('div');
        overlay.className = 'item-overlay';
        overlay.innerHTML = `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
        `;
        
        // Add click handler to open lightbox
        item.addEventListener('click', () => openLightbox(index));
        
        item.appendChild(img);
        item.appendChild(overlay);
        grid.appendChild(item);
    });
}

// Setup filter button functionality
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value and render
            const filter = this.getAttribute('data-filter');
            renderGallery(filter);
        });
    });
}

// Setup lightbox functionality
function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    
    // Prevent clicks on lightbox content from closing it
    lightbox.addEventListener('click', function(e) {
        if (e.target === this) {
            closeLightbox();
        }
    });
}

// Open lightbox with image at index
function openLightbox(index) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    
    if (!lightbox || !lightboxImg) return;
    
    // Get filtered images based on current filter
    const filteredImages = currentFilter === 'all'
        ? allImages
        : allImages.filter(img => img.category === currentFilter);
    
    const image = filteredImages[index];
    if (!image) return;
    
    currentLightboxIndex = index;
    lightboxImg.src = getPublicUrl(image.fullPath);
    lightboxImg.alt = image.alt;
    lightbox.classList.add('open');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

// Close lightbox
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
}

// Show previous image
function showPrevImage() {
    const filteredImages = currentFilter === 'all'
        ? allImages
        : allImages.filter(img => img.category === currentFilter);
    
    currentLightboxIndex = (currentLightboxIndex - 1 + filteredImages.length) % filteredImages.length;
    
    const image = filteredImages[currentLightboxIndex];
    const lightboxImg = document.getElementById('lightboxImg');
    
    if (lightboxImg && image) {
        lightboxImg.style.opacity = '0.4';
        setTimeout(() => {
            lightboxImg.src = getPublicUrl(image.fullPath);
            lightboxImg.alt = image.alt;
            lightboxImg.style.opacity = '1';
        }, 150);
    }
}

// Show next image
function showNextImage() {
    const filteredImages = currentFilter === 'all'
        ? allImages
        : allImages.filter(img => img.category === currentFilter);
    
    currentLightboxIndex = (currentLightboxIndex + 1) % filteredImages.length;
    
    const image = filteredImages[currentLightboxIndex];
    const lightboxImg = document.getElementById('lightboxImg');
    
    if (lightboxImg && image) {
        lightboxImg.style.opacity = '0.4';
        setTimeout(() => {
            lightboxImg.src = getPublicUrl(image.fullPath);
            lightboxImg.alt = image.alt;
            lightboxImg.style.opacity = '1';
        }, 150);
    }
}

// Show error state
function showError(message) {
    const grid = document.getElementById('masonryGrid');
    if (!grid) return;
    
    grid.innerHTML = `
        <div class="gallery-status">
            <p>❌ Failed to load gallery.</p>
            <p style="font-size: 0.9rem; margin-top: 0.5rem;">${message || 'Please refresh the page.'}</p>
        </div>
    `;
}

// Make functions globally available
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.showPrevImage = showPrevImage;
window.showNextImage = showNextImage;

// Render the gallery grid
function renderGallery(filter = 'all') {
    const grid = document.getElementById('masonryGrid');
    if (!grid) return;

    currentFilter = filter;

    // Filter images based on category
    const filteredImages = filter === 'all' 
        ? allImages 
        : allImages.filter(img => img.category === filter);

    console.log(`📸 Rendering ${filteredImages.length} images for filter: ${filter}`);

    // Clear existing content
    grid.innerHTML = '';

    if (filteredImages.length === 0) {
        grid.innerHTML = '<div class="gallery-status"><p>No images found in this category.</p></div>';
        return;
    }

    // Create masonry items
    filteredImages.forEach((image, index) => {
        const item = document.createElement('div');
        item.className = 'masonry-item';
        item.setAttribute('data-category', image.category);
        item.setAttribute('data-index', index);
        
        const img = document.createElement('img');
        img.src = getPublicUrl(image.filename);
        img.alt = image.alt;
        img.loading = 'lazy';
        
        const overlay = document.createElement('div');
        overlay.className = 'item-overlay';
        overlay.innerHTML = `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
        `;
        
        // Add click handler to open lightbox
        item.addEventListener('click', () => openLightbox(index));
        
        item.appendChild(img);
        item.appendChild(overlay);
        grid.appendChild(item);
    });
}

// Setup filter button functionality
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value and render
            const filter = this.getAttribute('data-filter');
            renderGallery(filter);
        });
    });
}

// Setup lightbox functionality
function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    
    // Prevent clicks on lightbox content from closing it
    lightbox.addEventListener('click', function(e) {
        if (e.target === this) {
            closeLightbox();
        }
    });
}

// Open lightbox with image at index
function openLightbox(index) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    
    if (!lightbox || !lightboxImg) return;
    
    // Get filtered images based on current filter
    const filteredImages = currentFilter === 'all'
        ? allImages
        : allImages.filter(img => img.category === currentFilter);
    
    const image = filteredImages[index];
    if (!image) return;
    
    currentLightboxIndex = index;
    lightboxImg.src = getPublicUrl(image.filename);
    lightboxImg.alt = image.alt;
    lightbox.classList.add('open');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

// Close lightbox
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
}

// Show previous image
function showPrevImage() {
    const filteredImages = currentFilter === 'all'
        ? allImages
        : allImages.filter(img => img.category === currentFilter);
    
    currentLightboxIndex = (currentLightboxIndex - 1 + filteredImages.length) % filteredImages.length;
    
    const image = filteredImages[currentLightboxIndex];
    const lightboxImg = document.getElementById('lightboxImg');
    
    if (lightboxImg && image) {
        lightboxImg.style.opacity = '0.4';
        setTimeout(() => {
            lightboxImg.src = getPublicUrl(image.filename);
            lightboxImg.alt = image.alt;
            lightboxImg.style.opacity = '1';
        }, 150);
    }
}

// Show next image
function showNextImage() {
    const filteredImages = currentFilter === 'all'
        ? allImages
        : allImages.filter(img => img.category === currentFilter);
    
    currentLightboxIndex = (currentLightboxIndex + 1) % filteredImages.length;
    
    const image = filteredImages[currentLightboxIndex];
    const lightboxImg = document.getElementById('lightboxImg');
    
    if (lightboxImg && image) {
        lightboxImg.style.opacity = '0.4';
        setTimeout(() => {
            lightboxImg.src = getPublicUrl(image.filename);
            lightboxImg.alt = image.alt;
            lightboxImg.style.opacity = '1';
        }, 150);
    }
}

// Show error state
function showError() {
    const grid = document.getElementById('masonryGrid');
    if (!grid) return;
    
    grid.innerHTML = `
        <div class="gallery-status">
            <p>❌ Failed to load gallery. Please refresh the page.</p>
        </div>
    `;
}

// Make functions globally available
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.showPrevImage = showPrevImage;
window.showNextImage = showNextImage;