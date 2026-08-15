// gallery.js
// Configuration:
// - Create /images/index.json (JSON array of filenames). The gallery will
//   prefer that file first and fall back to the IMAGES array if missing.
// - Set RANDOMIZE to true to shuffle on load.

const IMAGES = [
    // Optional fallback list, e.g. 'photo1.jpg'
];

const IMAGES_JSON = 'images/index.json';
let RANDOMIZE = true;

function imageUrl(filename) {
    return `images/${encodeURIComponent(filename)}`;
}

function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

async function loadImageList() {
    // Prefer the generated images/index.json so the gallery auto-updates
    try {
        const res = await fetch(IMAGES_JSON, { cache: 'no-cache' });
        if (res.ok) {
            const list = await res.json();
            if (Array.isArray(list) && list.length) return list.slice();
        }
    } catch (e) {
        // ignore and try fallback
    }

    // Fallback: use explicit IMAGES array if provided
    if (IMAGES && IMAGES.length) return IMAGES.slice();

    return [];
}

function renderGallery(list) {
    const container = document.getElementById('gallery');
    container.innerHTML = '';
    if (!list || !list.length) {
        container.innerHTML = '<p style="opacity:.7">No images found. Add files to the <strong>images/</strong> folder or populate images/index.json.</p>';
        return;
    }
    list.forEach((filename, idx) => {
        const link = document.createElement('a');
        link.className = 'masonry-item';
        link.href = imageUrl(filename);
        link.dataset.index = idx;
        link.dataset.filename = filename;
        link.rel = 'noopener';

        const img = document.createElement('img');
        img.src = imageUrl(filename);
        img.alt = filename;
        img.loading = 'lazy';

        link.appendChild(img);
        container.appendChild(link);
    });

    // Attach click handler for lightbox
    container.querySelectorAll('.masonry-item').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const idx = Number(a.dataset.index);
            openLightbox(idx, list);
        });
    });
}

// Lightbox behavior
let _currentList = [];
function openLightbox(index, list) {
    _currentList = list.slice();
    const src = imageUrl(list[index]);
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    img.src = src; img.alt = list[index];
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    lb.dataset.index = index;
    // prevent background scroll
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
    img.src = '';
    document.body.style.overflow = '';
}

function showNeighbor(delta) {
    const lb = document.getElementById('lightbox');
    let idx = Number(lb.dataset.index || 0);
    idx = (idx + delta + _currentList.length) % _currentList.length;
    lb.dataset.index = idx;
    const img = document.getElementById('lightboxImg');
    img.src = imageUrl(_currentList[idx]);
    img.alt = _currentList[idx];
}

function setupLightboxControls() {
    const lb = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => showNeighbor(-1));
    nextBtn.addEventListener('click', () => showNeighbor(1));

    // close when clicking outside image
    lb.addEventListener('click', (e) => {
        if (e.target.id === 'lightbox' || e.target.id === 'lightboxCenter') closeLightbox();
    });

    // keyboard
    document.addEventListener('keydown', (e) => {
        if (!document.getElementById('lightbox').classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showNeighbor(-1);
        if (e.key === 'ArrowRight') showNeighbor(1);
    });
}

async function initGallery() {
    let list = await loadImageList();
    if (RANDOMIZE) list = shuffleArray(list);
    renderGallery(list);
}

// expose controls for the page
window.gallery = {
    init: initGallery,
    shuffle() {
        RANDOMIZE = true;
        initGallery();
    },
    unshuffle() {
        RANDOMIZE = false;
        initGallery();
    },
    toggleRandom() {
        RANDOMIZE = !RANDOMIZE;
        initGallery();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('shuffleBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            gallery.toggleRandom();
        });
    }
    setupLightboxControls();
    gallery.init();
});

