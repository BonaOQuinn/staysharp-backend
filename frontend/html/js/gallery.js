// ==================== GALLERY PAGE SCRIPT ====================
// Dynamically loads all 82 images from Supabase bucket for the gallery.html page

// Supabase configuration
const SUPABASE_URL = 'https://txioesoxmxprlhnivcle.supabase.co';
const SUPABASE_BUCKET = 'staysharp_rotation';
const SUPABASE_FOLDER = 'Gallery';

// Gallery configuration
const GALLERY_CONFIG = {
    // Total number of images in the Gallery folder
    totalImages: 82,
    // Image naming pattern: sssimg-001.png through sssimg-082.png
    imagePrefix: 'sssimg-',
    imageExtension: '.png',
    // Category assignments (customize based on your actual categorization)
    categories: {
        haircuts: [1, 2, 3, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55, 58, 61, 64, 67, 70, 73, 76, 79, 82],
        beard: [5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50, 53, 56, 59, 62, 65, 68, 71, 74, 77, 80],
        vibes: [6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81]
    }
};

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
    console.log('🎨 Initializing gallery with 82 images...');

    try {
        // Generate image data for all 82 images
        allImages = generateImageData();
        console.log(`✅ Generated ${allImages.length} images`);

        // Render the gallery
        renderGallery();

        // Setup filter buttons
        setupFilters();

        // Setup lightbox
        setupLightbox();

        console.log('✅ Gallery initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing gallery:', error);
        showError();
    }
}

// Generate image data for all 82 images
function generateImageData() {
    const images = [];

    for (let i = 1; i <= GALLERY_CONFIG.totalImages; i++) {
        const paddedNumber = String(i).padStart(3, '0');
        const filename = `${GALLERY_CONFIG.imagePrefix}${paddedNumber}${GALLERY_CONFIG.imageExtension}`;

        // Determine category
        let category = 'vibes'; // default
        if (GALLERY_CONFIG.categories.haircuts.includes(i)) {
            category = 'haircuts';
        } else if (GALLERY_CONFIG.categories.beard.includes(i)) {
            category = 'beard';
        }

        images.push({
            id: i,
            filename: filename,
            category: category,
            alt: `Stay Sharp barbershop - ${category} ${i}`
        });
    }

    return images;
}

// Generate Supabase public URL
function getPublicUrl(filename) {
    // Using public URL access (no signed URL needed if bucket is public)
    return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${SUPABASE_FOLDER}/${filename}`;
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