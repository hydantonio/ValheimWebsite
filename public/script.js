const SERVER_ADDRESS = '57.129.6.50:2457';
const REFRESH_INTERVAL = 60000; // 60 seconds

// Chart Logic
let playerChart = null;
const MAX_HISTORY = 20;

document.addEventListener('DOMContentLoaded', () => {
    // Start slideshow
    initSlideshow();
    
    // Init Chart
    initChart();

    // Start server check
    checkServer();
    setInterval(checkServer, REFRESH_INTERVAL);

    // Initialize Scroll Animations
    initScrollAnimations();
});

function initChart() {
    const ctx = document.getElementById('playerChart');
    if (!ctx) return;

    // Wait for Chart.js to load if using async script, but here it's sync so it should be fine.
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded yet');
        return;
    }

    Chart.defaults.color = '#d4c5b0';
    Chart.defaults.borderColor = 'rgba(90, 74, 58, 0.5)';

    playerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Giocatori Online',
                data: [],
                borderColor: '#ffae00',
                backgroundColor: 'rgba(255, 174, 0, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(30, 27, 24, 0.9)',
                    titleColor: '#ffae00',
                    bodyColor: '#d4c5b0',
                    borderColor: '#5a4a3a',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 10,
                    ticks: {
                        stepSize: 1,
                        precision: 0
                    },
                    grid: {
                        color: 'rgba(90, 74, 58, 0.3)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1000
            }
        }
    });
}

function updateChart(count) {
    if (!playerChart) return;

    const now = new Date();
    const timeLabel = now.getHours().toString().padStart(2, '0') + ':' + 
                      now.getMinutes().toString().padStart(2, '0');

    // Add new data
    playerChart.data.labels.push(timeLabel);
    playerChart.data.datasets[0].data.push(count);

    // Remove old data if limit reached
    if (playerChart.data.labels.length > MAX_HISTORY) {
        playerChart.data.labels.shift();
        playerChart.data.datasets[0].data.shift();
    }

    playerChart.update();
}


function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll('.card, .content-section, .scroll-trigger, .valheim-card');
    elementsToAnimate.forEach(el => observer.observe(el));
}

// Slideshow Logic
function initSlideshow() {
    let slideIndex = 0;
    const slides = document.getElementsByClassName("slide");
    
    if (slides.length === 0) return;

    function showSlides() {
        for (let i = 0; i < slides.length; i++) {
            slides[i].classList.remove("active");
        }
        
        slideIndex++;
        if (slideIndex > slides.length) { slideIndex = 1 }
        
        slides[slideIndex - 1].classList.add("active");
        setTimeout(showSlides, 5000); // Change image every 5 seconds
    }
    
    showSlides();
}

// Server Status Logic
async function checkServer() {
    const resultContainer = document.getElementById('result-container');
    const loading = document.getElementById('loading');
    const errorMsg = document.getElementById('error-message');
    const lastUpdate = document.getElementById('last-update-time');
    
    // Mini status elements
    const miniStatusDot = document.querySelector('.server-status-mini .status-dot');
    const miniVikingCount = document.querySelector('.server-status-mini .viking-count');

    // Only show loading on first load if result container is hidden AND exists
    if (resultContainer && loading && resultContainer.classList.contains('hidden')) {
        loading.classList.remove('hidden');
    }

    if (errorMsg) errorMsg.classList.add('hidden');

    let apiUrl = '/api/check';
    // Se siamo su localhost o se la fetch fallisce, proveremo l'endpoint diretto sulla porta 3000
    // Ma per ora proviamo il relativo (supponendo proxy o stessa porta)

    const fetchStatus = async (url) => {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: SERVER_ADDRESS })
        });
        if (!response.ok && response.status === 404) throw new Error('404 Not Found'); // Probabile mancanza di proxy
        return response.json();
    };

    try {
        let data;
        try {
            data = await fetchStatus('/api/check');
        } catch (e) {
            console.warn("API locale non trovata, tentativo sulla porta 3000...", e);
            // Fallback: prova a chiamare direttamente la porta 3000 sullo stesso hostname
            const fallbackUrl = `${window.location.protocol}//${window.location.hostname}:3000/api/check`;
            data = await fetchStatus(fallbackUrl);
        }

        if (loading) loading.classList.add('hidden');

        if (data.status === 'online') {
            if (resultContainer) showResult(data.data);
            updateMiniStatus(true, data.data.players ? data.data.players.length : 0);
            updateChart(data.data.players ? data.data.players.length : 0);
        } else {
            if (resultContainer) showOffline(data.error || 'Server offline o non raggiungibile.');
            updateMiniStatus(false);
            updateChart(0);
        }
    } catch (err) {
        console.error(err);
        if (loading) loading.classList.add('hidden');
        if (resultContainer) showOffline('Errore di connessione al servizio di controllo.');
        updateMiniStatus(false);
        updateChart(0);
    } finally {
        const now = new Date();
        if (lastUpdate) lastUpdate.textContent = now.toLocaleTimeString();
    }
}

function updateMiniStatus(isOnline, playerCount = 0) {
    const miniStatusDot = document.querySelector('.server-status-mini .status-dot');
    const miniVikingCount = document.querySelector('.server-status-mini .viking-count');

    if (!miniStatusDot || !miniVikingCount) return;

    if (isOnline) {
        miniStatusDot.classList.remove('offline');
        miniStatusDot.classList.add('online');
        miniVikingCount.textContent = playerCount;
    } else {
        miniStatusDot.classList.remove('online');
        miniStatusDot.classList.add('offline');
        miniVikingCount.textContent = '--';
    }
}

function showResult(serverData) {
    const resultContainer = document.getElementById('result-container');
    const statusText = document.getElementById('status-text');
    const dot = document.querySelector('.server-header .dot');

    document.getElementById('server-name').textContent = serverData.name;
    document.getElementById('server-ip').textContent = SERVER_ADDRESS;
    
    const playersCount = Array.isArray(serverData.players) ? serverData.players.length : 0;
    document.getElementById('player-count').textContent = `${playersCount} / ${serverData.maxplayers}`;
    
    document.getElementById('ping').textContent = `${serverData.ping} ms`;
    document.getElementById('map').textContent = serverData.map || 'Unknown';
    
    const version = serverData.version || (serverData.raw && serverData.raw.version) || 'N/A';
    document.getElementById('version').textContent = version;
    
    const connectLink = document.getElementById('connect-link');
    if (serverData.connect) {
         connectLink.innerHTML = `<a href="steam://connect/${serverData.connect}">CONNETTI ORA</a>`;
    } else {
         connectLink.textContent = 'N/A';
    }

    statusText.textContent = 'Online';
    statusText.style.color = 'var(--success-color)';
    dot.style.backgroundColor = 'var(--success-color)';
    dot.style.boxShadow = '0 0 10px var(--success-color)';

    resultContainer.classList.remove('hidden');
}

function showOffline(msg) {
    const resultContainer = document.getElementById('result-container');
    const statusText = document.getElementById('status-text');
    const dot = document.querySelector('.server-header .dot');
    
    resultContainer.classList.remove('hidden');
    
    statusText.textContent = 'Offline';
    statusText.style.color = 'var(--error-color)';
    dot.style.backgroundColor = 'var(--error-color)';
    dot.style.boxShadow = '0 0 10px var(--error-color)';
    
    document.getElementById('server-name').textContent = 'Server Offline';
    document.getElementById('player-count').textContent = '-';
    document.getElementById('ping').textContent = '-';
    
    const errorMsg = document.getElementById('error-message');
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
}
