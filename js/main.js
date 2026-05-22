

// Ensure all DOM elements are fully loaded before executing interactive scripts
document.addEventListener('DOMContentLoaded', () => {
    console.log("Study Group Finder Loaded Successfully");

    // ================= 1. THEME SWITCHER ENGINE =================
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');

    if (themeToggleBtn && themeIcon) {
        themeToggleBtn.addEventListener('click', () => {
            // Toggle the dark-theme helper class on the body element
            document.body.classList.toggle('dark-theme');
            
            // Swap icons between sun and moon vector graphics dynamically
            if (document.body.classList.contains('dark-theme')) {
                themeIcon.className = 'fa-solid fa-sun';
            } else {
                themeIcon.className = 'fa-solid fa-moon';
            }
        });
    }

    // ================= 2. MOBILE RESPONSIVE HAMBURGER =================
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // ================= 3. DYNAMIC LIVE GROUP COUNTER =================
    const liveCounter = document.getElementById('liveGroupCount');
    let baseGroups = 124;

    setInterval(() => {
        // Randomly simulate real-time students opening/closing rooms (+1 or -1)
        const fluctuation = Math.random() > 0.5 ? 1 : -1;
        baseGroups += fluctuation;
        if (liveCounter) {
            liveCounter.textContent = `${baseGroups} Active Rooms`;
        }
    }, 4000); // Updates smoothly every 4 seconds

    // ================= 4. AI SCANNER SEQUENCE INTERACTION =================
    const progressFill = document.getElementById('progressFill');
    const aiStatus = document.getElementById('aiMatchStatus');
    
    // Status track timeline mirroring true backend execution states
    const scanStatuses = [
        "Analyzing your courses...",
        "Scanning active peers...",
        "Optimizing schedules...",
        "Matches found successfully! ✓"
    ];
    
    let currentStep = 0;

    function runAiScanMockup() {
        if (!progressFill || !aiStatus) return;
        
        currentStep = (currentStep + 1) % scanStatuses.length;
        aiStatus.textContent = scanStatuses[currentStep];
        
        // Advance layout progress fill percentage by 25% steps
        const calculatedPercentage = (currentStep + 1) * 25;
        progressFill.style.width = `${calculatedPercentage}%`;

        // If engine achieves 100% completion state, pause, hold, then reset loop
        if (currentStep === 3) {
            setTimeout(() => {
                progressFill.style.width = '10%';
                aiStatus.textContent = "Restarting optimization cycle...";
                currentStep = -1;
            }, 5000); // Holds the completed success state for 5 seconds
        }
    }

    // Run the mockup scanner loop sequentially every 3.5 seconds
    setInterval(runAiScanMockup, 3500);
});
// ================= 6. REAL-TIME ODOMETER STATS ENGINE =================
const statsSection = document.getElementById('statsSection');
const counters = document.querySelectorAll('.counter');

// Helper formatting function to convert plain numbers (like 10243) into neat UI strings (like "10,243")
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function runOdometerAnimation() {
    counters.forEach(counter => {
        const targetValue = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // Total counting time duration in milliseconds (2 seconds)
        const frameRate = 1000 / 60; // 60 frames per second crisp execution
        const totalSteps = duration / frameRate;
        const incrementalValue = targetValue / totalSteps;
        
        let currentCount = 0;
        
        const updateFrame = () => {
            currentCount += incrementalValue;
            if (currentCount < targetValue) {
                counter.textContent = formatNumber(Math.floor(currentCount));
                requestAnimationFrame(updateFrame);
            } else {
                counter.textContent = formatNumber(targetValue);
            }
        };
        
        requestAnimationFrame(updateFrame);
    });

    // After the main odometer finishes running, initialize our live background ticking stream loop
    setTimeout(initLiveTickerStream, 2200);
}

// Simulates live background student interactions happening concurrently across the app platform
function initLiveTickerStream() {
    setInterval(() => {
        // Randomly pick one of the first 3 cards to dynamically tick up
        const cardIndex = Math.floor(Math.random() * 3);
        const targetCounter = counters[cardIndex];
        
        if (targetCounter) {
            let currentNumber = parseInt(targetCounter.textContent.replace(/,/g, ''));
            // Tick up by a small random increment (e.g., +1 to +3 new actions)
            const randomIncrement = Math.floor(Math.random() * 3) + 1;
            currentNumber += randomIncrement;
            
            // Re-apply the target update smoothly
            targetCounter.textContent = formatNumber(currentNumber);
            targetCounter.setAttribute('data-target', currentNumber);
            
            // Add a subtle micro-flash effect to show live updates (optional code feedback)
            targetCounter.style.transition = 'color 0.2s ease';
            targetCounter.style.color = '#328CC1'; // Highlight color accent
            setTimeout(() => {
                targetCounter.style.color = ''; // Instantly returns to baseline color variable
            }, 3000);
        }
    }, 5000); // Ticks a random metric upward every 5 seconds!
}

// Intersection Observer: Only runs when the stats element is visible on screen!
if (statsSection && counters.length > 0) {
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                runOdometerAnimation();
                observer.unobserve(entry.target); // Kill observer so it doesn't re-trigger loops repeatedly
            }
        });
    }, { threshold: 0.2 }); // Triggers when 20% of the component is visible on the screen

    sectionObserver.observe(statsSection);
}
// ... Your existing theme switcher and counter scripts are up here ...

// ================= FUTURE BACKEND AUTHENTICATION SESSION ROUTER =================
function secureAppSession() {
    const sessionToken = JSON.parse(localStorage.getItem('session_token'));

    const avatarElement = document.querySelector('.nav-avatar');
    if (avatarElement && sessionToken.name) {
        const names = sessionToken.name.split(' ');
        const initials = names.map(n => n[0]).join('').toUpperCase().substring(0, 2);
        avatarElement.textContent = initials;
    }

    const profileNameField = document.querySelector('.profile-name');
    if (profileNameField) profileNameField.textContent = sessionToken.name;
}

const originalOnload = window.onload;
window.onload = function() {
    secureAppSession();
    if (originalOnload) originalOnload();
};
// Centralized Data Logic
function saveGroup(event) {
    event.preventDefault();
    const group = {
        name: document.getElementById('groupName').value,
        desc: document.getElementById('groupDesc').value,
        id: Date.now()
    };

    const groups = JSON.parse(localStorage.getItem('myGroups') || '[]');
    groups.push(group);
    localStorage.setItem('myGroups', JSON.stringify(groups));
    
    alert('Group created!');
    renderGroups(); // Update the UI immediately
    showView('dashboard'); // Redirect to dashboard view
}

function renderGroups() {
    const groups = JSON.parse(localStorage.getItem('myGroups') || '[]');
    const container = document.getElementById('groups-grid');
    if (!container) return;
    
    container.innerHTML = groups.map(g => `
        <div class="p-4 bg-white dark:bg-campus-900 rounded-xl shadow-sm border border-campus-800">
            <h3 class="font-bold text-white">${g.name}</h3>
            <p class="text-sm text-slate-400">${g.desc}</p>
        </div>
    `).join('');
}