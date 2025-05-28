// Global state management
const AppState = {
    currentStep: 1,
    selections: {
        productType: null,
        category: null,
        colorScheme: 'white-gray',
        finish: 'matte',
        logoShape: 'circle',
        specialFeatures: ''
    },
    history: [],
    currentImage: null,
    isGenerating: false
};

// Configuration
const CONFIG = {
    API_ENDPOINT: '/api/generate-mockup.php',
    DOWNLOAD_ENDPOINT: '/api/download.php',
    MAX_HISTORY: 20,
    RATE_LIMIT_MESSAGE: 'You have reached the hourly limit. Please try again later.',
    STORAGE_KEY: 'mockupgen_history'
};

// Product configurations
const PRODUCT_CONFIG = {
    bottle: {
        subtypes: ['spray bottle', 'pump bottle', 'squeeze bottle'],
        defaultSize: 'standard 16oz'
    },
    box: {
        subtypes: ['folding carton', 'rigid box', 'display box'],
        defaultSize: 'medium rectangular'
    },
    tube: {
        subtypes: ['squeeze tube', 'airless pump tube', 'standing tube'],
        defaultSize: '6oz tube'
    },
    pouch: {
        subtypes: ['stand-up pouch', 'flat pouch', 'spout pouch'],
        defaultSize: 'medium pouch'
    },
    jar: {
        subtypes: ['wide-mouth jar', 'cosmetic jar', 'twist-top jar'],
        defaultSize: '8oz jar'
    },
    canister: {
        subtypes: ['cylindrical canister', 'rectangular canister', 'shaker canister'],
        defaultSize: 'standard canister'
    }
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadHistory();
    attachEventListeners();
    checkRateLimit();
});

// Application initialization
function initializeApp() {
    // Load saved state if exists
    const savedState = localStorage.getItem('mockupgen_state');
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            Object.assign(AppState.selections, parsed);
        } catch (e) {
            console.error('Failed to load saved state:', e);
        }
    }
    
    // Set initial UI state
    updateStepVisibility();
    updateProgressIndicator();
}

// Event listener setup
function attachEventListeners() {
    // Product type selection
    document.querySelectorAll('.product-type').forEach(btn => {
        btn.addEventListener('click', function() {
            selectProductType(this.dataset.type);
        });
    });
    
    // Category selection
    document.querySelectorAll('.category-type').forEach(btn => {
        btn.addEventListener('click', function() {
            selectCategory(this.dataset.category);
        });
    });
    
    // Style options
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', function() {
            selectOption('color', this.dataset.color, '.color-option');
        });
    });
    
    document.querySelectorAll('.finish-option').forEach(btn => {
        btn.addEventListener('click', function() {
            selectOption('finish', this.dataset.finish, '.finish-option');
        });
    });
    
    document.querySelectorAll('.shape-option').forEach(btn => {
        btn.addEventListener('click', function() {
            selectOption('shape', this.dataset.shape, '.shape-option');
        });
    });
    
    // Special features
    document.getElementById('special-features').addEventListener('input', function() {
        AppState.selections.specialFeatures = sanitizeInput(this.value);
        saveState();
    });
    
    // Generate button
    document.getElementById('generate-btn').addEventListener('click', generateMockup);
    
    // Tool buttons
    document.getElementById('download-btn')?.addEventListener('click', downloadImage);
    document.getElementById('regenerate-btn')?.addEventListener('click', regenerateMockup);
    document.getElementById('new-mockup-btn')?.addEventListener('click', startNewMockup);
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNav);
}

// Selection handlers
function selectProductType(type) {
    AppState.selections.productType = type;
    
    // Update UI
    document.querySelectorAll('.product-type').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.type === type);
    });
    
    // Progress to next step
    AppState.currentStep = 2;
    updateStepVisibility();
    updateProgressIndicator();
    saveState();
}

function selectCategory(category) {
    AppState.selections.category = category;
    
    // Update UI
    document.querySelectorAll('.category-type').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.category === category);
    });
    
    // Progress to next step
    AppState.currentStep = 3;
    updateStepVisibility();
    updateProgressIndicator();
    saveState();
}

function selectOption(type, value, selector) {
    AppState.selections[type === 'color' ? 'colorScheme' : type === 'shape' ? 'logoShape' : type] = value;
    
    // Update UI
    document.querySelectorAll(selector).forEach(btn => {
        btn.classList.toggle('active', btn.dataset[type] === value);
    });
    
    saveState();
}

// Mockup generation
async function generateMockup() {
    if (AppState.isGenerating) return;
    
    // Validate selections
    if (!validateSelections()) {
        showError('Please complete all required selections.');
        return;
    }
    
    AppState.isGenerating = true;
    updateGenerateButton(true);
    
    try {
        // Build prompt
        const prompt = buildPrompt();
        
        // Make API request
        const response = await fetch(CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                selections: AppState.selections,
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Handle successful generation
        handleGenerationSuccess(data);
        
    } catch (error) {
        console.error('Generation failed:', error);
        showError(error.message || 'Failed to generate mockup. Please try again.');
    } finally {
        AppState.isGenerating = false;
        updateGenerateButton(false);
    }
}

// Prompt building
function buildPrompt() {
    const { productType, category, colorScheme, finish, logoShape, specialFeatures } = AppState.selections;
    
    // Get subtype
    const subtypes = PRODUCT_CONFIG[productType].subtypes;
    const selectedSubtype = subtypes[0]; // Can be made selectable
    
    // Color scheme mapping
    const colorSchemes = {
        'white-gray': 'soft white with subtle gray accents',
        'pearl-silver': 'matte pearl white with metallic silver details',
        'pastel-blue': 'light pastel blue with white highlights',
        'beige-cream': 'neutral beige with cream tones'
    };
    
    // Finish mapping
    const finishes = {
        'matte': 'smooth matte plastic finish',
        'glossy': 'high gloss finish with subtle reflection',
        'soft-touch': 'soft-touch coating texture',
        'frosted': 'frosted translucent material'
    };
    
    // Shape mapping
    const shapes = {
        'circle': 'clearly defined blank white circle',
        'rectangle': 'clearly defined blank white rectangular area',
        'square': 'clearly defined blank white square',
        'oval': 'clearly defined blank white oval shape'
    };
    
    // Build the prompt
    let prompt = `Professional product photography of a ${selectedSubtype} for ${category.replace('-', ' ')} consumer product. `;
    prompt += `Clean studio environment with soft directional lighting on pure white background. `;
    prompt += `Container features ${colorSchemes[colorScheme]} with ${finishes[finish]}. `;
    prompt += `A ${shapes[logoShape]} positioned prominently on the front face center for logo placement. `;
    
    if (specialFeatures && specialFeatures.trim()) {
        prompt += `Additional features: ${specialFeatures}. `;
    }
    
    prompt += `Photorealistic commercial product shot, high resolution, neutral staging without any text, branding, or identifying marks. `;
    prompt += `Professional depth of field with crisp product focus. Three-quarter angle view showing dimension and form.`;
    
    return prompt;
}

// Handle successful generation
function handleGenerationSuccess(data) {
    AppState.currentImage = data;
    
    // Update UI
    document.getElementById('generated-image').src = data.imageUrl;
    document.getElementById('detail-type').textContent = 
        AppState.selections.productType.charAt(0).toUpperCase() + 
        AppState.selections.productType.slice(1);
    document.getElementById('detail-category').textContent = 
        AppState.selections.category.replace('-', ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    document.getElementById('detail-color').textContent = 
        document.querySelector(`.color-option[data-color="${AppState.selections.colorScheme}"] span:last-child`).textContent;
    document.getElementById('detail-finish').textContent = 
        document.querySelector(`.finish-option[data-finish="${AppState.selections.finish}"]`).textContent;
    document.getElementById('detail-shape').textContent = 
        document.querySelector(`.shape-option[data-shape="${AppState.selections.logoShape}"] span:last-child`).textContent;
    document.getElementById('detail-timestamp').textContent = 
        new Date(data.timestamp).toLocaleString();
    
    // Show results
    document.getElementById('results').style.display = 'block';
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    
    // Add to history
    addToHistory(data);
}

// Download functionality
async function downloadImage() {
    if (!AppState.currentImage) return;
    
    const btn = document.getElementById('download-btn');
    btn.disabled = true;
    btn.textContent = 'Preparing...';
    
    try {
        // Generate filename
        const filename = generateFilename();
        
        // Trigger download
        const response = await fetch(CONFIG.DOWNLOAD_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageUrl: AppState.currentImage.imageUrl,
                filename: filename
            })
        });
        
        if (!response.ok) {
            throw new Error('Download failed');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Track download
        trackEvent('download', {
            productType: AppState.selections.productType,
            category: AppState.selections.category
        });
        
    } catch (error) {
        console.error('Download failed:', error);
        showError('Failed to download image. Please try again.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Download';
    }
}

// Filename generation
function generateFilename() {
    const { productType, category, colorScheme, finish } = AppState.selections;
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Build descriptive filename
    const parts = [
        category.replace('-', '_'),
        productType,
        colorScheme.replace('-', '_'),
        finish,
        'mockup',
        timestamp
    ];
    
    return parts.join('_') + '.png';
}

// History management
function addToHistory(imageData) {
    const historyItem = {
        ...imageData,
        selections: { ...AppState.selections },
        id: generateId()
    };
    
    AppState.history.unshift(historyItem);
    
    // Limit history size
    if (AppState.history.length > CONFIG.MAX_HISTORY) {
        AppState.history = AppState.history.slice(0, CONFIG.MAX_HISTORY);
    }
    
    // Save to localStorage
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(AppState.history));
    
    // Update UI
    renderHistory();
}

function loadHistory() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (saved) {
            AppState.history = JSON.parse(saved);
            renderHistory();
        }
    } catch (error) {
        console.error('Failed to load history:', error);
    }
}

function renderHistory() {
    const grid = document.getElementById('history-grid');
    grid.innerHTML = '';
    
    AppState.history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <img src="${item.imageUrl}" alt="Previous mockup" loading="lazy">
            <div class="history-item-info">
                <div>${item.selections.category.replace('-', ' ')} ${item.selections.productType}</div>
                <div>${new Date(item.timestamp).toLocaleDateString()}</div>
            </div>
        `;
        
        div.addEventListener('click', () => loadFromHistory(item));
        grid.appendChild(div);
    });
}

// Utility functions
function sanitizeInput(input) {
    // Remove potentially harmful characters
    return input
        .replace(/[<>\"']/g, '')
        .trim()
        .substring(0, 200); // Limit length
}

function validateSelections() {
    const { productType, category } = AppState.selections;
    return productType && category;
}

function updateStepVisibility() {
    document.querySelectorAll('.generation-step').forEach((step, index) => {
        step.classList.toggle('active', index + 1 === AppState.currentStep);
    });
}

function updateProgressIndicator() {
    // Can add visual progress indicator here
}

function updateGenerateButton(isGenerating) {
    const btn = document.getElementById('generate-btn');
    const textSpan = btn.querySelector('.btn-text');
    const loaderSpan = btn.querySelector('.btn-loader');
    
    btn.disabled = isGenerating;
    textSpan.style.display = isGenerating ? 'none' : 'block';
    loaderSpan.style.display = isGenerating ? 'flex' : 'none';
}

function saveState() {
    localStorage.setItem('mockupgen_state', JSON.stringify(AppState.selections));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function showError(message) {
    // Create error toast
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

function trackEvent(event, data) {
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', event, data);
    }
}

// Keyboard navigation
function handleKeyboardNav(e) {
    if (e.key === 'Escape') {
        // Close any open modals
    } else if (e.key === 'Enter' && e.target.tagName === 'BUTTON') {
        e.target.click();
    }
}

// Rate limiting check
async function checkRateLimit() {
    try {
        const response = await fetch('/api/check-rate-limit.php');
        const data = await response.json();
        
        if (data.remaining <= 0) {
            document.getElementById('generate-btn').disabled = true;
            showError(CONFIG.RATE_LIMIT_MESSAGE);
        }
    } catch (error) {
        console.error('Rate limit check failed:', error);
    }
}

// Additional features
function regenerateMockup() {
    generateMockup();
}

function startNewMockup() {
    AppState.currentStep = 1;
    AppState.selections = {
        productType: null,
        category: null,
        colorScheme: 'white-gray',
        finish: 'matte',
        logoShape: 'circle',
        specialFeatures: ''
    };
    
    updateStepVisibility();
    document.getElementById('results').style.display = 'none';
    window.scrollTo(0, 0);
}

function loadFromHistory(item) {
    AppState.selections = { ...item.selections };
    AppState.currentImage = item;
    
    // Update UI to show loaded state
    AppState.currentStep = 3;
    updateStepVisibility();
    
    // Update all selections in UI
    Object.keys(item.selections).forEach(key => {
        if (key === 'specialFeatures') {
            document.getElementById('special-features').value = item.selections[key];
        }
    });
    
    // Show results
    handleGenerationSuccess(item);
}

// Service worker for offline capability
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
        console.log('Service Worker registered');
    }).catch(err => {
        console.log('Service Worker registration failed:', err);
    });
}