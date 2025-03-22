// DOM Elements
const photoUpload = document.getElementById('photo-upload');
const galleryContainer = document.getElementById('gallery-container');
const blogTitleInput = document.getElementById('blog-title');
const blogContentInput = document.getElementById('blog-content');
const saveBlogButton = document.getElementById('save-blog');
const blogEntriesContainer = document.getElementById('blog-entries-container');
const eventTypeSelect = document.getElementById('event-type');
const eventDateInput = document.getElementById('event-date');
const eventDetailsInput = document.getElementById('event-details');
const createSurpriseButton = document.getElementById('create-surprise');
const surpriseCountdown = document.getElementById('surprise-countdown');
const daysElement = document.getElementById('days');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const surpriseDescription = document.getElementById('surprise-description');

// Local Storage Keys
const PHOTOS_STORAGE_KEY = 'love_site_photos';
const BLOG_ENTRIES_KEY = 'love_site_blog_entries';
const SURPRISE_EVENT_KEY = 'love_site_surprise_event';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadPhotos();
    loadBlogEntries();
    loadSurpriseEvent();
    startCountdown();
    
    // Add smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', smoothScroll);
    });
});

// Smooth scrolling function
function smoothScroll(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    window.scrollTo({
        top: targetElement.offsetTop - 70,
        behavior: 'smooth'
    });
}

// ===== Photo Gallery Functionality =====

// Handle photo upload
if (photoUpload) {
    photoUpload.addEventListener('change', handlePhotoUpload);
}

function handlePhotoUpload(e) {
    const files = e.target.files;
    if (!files.length) return;
    
    // Process each uploaded file
    Array.from(files).forEach(file => {
        if (!file.type.match('image.*')) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const photoData = {
                id: Date.now() + Math.random().toString(36).substring(2, 9),
                src: event.target.result,
                caption: 'Our Special Moment',
                date: new Date().toISOString()
            };
            
            // Save to local storage
            savePhoto(photoData);
            
            // Add to gallery
            addPhotoToGallery(photoData);
        };
        reader.readAsDataURL(file);
    });
    
    // Remove placeholder if it exists
    const placeholder = galleryContainer.querySelector('.placeholder-msg');
    if (placeholder && galleryContainer.children.length > 1) {
        placeholder.remove();
    }
}

function savePhoto(photoData) {
    let photos = JSON.parse(localStorage.getItem(PHOTOS_STORAGE_KEY) || '[]');
    photos.push(photoData);
    localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(photos));
}

function loadPhotos() {
    if (!galleryContainer) return;
    
    const photos = JSON.parse(localStorage.getItem(PHOTOS_STORAGE_KEY) || '[]');
    
    if (photos.length === 0) return; // Keep placeholder
    
    // Remove placeholder
    const placeholder = galleryContainer.querySelector('.placeholder-msg');
    if (placeholder) {
        placeholder.remove();
    }
    
    // Add photos to gallery
    photos.forEach(photo => {
        addPhotoToGallery(photo);
    });
}

function addPhotoToGallery(photoData) {
    // Create photo item element
    const photoItem = document.createElement('div');
    photoItem.className = 'photo-item';
    photoItem.dataset.id = photoData.id;
    
    // Create image
    const img = document.createElement('img');
    img.src = photoData.src;
    img.alt = photoData.caption;
    
    // Create actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'photo-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn';
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
    editBtn.addEventListener('click', () => editPhoto(photoData.id));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
    deleteBtn.addEventListener('click', () => deletePhoto(photoData.id));
    
    // Append elements
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    photoItem.appendChild(img);
    photoItem.appendChild(actionsDiv);
    
    galleryContainer.appendChild(photoItem);
}

function editPhoto(id) {
    let photos = JSON.parse(localStorage.getItem(PHOTOS_STORAGE_KEY) || '[]');
    const photoIndex = photos.findIndex(photo => photo.id === id);
    
    if (photoIndex === -1) return;
    
    const photo = photos[photoIndex];
    const newCaption = prompt('Enter a new caption for this photo:', photo.caption);
    
    if (newCaption !== null) {
        photo.caption = newCaption;
        photos[photoIndex] = photo;
        localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(photos));
        
        // Update in DOM
        const photoItem = galleryContainer.querySelector(`[data-id="${id}"] img`);
        if (photoItem) {
            photoItem.alt = newCaption;
        }
    }
}

function deletePhoto(id) {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    
    let photos = JSON.parse(localStorage.getItem(PHOTOS_STORAGE_KEY) || '[]');
    photos = photos.filter(photo => photo.id !== id);
    localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(photos));
    
    // Remove from DOM
    const photoItem = galleryContainer.querySelector(`[data-id="${id}"]`);
    if (photoItem) {
        photoItem.remove();
    }
    
    // Add placeholder if no photos
    if (photos.length === 0 && galleryContainer) {
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder-msg';
        placeholder.innerHTML = '<i class="fas fa-heart"></i><p>Upload photos to see them here</p>';
        galleryContainer.appendChild(placeholder);
    }
}

// ===== Blog Functionality =====

// Handle save blog entry
if (saveBlogButton) {
    saveBlogButton.addEventListener('click', saveBlogEntry);
}

function saveBlogEntry() {
    const title = blogTitleInput.value.trim();
    const content = blogContentInput.value.trim();
    
    if (!title || !content) {
        alert('Please enter both a title and content for your blog entry.');
        return;
    }
    
    const blogEntry = {
        id: Date.now() + Math.random().toString(36).substring(2, 9),
        title,
        content,
        date: new Date().toISOString()
    };
    
    // Save to local storage
    saveBlogEntryToStorage(blogEntry);
    
    // Add to blog entries
    addBlogEntryToDOM(blogEntry);
    
    // Clear form
    blogTitleInput.value = '';
    blogContentInput.value = '';
    
    // Remove placeholder if it exists
    const placeholder = blogEntriesContainer.querySelector('.placeholder-msg');
    if (placeholder) {
        placeholder.remove();
    }
}

function saveBlogEntryToStorage(entry) {
    let entries = JSON.parse(localStorage.getItem(BLOG_ENTRIES_KEY) || '[]');
    entries.push(entry);
    localStorage.setItem(BLOG_ENTRIES_KEY, JSON.stringify(entries));
}

function loadBlogEntries() {
    if (!blogEntriesContainer) return;
    
    const entries = JSON.parse(localStorage.getItem(BLOG_ENTRIES_KEY) || '[]');
    
    if (entries.length === 0) return; // Keep placeholder
    
    // Remove placeholder
    const placeholder = blogEntriesContainer.querySelector('.placeholder-msg');
    if (placeholder) {
        placeholder.remove();
    }
    
    // Add entries to DOM
    entries.forEach(entry => {
        addBlogEntryToDOM(entry);
    });
}

function addBlogEntryToDOM(entry) {
    // Create blog entry element
    const entryDiv = document.createElement('div');
    entryDiv.className = 'blog-entry';
    entryDiv.dataset.id = entry.id;
    
    // Format date
    const date = new Date(entry.date);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Set content
    entryDiv.innerHTML = `
        <h3>${entry.title}</h3>
        <span class="date">${formattedDate}</span>
        <div class="content">${entry.content.replace(/\n/g, '<br>')}</div>
        <div class="blog-actions">
            <button class="action-btn edit-blog"><i class="fas fa-edit"></i> Edit</button>
            <button class="action-btn delete-blog"><i class="fas fa-trash"></i> Delete</button>
        </div>
    `;
    
    // Add event listeners
    entryDiv.querySelector('.edit-blog').addEventListener('click', () => editBlogEntry(entry.id));
    entryDiv.querySelector('.delete-blog').addEventListener('click', () => deleteBlogEntry(entry.id));
    
    // Add to container
    blogEntriesContainer.prepend(entryDiv); // Add newest entries at the top
}

function editBlogEntry(id) {
    let entries = JSON.parse(localStorage.getItem(BLOG_ENTRIES_KEY) || '[]');
    const entryIndex = entries.findIndex(entry => entry.id === id);
    
    if (entryIndex === -1) return;
    
    const entry = entries[entryIndex];
    
    // Fill the form with entry data
    blogTitleInput.value = entry.title;
    blogContentInput.value = entry.content;
    
    // Remove the old entry
    deleteBlogEntry(id, false); // Don't ask for confirmation
    
    // Scroll to form
    blogTitleInput.scrollIntoView({ behavior: 'smooth' });
    blogTitleInput.focus();
}

function deleteBlogEntry(id, askConfirmation = true) {
    if (askConfirmation && !confirm('Are you sure you want to delete this blog entry?')) return;
    
    let entries = JSON.parse(localStorage.getItem(BLOG_ENTRIES_KEY) || '[]');
    entries = entries.filter(entry => entry.id !== id);
    localStorage.setItem(BLOG_ENTRIES_KEY, JSON.stringify(entries));
    
    // Remove from DOM
    const entryDiv = blogEntriesContainer.querySelector(`[data-id="${id}"]`);
    if (entryDiv) {
        entryDiv.remove();
    }
    
    // Add placeholder if no entries
    if (entries.length === 0 && blogEntriesContainer) {
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder-msg';
        placeholder.innerHTML = '<i class="fas fa-feather-alt"></i><p>Your love stories will appear here</p>';
        blogEntriesContainer.appendChild(placeholder);
    }
}

// ===== Surprise Event Functionality =====

// Handle create surprise
if (createSurpriseButton) {
    createSurpriseButton.addEventListener('click', createSurprise);
}

function createSurprise() {
    const eventType = eventTypeSelect.value;
    const eventDate = eventDateInput.value;
    const eventDetails = eventDetailsInput.value.trim();
    
    if (!eventDate || !eventDetails) {
        alert('Please select a date and enter details for your surprise.');
        return;
    }
    
    // Validate date is in the future
    const selectedDate = new Date(eventDate);
    const now = new Date();
    
    if (selectedDate <= now) {
        alert('Please select a future date for your surprise event.');
        return;
    }
    
    const surprise = {
        type: eventType,
        date: eventDate,
        details: eventDetails
    };
    
    // Save to local storage
    localStorage.setItem(SURPRISE_EVENT_KEY, JSON.stringify(surprise));
    
    // Show countdown
    displaySurpriseCountdown(surprise);
    
    // Clear form
    eventDetailsInput.value = '';
}

function loadSurpriseEvent() {
    const surprise = JSON.parse(localStorage.getItem(SURPRISE_EVENT_KEY));
    if (surprise) {
        displaySurpriseCountdown(surprise);
    }
}

function displaySurpriseCountdown(surprise) {
    if (!surpriseCountdown) return;
    
    // Hide planner, show countdown
    document.querySelector('.surprise-planner').classList.add('hidden');
    surpriseCountdown.classList.remove('hidden');
    
    // Set description based on event type
    let typeText;
    switch (surprise.type) {
        case 'date':
            typeText = 'Romantic Date';
            break;
        case 'gift':
            typeText = 'Special Gift';
            break;
        case 'trip':
            typeText = 'Surprise Trip';
            break;
        case 'message':
            typeText = 'Love Message';
            break;
        default:
            typeText = 'Special Surprise';
    }
    
    surpriseDescription.textContent = `${typeText}: ${surprise.details}`;
}

function startCountdown() {
    const surprise = JSON.parse(localStorage.getItem(SURPRISE_EVENT_KEY));
    if (!surprise) return;
    
    const countdownDate = new Date(surprise.date).getTime();
    
    // Update countdown every second
    const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = countdownDate - now;
        
        // If countdown finished
        if (distance < 0) {
            clearInterval(timer);
            
            // Show surprise message
            daysElement.textContent = '00';
            hoursElement.textContent = '00';
            minutesElement.textContent = '00';
            secondsElement.textContent = '00';
            
            // Optional: Show surprise message or reset
            const resetBtn = document.createElement('button');
            resetBtn.className = 'btn';
            resetBtn.textContent = 'Plan a new surprise';
            resetBtn.addEventListener('click', resetSurprise);
            
            const message = document.createElement('div');
            message.className = 'surprise-message';
            message.innerHTML = '<h3>Today is the day!</h3><p>Time to reveal your surprise!</p>';
            
            surpriseCountdown.appendChild(message);
            surpriseCountdown.appendChild(resetBtn);
            return;
        }
        
        // Calculate days, hours, minutes, seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Display countdown
        daysElement.textContent = days < 10 ? `0${days}` : days;
        hoursElement.textContent = hours < 10 ? `0${hours}` : hours;
        minutesElement.textContent = minutes < 10 ? `0${minutes}` : minutes;
        secondsElement.textContent = seconds < 10 ? `0${seconds}` : seconds;
    }, 1000);
}

function resetSurprise() {
    localStorage.removeItem(SURPRISE_EVENT_KEY);
    
    // Hide countdown, show planner
    surpriseCountdown.classList.add('hidden');
    document.querySelector('.surprise-planner').classList.remove('hidden');
    
    // Remove added elements
    const message = surpriseCountdown.querySelector('.surprise-message');
    const resetBtn = surpriseCountdown.querySelector('.btn');
    
    if (message) message.remove();
    if (resetBtn) resetBtn.remove();
} 