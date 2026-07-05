// App State & Data Management
const AppData = {
    state: {
        theme: 'dark-theme',
        studyTimeToday: 0,
        dailyGoal: 8,
        streak: 0,
        lastActiveDate: new Date().toDateString(),
        timetable: []
    },
    
    init() {
        const saved = localStorage.getItem('jeeFocusProData');
        if (saved) {
            try { this.state = { ...this.state, ...JSON.parse(saved) }; } 
            catch(e) { console.error("Data corrupted. Using defaults."); }
        }
        this.checkStreak();
        this.save();
    },

    save() {
        localStorage.setItem('jeeFocusProData', JSON.stringify(this.state));
        localStorage.setItem('jeeFocusProBackupTime', new Date().toLocaleString());
    },

    checkStreak() {
        const today = new Date().toDateString();
        if (this.state.lastActiveDate !== today) {
            // Simplified streak logic: if opened next day, increment, else reset.
            let lastDate = new Date(this.state.lastActiveDate);
            let currentDate = new Date(today);
            let diff = (currentDate - lastDate) / (1000 * 60 * 60 * 24);
            if (diff === 1) this.state.streak++;
            else if (diff > 1) this.state.streak = 0;
            this.state.lastActiveDate = today;
            this.state.studyTimeToday = 0; // reset daily timer
        }
    },

    exportData() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "jeefocus_backup.json");
        dlAnchorElem.click();
    },

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                if(json.theme !== undefined) {
                    this.state = json;
                    this.save();
                    location.reload();
                } else { alert("Invalid backup file."); }
            } catch (err) { alert("Error parsing file."); }
        };
        reader.readAsText(file);
    },

    resetData() {
        if(confirm("Warning: This will permanently delete all your data. Continue?")) {
            localStorage.removeItem('jeeFocusProData');
            location.reload();
        }
    }
};

// UI & Logic Controller
const AppUI = {
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        this.renderDashboard();
        this.renderTimetable();
        this.applyTheme(AppData.state.theme);
        
        // Hide Splash Screen
        setTimeout(() => {
            this.dom.splash.style.opacity = '0';
            setTimeout(() => this.dom.splash.style.display = 'none', 500);
        }, 800);
        
        // Update Backup time
        const lastBackup = localStorage.getItem('jeeFocusProBackupTime');
        if(lastBackup) document.getElementById('last-backup-time').innerText = `Last Backup: ${lastBackup}`;
    },

    cacheDOM() {
        this.dom = {
            splash: document.getElementById('splash-screen'),
            navItems: document.querySelectorAll('.nav-item'),
            views: document.querySelectorAll('.view'),
            clock: document.getElementById('header-time'),
            streak: document.getElementById('header-streak'),
            greeting: document.getElementById('greeting-text'),
            hoursRing: document.getElementById('hours-ring'),
            hoursText: document.getElementById('hours-text'),
            goalRing: document.getElementById('goal-ring'),
            goalText: document.getElementById('goal-text'),
            timetableList: document.getElementById('timetable-list'),
            modalOverlay: document.getElementById('modal-overlay'),
            modalContent: document.getElementById('modal-content'),
        };
    },

    bindEvents() {
        // Navigation
        this.dom.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView(item.dataset.target);
                this.dom.navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Settings Buttons
        document.getElementById('btn-toggle-theme').addEventListener('click', () => {
            const newTheme = AppData.state.theme === 'dark-theme' ? 'light-theme' : 'dark-theme';
            this.applyTheme(newTheme);
        });
        document.getElementById('btn-export').addEventListener('click', () => AppData.exportData());
        document.getElementById('btn-reset').addEventListener('click', () => AppData.resetData());
        
        const fileInput = document.getElementById('file-import');
        document.getElementById('btn-import-trigger').addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            if(e.target.files.length > 0) AppData.importData(e.target.files[0]);
        });

        // Timetable Add
        document.getElementById('btn-add-session').addEventListener('click', () => this.showAddSessionModal());
    },

    applyTheme(themeName) {
        document.body.className = themeName;
        AppData.state.theme = themeName;
        AppData.save();
    },

    switchView(viewId) {
        this.dom.views.forEach(view => view.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
        if(viewId === 'view-dashboard') this.renderDashboard();
    },

    updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const mins = now.getMinutes().toString().padStart(2, '0');
        this.dom.clock.innerText = `${hours}:${mins} ${ampm}`;
        
        const hour24 = now.getHours();
        let greeting = 'Good Evening,';
        if (hour24 < 12) greeting = 'Good Morning,';
        else if (hour24 < 17) greeting = 'Good Afternoon,';
        this.dom.greeting.innerText = greeting;
    },

    renderDashboard() {
        this.dom.streak.innerText = `🔥 ${AppData.state.streak}`;
        
        // Render Rings
        const hours = (AppData.state.studyTimeToday / 3600).toFixed(1);
        this.dom.hoursText.innerText = `${hours}h`;
        const hoursOffset = 220 - (Math.min((hours / AppData.state.dailyGoal), 1) * 220);
        this.dom.hoursRing.style.strokeDashoffset = hoursOffset;

        const goalPercent = Math.min(Math.round((hours / AppData.state.dailyGoal) * 100), 100);
        this.dom.goalText.innerText = `${goalPercent}%`;
        const goalOffset = 220 - ((goalPercent / 100) * 220);
        this.dom.goalRing.style.strokeDashoffset = goalOffset;
    },

    renderTimetable() {
        this.dom.timetableList.innerHTML = '';
        if(AppData.state.timetable.length === 0) {
            this.dom.timetableList.innerHTML = `<p class="small-text" style="text-align:center; padding: 20px;">No sessions planned. Add one above.</p>`;
            return;
        }
        
        AppData.state.timetable.forEach((session, index) => {
            const el = document.createElement('div');
            el.className = 'glass-card timetable-card';
            el.innerHTML = `
                <div class="subject-color" style="background-color: var(--${session.subject.toLowerCase()})"></div>
                <div class="session-info" style="flex-grow:1;">
                    <h4>${session.subject}</h4>
                    <p>${session.chapter}</p>
                    <span class="time">${session.duration} mins</span>
                </div>
                <button class="glass-btn small danger btn-del-session" data-index="${index}">X</button>
            `;
            this.dom.timetableList.appendChild(el);
        });

        document.querySelectorAll('.btn-del-session').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.dataset.index;
                AppData.state.timetable.splice(idx, 1);
                AppData.save();
                this.renderTimetable();
            });
        });
    },

    showAddSessionModal() {
        this.dom.modalContent.innerHTML = `
            <h3>Add Study Session</h3>
            <select id="new-subject">
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Math">Mathematics</option>
            </select>
            <input type="text" id="new-chapter" placeholder="Chapter Name" autocomplete="off">
            <input type="number" id="new-duration" placeholder="Duration (Minutes)" autocomplete="off">
            <div style="display:flex; gap:10px; margin-top:16px;">
                <button class="glass-btn primary" id="btn-save-session" style="flex:1;">Save</button>
                <button class="glass-btn" id="btn-cancel-session" style="flex:1;">Cancel</button>
            </div>
        `;
        this.dom.modalOverlay.classList.add('active');

        document.getElementById('btn-cancel-session').addEventListener('click', () => {
            this.dom.modalOverlay.classList.remove('active');
        });

        document.getElementById('btn-save-session').addEventListener('click', () => {
            const subj = document.getElementById('new-subject').value;
            const chap = document.getElementById('new-chapter').value;
            const dur = document.getElementById('new-duration').value;
            
            if(!chap || !dur) return alert("Please fill all fields.");

            AppData.state.timetable.push({ subject: subj, chapter: chap, duration: parseInt(dur) });
            AppData.save();
            this.renderTimetable();
            this.dom.modalOverlay.classList.remove('active');
        });
    }
};

// Pomodoro Timer Logic
const Timer = {
    interval: null,
    timeLeft: 1500, // 25 mins default
    isRunning: false,
    
    init() {
        this.display = document.getElementById('timer-display');
        this.status = document.getElementById('timer-status');
        
        document.getElementById('btn-start-timer').addEventListener('click', () => this.start());
        document.getElementById('btn-pause-timer').addEventListener('click', () => this.pause());
        document.getElementById('btn-reset-timer').addEventListener('click', () => this.reset());

        // Notifications
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    },

    updateDisplay() {
        const m = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
        const s = (this.timeLeft % 60).toString().padStart(2, '0');
        this.display.innerText = `${m}:${s}`;
    },

    start() {
        if(this.isRunning) return;
        this.isRunning = true;
        this.status.innerText = "Focusing...";
        this.interval = setInterval(() => {
            if(this.timeLeft > 0) {
                this.timeLeft--;
                this.updateDisplay();
                // Add to global study time
                AppData.state.studyTimeToday++;
                if(AppData.state.studyTimeToday % 60 === 0) AppData.save(); // Save every minute
            } else {
                this.complete();
            }
        }, 1000);
    },

    pause() {
        this.isRunning = false;
        clearInterval(this.interval);
        this.status.innerText = "Paused";
        AppData.save();
        AppUI.renderDashboard(); // Update rings
    },

    reset() {
        this.pause();
        this.timeLeft = 1500;
        this.updateDisplay();
        this.status.innerText = "Ready to Focus";
    },

    complete() {
        this.pause();
        this.status.innerText = "Session Complete!";
        if(Notification.permission === "granted") {
            new Notification("Session Complete!", { body: "Great job! Take a short break." });
        }
        if(navigator.vibrate) navigator.vibrate([200, 100, 200]);
        AppData.save();
        AppUI.renderDashboard();
    }
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    AppData.init();
    AppUI.init();
    Timer.init();
    
    // Register Service Worker for PWA Offline Capability
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js')
                .then(reg => console.log('SW Registered'))
                .catch(err => console.error('SW Error:', err));
        });
    }
});
