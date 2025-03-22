// API Endpoints
const API_URL = window.location.origin;
const PHOTOS_API = `${API_URL}/api/photos`;
const BLOG_API = `${API_URL}/api/blog`;
const EVENTS_API = `${API_URL}/api/events`;

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

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadPhotos();
    loadBlogEntries();
    loadSurpriseEvent();
    
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
        
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('caption', 'Nosso momento especial');
        
        // Upload to server
        fetch(PHOTOS_API, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao fazer upload da foto');
            }
            return response.json();
        })
        .then(photoData => {
            addPhotoToGallery(photoData);
            
            // Remove placeholder if it exists
            const placeholder = galleryContainer.querySelector('.placeholder-msg');
            if (placeholder) {
                placeholder.remove();
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao fazer upload da foto. Tente novamente.');
        });
    });
}

function loadPhotos() {
    if (!galleryContainer) return;
    
    fetch(PHOTOS_API)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar fotos');
            }
            return response.json();
        })
        .then(photos => {
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
        })
        .catch(error => {
            console.error('Erro:', error);
        });
}

function addPhotoToGallery(photoData) {
    // Create photo item element
    const photoItem = document.createElement('div');
    photoItem.className = 'photo-item';
    photoItem.dataset.id = photoData._id;
    
    // Create image
    const img = document.createElement('img');
    img.src = `/uploads/${photoData.filename}`;
    img.alt = photoData.caption;
    
    // Create actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'photo-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn';
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Editar';
    editBtn.addEventListener('click', () => editPhoto(photoData._id));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Deletar';
    deleteBtn.addEventListener('click', () => deletePhoto(photoData._id));
    
    // Append elements
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    photoItem.appendChild(img);
    photoItem.appendChild(actionsDiv);
    
    galleryContainer.appendChild(photoItem);
}

function editPhoto(id) {
    const newCaption = prompt('Digite uma nova legenda para essa foto:');
    
    if (newCaption === null) return;
    
    fetch(`${PHOTOS_API}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ caption: newCaption })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao atualizar legenda');
        }
        return response.json();
    })
    .then(updatedPhoto => {
        // Update in DOM
        const photoItem = galleryContainer.querySelector(`[data-id="${id}"] img`);
        if (photoItem) {
            photoItem.alt = updatedPhoto.caption;
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao atualizar a legenda. Tente novamente.');
    });
}

function deletePhoto(id) {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) return;
    
    fetch(`${PHOTOS_API}/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao excluir foto');
        }
        return response.json();
    })
    .then(() => {
        // Remove from DOM
        const photoItem = galleryContainer.querySelector(`[data-id="${id}"]`);
        if (photoItem) {
            photoItem.remove();
        }
        
        // Check if gallery is empty
        return fetch(PHOTOS_API);
    })
    .then(response => response.json())
    .then(photos => {
        // Add placeholder if no photos
        if (photos.length === 0 && galleryContainer) {
            const placeholder = document.createElement('div');
            placeholder.className = 'placeholder-msg';
            placeholder.innerHTML = '<i class="fas fa-heart"></i><p>Coloque fotos aqui para ver</p>';
            galleryContainer.appendChild(placeholder);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao excluir a foto. Tente novamente.');
    });
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
        alert('Por favor, preencha o título e o conteúdo.');
        return;
    }
    
    fetch(BLOG_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao salvar entrada do blog');
        }
        return response.json();
    })
    .then(blogEntry => {
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
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao salvar a entrada do blog. Tente novamente.');
    });
}

function loadBlogEntries() {
    if (!blogEntriesContainer) return;
    
    fetch(BLOG_API)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar entradas do blog');
            }
            return response.json();
        })
        .then(entries => {
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
        })
        .catch(error => {
            console.error('Erro:', error);
        });
}

function addBlogEntryToDOM(entry) {
    // Create blog entry element
    const entryDiv = document.createElement('div');
    entryDiv.className = 'blog-entry';
    entryDiv.dataset.id = entry._id;
    
    // Format date
    const date = new Date(entry.date);
    const formattedDate = date.toLocaleDateString('pt-BR', {
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
            <button class="action-btn edit-blog"><i class="fas fa-edit"></i> Editar</button>
            <button class="action-btn delete-blog"><i class="fas fa-trash"></i> Deletar</button>
        </div>
    `;
    
    // Add event listeners
    entryDiv.querySelector('.edit-blog').addEventListener('click', () => editBlogEntry(entry._id));
    entryDiv.querySelector('.delete-blog').addEventListener('click', () => deleteBlogEntry(entry._id));
    
    // Add to container
    blogEntriesContainer.prepend(entryDiv); // Add newest entries at the top
}

function editBlogEntry(id) {
    fetch(`${BLOG_API}/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar dados do blog');
            }
            return response.json();
        })
        .then(entry => {
            // Fill the form with entry data
            blogTitleInput.value = entry.title;
            blogContentInput.value = entry.content;
            
            // Store ID for later update
            blogTitleInput.dataset.editId = id;
            
            // Scroll to form
            blogTitleInput.scrollIntoView({ behavior: 'smooth' });
            blogTitleInput.focus();
            
            // Change button text
            saveBlogButton.textContent = 'Atualizar';
            
            // Add event for update
            saveBlogButton.removeEventListener('click', saveBlogEntry);
            saveBlogButton.addEventListener('click', updateBlogEntry);
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao editar a entrada do blog. Tente novamente.');
        });
}

function updateBlogEntry() {
    const id = blogTitleInput.dataset.editId;
    const title = blogTitleInput.value.trim();
    const content = blogContentInput.value.trim();
    
    if (!title || !content) {
        alert('Por favor, preencha o título e o conteúdo.');
        return;
    }
    
    fetch(`${BLOG_API}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao atualizar entrada do blog');
        }
        return response.json();
    })
    .then(updatedEntry => {
        // Remove old entry
        const entryDiv = blogEntriesContainer.querySelector(`[data-id="${id}"]`);
        if (entryDiv) {
            entryDiv.remove();
        }
        
        // Add updated entry
        addBlogEntryToDOM(updatedEntry);
        
        // Clear form
        blogTitleInput.value = '';
        blogContentInput.value = '';
        delete blogTitleInput.dataset.editId;
        
        // Reset button
        saveBlogButton.textContent = 'Salvar';
        saveBlogButton.removeEventListener('click', updateBlogEntry);
        saveBlogButton.addEventListener('click', saveBlogEntry);
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao atualizar a entrada do blog. Tente novamente.');
    });
}

function deleteBlogEntry(id) {
    if (!confirm('Tem certeza que deseja excluir esta entrada do blog?')) return;
    
    fetch(`${BLOG_API}/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao excluir entrada do blog');
        }
        return response.json();
    })
    .then(() => {
        // Remove from DOM
        const entryDiv = blogEntriesContainer.querySelector(`[data-id="${id}"]`);
        if (entryDiv) {
            entryDiv.remove();
        }
        
        // Check if blog is empty
        return fetch(BLOG_API);
    })
    .then(response => response.json())
    .then(entries => {
        // Add placeholder if no entries
        if (entries.length === 0 && blogEntriesContainer) {
            const placeholder = document.createElement('div');
            placeholder.className = 'placeholder-msg';
            placeholder.innerHTML = '<i class="fas fa-feather-alt"></i><p>Sua história vai aparecer aqui</p>';
            blogEntriesContainer.appendChild(placeholder);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao excluir a entrada do blog. Tente novamente.');
    });
}

// ===== Surprise Event Functionality =====

// Handle create surprise
if (createSurpriseButton) {
    createSurpriseButton.addEventListener('click', createSurprise);
}

function createSurprise() {
    const type = eventTypeSelect.value;
    const date = eventDateInput.value;
    const details = eventDetailsInput.value.trim();
    
    if (!date || !details) {
        alert('Por favor, selecione uma data e forneça detalhes para o evento.');
        return;
    }
    
    // Validate date is in the future
    const selectedDate = new Date(date);
    const now = new Date();
    
    if (selectedDate <= now) {
        alert('Por favor, selecione uma data futura para o evento.');
        return;
    }
    
    fetch(EVENTS_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, date, details })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao criar evento');
        }
        return response.json();
    })
    .then(event => {
        // Show countdown
        displaySurpriseCountdown(event);
        
        // Start countdown
        startCountdown();
        
        // Clear form
        eventDetailsInput.value = '';
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao criar o evento. Tente novamente.');
    });
}

function loadSurpriseEvent() {
    fetch(EVENTS_API)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar evento');
            }
            return response.json();
        })
        .then(event => {
            if (!event) return; // No event
            
            displaySurpriseCountdown(event);
            startCountdown();
        })
        .catch(error => {
            console.error('Erro:', error);
        });
}

function displaySurpriseCountdown(event) {
    if (!surpriseCountdown) return;
    
    // Hide planner, show countdown
    document.querySelector('.surprise-planner').classList.add('hidden');
    surpriseCountdown.classList.remove('hidden');
    
    // Set description based on event type
    let typeText;
    switch (event.type) {
        case 'date':
            typeText = 'Date romântico';
            break;
        case 'gift':
            typeText = 'Natureza';
            break;
        case 'trip':
            typeText = 'Viagem surpresa';
            break;
        case 'message':
            typeText = 'Restaurante';
            break;
        default:
            typeText = 'Datezinho especial';
    }
    
    surpriseDescription.textContent = `${typeText}: ${event.details}`;
}

function startCountdown() {
    fetch(EVENTS_API)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar evento');
            }
            return response.json();
        })
        .then(event => {
            if (!event) return; // No event
            
            const countdownDate = new Date(event.date).getTime();
            
            // Clear any existing interval
            if (window.countdownTimer) {
                clearInterval(window.countdownTimer);
            }
            
            // Update countdown every second
            window.countdownTimer = setInterval(() => {
                const now = new Date().getTime();
                const distance = countdownDate - now;
                
                // If countdown finished
                if (distance < 0) {
                    clearInterval(window.countdownTimer);
                    
                    // Show surprise message
                    daysElement.textContent = '00';
                    hoursElement.textContent = '00';
                    minutesElement.textContent = '00';
                    secondsElement.textContent = '00';
                    
                    // Optional: Show surprise message or reset
                    const resetBtn = document.createElement('button');
                    resetBtn.className = 'btn';
                    resetBtn.textContent = 'Planejar novo datezinho';
                    resetBtn.addEventListener('click', resetSurprise);
                    
                    const message = document.createElement('div');
                    message.className = 'surprise-message';
                    message.innerHTML = '<h3>Chegou o dia!</h3><p>Hora de curtir o datezinho!</p>';
                    
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
        })
        .catch(error => {
            console.error('Erro:', error);
        });
}

function resetSurprise() {
    fetch(EVENTS_API, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao resetar evento');
        }
        return response.json();
    })
    .then(() => {
        // Hide countdown, show planner
        surpriseCountdown.classList.add('hidden');
        document.querySelector('.surprise-planner').classList.remove('hidden');
        
        // Clear any existing interval
        if (window.countdownTimer) {
            clearInterval(window.countdownTimer);
        }
        
        // Remove added elements
        const message = surpriseCountdown.querySelector('.surprise-message');
        const resetBtn = surpriseCountdown.querySelector('.btn');
        
        if (message) message.remove();
        if (resetBtn) resetBtn.remove();
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao resetar o evento. Tente novamente.');
    });
} 