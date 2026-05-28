document.addEventListener('DOMContentLoaded', () => {
  console.log("StudyTribe Loaded Successfully");

  // ================= THEME SWITCHER =================
  const themeToggleBtn = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');

  if (themeToggleBtn && themeIcon) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      if (document.body.classList.contains('dark-theme')) {
        themeIcon.className = 'fa-solid fa-sun';
      } else {
        themeIcon.className = 'fa-solid fa-moon';
      }
    });
  }

  // ================= MOBILE HAMBURGER =================
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // ================= LIVE GROUP COUNTER =================
  const liveCounter = document.getElementById('liveGroupCount');
  let baseGroups = 124;

  setInterval(() => {
    const fluctuation = Math.random() > 0.5 ? 1 : -1;
    baseGroups += fluctuation;
    if (liveCounter) {
      liveCounter.textContent = `${baseGroups} Active Rooms`;
    }
  }, 4000);

  // ================= AI SCANNER =================
  const progressFill = document.getElementById('progressFill');
  const aiStatus = document.getElementById('aiMatchStatus');

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
    const calculatedPercentage = (currentStep + 1) * 25;
    progressFill.style.width = `${calculatedPercentage}%`;
    if (currentStep === 3) {
      setTimeout(() => {
        progressFill.style.width = '10%';
        aiStatus.textContent = "Restarting optimization cycle...";
        currentStep = -1;
      }, 5000);
    }
  }

  setInterval(runAiScanMockup, 3500);

  // ================= SESSION ROUTER =================
  function secureAppSession() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const avatarElement = document.querySelector('.nav-avatar');
    if (avatarElement) avatarElement.textContent = user.avatar;

    const profileNameField = document.querySelector('.profile-name');
    if (profileNameField) profileNameField.textContent = user.name;
  }

  secureAppSession();
});

// ================= STATS COUNTER =================
const statsSection = document.getElementById('statsSection');
const counters = document.querySelectorAll('.counter');

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function runOdometerAnimation() {
  counters.forEach(counter => {
    const targetValue = parseInt(counter.getAttribute('data-target'));
    const duration = 2000;
    const frameRate = 1000 / 60;
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
}

if (statsSection && counters.length > 0) {
  const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runOdometerAnimation();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  sectionObserver.observe(statsSection);
}
