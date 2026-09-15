// =========================================================
// FINHUB STARTUP SAAS APPLICATION ENGINE (v3.5)
// Dual Auth, Monefy Daily Expense Tracker, Category Analytics, Savings Goal Fix
// =========================================================

const defaultOrigin = (typeof window !== 'undefined' && window.location.origin && window.location.origin.startsWith('http')) 
    ? `${window.location.origin}/api` 
    : 'http://localhost:5001/api';

let API_BASE_URL = defaultOrigin;
const CANDIDATE_PORTS = [5001, 5005, 5002, 5003, 5004, 5000];

// State Management
let currentLang = 'en';
let currentUser = null;
let adminToken = sessionStorage.getItem('finhub_admin_token') || null;

let expensesList = [];
let dailyMonefyList = [];
let savingsGoalsList = [];
let subscriptionsList = [];
let scholarshipsList = [];
let userApplicationsList = [];
let adminDbList = [];
let currentQuizIndex = 0;
let quizScore = 0;

// Hindi & English Dictionary
const I18N = {
    en: {
        navDashboard: "Dashboard",
        navScholarships: "Scholarships",
        navEMI: "EMI Compare",
        navSavings: "Savings Goals",
        navLiteracy: "Literacy",
        userSignInBtn: "User Sign In",
        dashboardTitle: "User Personal Dashboard",
        dashboardSub: "Overview of your personal income, expenses, applied scholarships, and savings goals."
    },
    hi: {
        navDashboard: "डैशबोर्ड",
        navScholarships: "छात्रवृत्ति",
        navEMI: "ईएमआई तुलना",
        navSavings: "बचत लक्ष्य",
        navLiteracy: "साक्षरता",
        userSignInBtn: "साइन इन करें",
        dashboardTitle: "उपयोगकर्ता व्यक्तिगत डैशबोर्ड",
        dashboardSub: "आपकी व्यक्तिगत आय, खर्च, लागू छात्रवृत्ति और बचत लक्ष्यों का अवलोकन।"
    }
};

const QUIZ_QUESTIONS = [
    { q: "What does the 50/30/20 budgeting rule suggest allocating 20% of your income to?", options: ["Entertainment & Fun", "Needs & Rent", "Savings & Investments", "Dining Out"], ans: 2 },
    { q: "What is an EMI in financial loans?", options: ["Easy Money Investment", "Equated Monthly Installment", "Estimated Monthly Income", "Extra Monthly Interest"], ans: 1 },
    { q: "Which credit score (CIBIL) is generally considered healthy for loan approvals in India?", options: ["Below 500", "500 - 600", "750 or above", "Any score is fine"], ans: 2 },
    { q: "What is a major advantage of starting a SIP early?", options: ["Compounding Interest Growth", "Zero Income Tax", "Guaranteed 100% Returns", "No Market Risks"], ans: 0 },
    { q: "Under Section 80C of Income Tax Act in India, what is the maximum tax deduction limit?", options: ["₹50,000", "₹1,50,000", "₹5,00,000", "₹2,50,000"], ans: 1 }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initCanvasAnimation();
    checkBackendHealth();
    setupNavigation();
    setupAuthSystem();
    setupEmiCalculator();
    setupStudentPlanner();
    setupSavingsGoalsForm();
    setupMonefyTracker();
    loadScholarships();
    loadExpenses();
    loadSavingsGoals();
    loadQuizQuestion();
    checkExistingUserSession();
});

// =========================================================
// 1. BACKEND HEALTH DISCOVERY
// =========================================================
async function checkBackendHealth() {
    const statusDot = document.querySelector('#systemBadge .status-dot');
    const systemStatusText = document.getElementById('systemStatusText');

    for (const port of CANDIDATE_PORTS) {
        try {
            const testUrl = `http://localhost:${port}/api`;
            const res = await fetch(`${testUrl}/health`, { headers: { 'Accept': 'application/json' } });
            const data = await res.json();

            if (data.status === 'online') {
                API_BASE_URL = testUrl;
                statusDot.className = 'status-dot online';
                systemStatusText.innerText = `Online (${port})`;
                return;
            }
        } catch (err) {}
    }

    statusDot.className = 'status-dot error';
    systemStatusText.innerText = 'Offline';
}

// =========================================================
// 2. NAVIGATION & HERO CTAS
// =========================================================
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const tabPanels = document.querySelectorAll('.tab-panel');

    function switchTab(targetId) {
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('data-tab') === targetId));
        tabPanels.forEach(p => p.classList.toggle('active', p.id === targetId));

        if (window.scrollY > 300) {
            document.querySelector('.main-content-wrapper').scrollIntoView({ behavior: 'smooth' });
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(link.getAttribute('data-tab'));
            document.getElementById('navLinks').classList.remove('active');
        });
    });

    document.getElementById('hamburgerBtn').addEventListener('click', () => {
        document.getElementById('navLinks').classList.toggle('active');
    });

    document.getElementById('heroGetStartedBtn').addEventListener('click', () => {
        if (!currentUser) openUserAuthModal('signup');
        else switchTab('tab-dashboard');
    });

    document.getElementById('heroExploreScholarshipsBtn').addEventListener('click', () => {
        switchTab('tab-scholarships');
    });

    document.getElementById('langToggleBtn').addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'hi' : 'en';
        document.documentElement.setAttribute('data-lang', currentLang);
        document.getElementById('langLabel').innerText = currentLang === 'en' ? 'HI' : 'EN';
        applyI18n();
    });
}

function applyI18n() {
    const dict = I18N[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.innerText = dict[key];
    });
}

// =========================================================
// 3. DUAL AUTH SYSTEM (USER & ADMIN PORTALS)
// =========================================================
function setupAuthSystem() {
    const openAdminAuthBtn = document.getElementById('openAdminAuthBtn');
    const adminAuthModal = document.getElementById('adminAuthModal');
    const closeAdminAuthBtn = document.getElementById('closeAdminAuthBtn');

    openAdminAuthBtn.addEventListener('click', () => {
        if (adminToken) loadAdminDatabaseModal();
        else adminAuthModal.classList.add('active');
    });

    closeAdminAuthBtn.addEventListener('click', () => adminAuthModal.classList.remove('active'));

    document.getElementById('toggleAdminPassBtn').addEventListener('click', () => {
        const passInput = document.getElementById('adminPassword');
        const isPass = passInput.getAttribute('type') === 'password';
        passInput.setAttribute('type', isPass ? 'text' : 'password');
        document.getElementById('toggleAdminPassBtn').querySelector('i').className = isPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });

    document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value;

        try {
            const res = await fetch(`${API_BASE_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.success && data.token) {
                adminToken = data.token;
                sessionStorage.setItem('finhub_admin_token', adminToken);
                adminAuthModal.classList.remove('active');
                showToast('👑 Admin Verification Successful! Welcome Shekhar.', 'success');
                loadAdminDatabaseModal();
            } else {
                showToast(data.error || 'Invalid Admin credentials.', 'error');
            }
        } catch (err) {
            showToast('Unable to connect to backend server.', 'error');
        }
    });

    const openUserAuthBtn = document.getElementById('openUserAuthBtn');
    const userAuthModal = document.getElementById('userAuthModal');
    const closeUserAuthBtn = document.getElementById('closeUserAuthBtn');
    const tabSignInBtn = document.getElementById('tabSignInBtn');
    const tabSignUpBtn = document.getElementById('tabSignUpBtn');
    const userSignInForm = document.getElementById('userSignInForm');
    const userSignUpForm = document.getElementById('userSignUpForm');

    openUserAuthBtn.addEventListener('click', () => openUserAuthModal('signin'));
    closeUserAuthBtn.addEventListener('click', () => userAuthModal.classList.remove('active'));

    tabSignInBtn.addEventListener('click', () => {
        tabSignInBtn.classList.add('active');
        tabSignUpBtn.classList.remove('active');
        userSignInForm.style.display = 'block';
        userSignUpForm.style.display = 'none';
    });

    tabSignUpBtn.addEventListener('click', () => {
        tabSignUpBtn.classList.add('active');
        tabSignInBtn.classList.remove('active');
        userSignInForm.style.display = 'none';
        userSignUpForm.style.display = 'block';
    });

    userSignInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signInEmail').value.trim();
        if (!email) return;

        currentUser = { name: email.split('@')[0], email };
        localStorage.setItem('finhub_user', JSON.stringify(currentUser));
        userAuthModal.classList.remove('active');
        updateUserHeaderUI();
        showToast(`Welcome back, ${currentUser.name}!`, 'success');
        loadUserApplications();
        loadMonefyDailyExpenses();
    });

    userSignUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const full_name = document.getElementById('signUpName').value.trim();
        const father_name = document.getElementById('signUpFather').value.trim();
        const email = document.getElementById('signUpEmail').value.trim();
        const phone = document.getElementById('signUpPhone').value.trim();

        try {
            await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name, father_name, email, phone })
            });
        } catch (err) {}

        currentUser = { name: full_name, email };
        localStorage.setItem('finhub_user', JSON.stringify(currentUser));
        userAuthModal.classList.remove('active');
        updateUserHeaderUI();
        triggerConfetti();
        showToast('🎉 Account created successfully!', 'success');
        loadUserApplications();
        loadMonefyDailyExpenses();
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('finhub_user');
        updateUserHeaderUI();
        showToast('Logged out successfully.', 'success');
    });

    document.getElementById('closeAdminDbBtn').addEventListener('click', () => {
        document.getElementById('adminDbModal').classList.remove('active');
    });
}

function openUserAuthModal(mode = 'signin') {
    const userAuthModal = document.getElementById('userAuthModal');
    userAuthModal.classList.add('active');
    if (mode === 'signup') document.getElementById('tabSignUpBtn').click();
    else document.getElementById('tabSignInBtn').click();
}

function checkExistingUserSession() {
    const saved = localStorage.getItem('finhub_user');
    if (saved) {
        try {
            currentUser = JSON.parse(saved);
            updateUserHeaderUI();
            loadUserApplications();
            loadMonefyDailyExpenses();
        } catch (e) {}
    }
}

function updateUserHeaderUI() {
    const unauthGroup = document.getElementById('unauthButtons');
    const profileBadge = document.getElementById('userProfileBadge');

    if (currentUser) {
        unauthGroup.style.display = 'none';
        profileBadge.style.display = 'flex';
        document.getElementById('userNameLabel').innerText = currentUser.name;
        document.getElementById('userAvatar').innerText = currentUser.name.charAt(0).toUpperCase();
    } else {
        unauthGroup.style.display = 'flex';
        profileBadge.style.display = 'none';
    }
}

// =========================================================
// 4. ADMIN DATABASE DASHBOARD (GATED ACCESS)
// =========================================================
async function loadAdminDatabaseModal() {
    if (!adminToken) {
        document.getElementById('adminAuthModal').classList.add('active');
        return;
    }

    const modal = document.getElementById('adminDbModal');
    const tbody = document.getElementById('adminDbTableBody');
    const countBadge = document.getElementById('adminDbCountBadge');

    modal.classList.add('active');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Fetching database records...</td></tr>';

    try {
        const res = await fetch(`${API_BASE_URL}/registrations`, {
            headers: { 'x-admin-token': adminToken }
        });
        const result = await res.json();

        if (res.ok && result.success) {
            adminDbList = result.data;
            countBadge.innerText = `${result.count} Records`;
            renderAdminDbList(adminDbList);
        } else {
            showToast(result.error || 'Failed to fetch admin database records.', 'error');
            modal.classList.remove('active');
        }
    } catch (err) {
        showToast('Backend connection error.', 'error');
        modal.classList.remove('active');
    }
}

function renderAdminDbList(list) {
    const tbody = document.getElementById('adminDbTableBody');
    if (!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No records found.</td></tr>';
        return;
    }

    tbody.innerHTML = list.map(u => `
        <tr>
            <td><strong>${escapeHtml(u.full_name)}</strong></td>
            <td>${escapeHtml(u.father_name)}</td>
            <td>${escapeHtml(u.email)}</td>
            <td>${u.phone ? escapeHtml(u.phone) : 'N/A'}</td>
            <td>${new Date(u.created_at).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

// =========================================================
// 5. MONEFY PRIVATE DAILY EXPENSE TRACKER & CALCULATOR
// =========================================================
function setupMonefyTracker() {
    const form = document.getElementById('monefyForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('dailyTitle').value.trim();
        const amount = parseFloat(document.getElementById('dailyAmount').value);
        const category = document.getElementById('dailyCategory').value;
        const date = document.getElementById('dailyDate').value || new Date().toISOString().slice(0, 10);

        if (!title || !amount) return;

        const newEntry = {
            id: 'm-' + Date.now(),
            title,
            amount,
            category,
            date,
            user_email: currentUser ? currentUser.email : 'guest'
        };

        dailyMonefyList.unshift(newEntry);
        saveMonefyToStorage();
        renderMonefyExpenses();
        form.reset();
        triggerConfetti();
        showToast('🍲 Daily expense logged in private tracker!', 'success');
    });
}

function loadMonefyDailyExpenses() {
    const key = currentUser ? `finhub_monefy_${currentUser.email}` : 'finhub_monefy_guest';
    const saved = localStorage.getItem(key);
    if (saved) {
        try { dailyMonefyList = JSON.parse(saved); } catch (e) { dailyMonefyList = []; }
    } else {
        dailyMonefyList = [];
    }
    renderMonefyExpenses();
}

function saveMonefyToStorage() {
    const key = currentUser ? `finhub_monefy_${currentUser.email}` : 'finhub_monefy_guest';
    localStorage.setItem(key, JSON.stringify(dailyMonefyList));
}

function renderMonefyExpenses() {
    const tbody = document.getElementById('dailyExpenseTableBody');
    let monthlyTotal = 0;
    let yearlyTotal = 0;

    const categoryTotals = { Food: 0, Study: 0, Tuition: 0, Entertainment: 0, Vehicle: 0, Other: 0 };
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    tbody.innerHTML = dailyMonefyList.map(item => {
        const amt = parseFloat(item.amount) || 0;
        const d = new Date(item.date);

        if (d.getFullYear() === currentYear) {
            yearlyTotal += amt;
            if (d.getMonth() === currentMonth) {
                monthlyTotal += amt;
                if (categoryTotals[item.category] !== undefined) categoryTotals[item.category] += amt;
                else categoryTotals.Other += amt;
            }
        }

        return `
            <tr>
                <td><strong>${escapeHtml(item.title)}</strong></td>
                <td><span class="legend-tag tag-${getCategoryTagClass(item.category)}">${escapeHtml(item.category)}</span></td>
                <td>${item.date}</td>
                <td style="color:#ef4444; font-weight:700;">-₹${amt.toLocaleString()}</td>
                <td><button onclick="deleteMonefyEntry('${item.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No private daily expenses logged yet. Add your first expense above!</td></tr>';

    document.getElementById('monthlyTotalVal').innerText = `₹${monthlyTotal.toLocaleString()}`;
    document.getElementById('yearlyTotalVal').innerText = `₹${yearlyTotal.toLocaleString()}`;

    // Monefy Category Percentage Analytics Calculation
    const grandMonthCatTotal = Object.values(categoryTotals).reduce((a, b) => a + b, 0) || 1;
    const pFood = Math.round((categoryTotals.Food / grandMonthCatTotal) * 100);
    const pStudy = Math.round((categoryTotals.Study / grandMonthCatTotal) * 100);
    const pTuition = Math.round((categoryTotals.Tuition / grandMonthCatTotal) * 100);
    const pEnt = Math.round((categoryTotals.Entertainment / grandMonthCatTotal) * 100);
    const pVehicle = Math.round((categoryTotals.Vehicle / grandMonthCatTotal) * 100);
    const pOther = Math.round((categoryTotals.Other / grandMonthCatTotal) * 100);

    document.getElementById('segFood').style.width = `${pFood}%`;
    document.getElementById('segStudy').style.width = `${pStudy}%`;
    document.getElementById('segTuition').style.width = `${pTuition}%`;
    document.getElementById('segEnt').style.width = `${pEnt}%`;
    document.getElementById('segVehicle').style.width = `${pVehicle}%`;
    document.getElementById('segOther').style.width = `${pOther}%`;

    document.getElementById('pctFood').innerText = `${pFood}% (₹${categoryTotals.Food.toLocaleString()})`;
    document.getElementById('pctStudy').innerText = `${pStudy}% (₹${categoryTotals.Study.toLocaleString()})`;
    document.getElementById('pctTuition').innerText = `${pTuition}% (₹${categoryTotals.Tuition.toLocaleString()})`;
    document.getElementById('pctEnt').innerText = `${pEnt}% (₹${categoryTotals.Entertainment.toLocaleString()})`;
    document.getElementById('pctVehicle').innerText = `${pVehicle}% (₹${categoryTotals.Vehicle.toLocaleString()})`;
    document.getElementById('pctOther').innerText = `${pOther}% (₹${categoryTotals.Other.toLocaleString()})`;
}

function getCategoryTagClass(cat) {
    if (cat === 'Food') return 'food';
    if (cat === 'Study') return 'study';
    if (cat === 'Tuition') return 'tuition';
    if (cat === 'Entertainment') return 'ent';
    if (cat === 'Vehicle') return 'vehicle';
    return 'other';
}

function deleteMonefyEntry(id) {
    dailyMonefyList = dailyMonefyList.filter(x => x.id !== id);
    saveMonefyToStorage();
    renderMonefyExpenses();
    showToast('Entry deleted.', 'info');
}

// =========================================================
// 6. SAVINGS GOALS PLANNER (GUARANTEED CREATION FIX)
// =========================================================
function setupSavingsGoalsForm() {
    const form = document.getElementById('savingsForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const goal_name = document.getElementById('goalName').value.trim();
        const target_amount = parseFloat(document.getElementById('goalTarget').value);
        const current_amount = parseFloat(document.getElementById('goalInitial').value) || 0;

        if (!goal_name || isNaN(target_amount) || target_amount <= 0) {
            showToast('Please enter a valid goal name and target amount.', 'error');
            return;
        }

        const newGoal = {
            id: 'goal-' + Date.now(),
            goal_name,
            target_amount,
            current_amount,
            created_at: new Date().toISOString()
        };

        try {
            const res = await fetch(`${API_BASE_URL}/savings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goal_name, target_amount, current_amount })
            });
            const data = await res.json();
            if (data.success && data.data) {
                savingsGoalsList.unshift(data.data);
            } else {
                savingsGoalsList.unshift(newGoal);
            }
        } catch (err) {
            savingsGoalsList.unshift(newGoal);
        }

        renderSavingsGoals();
        triggerConfetti();
        showToast(`🎯 Savings Goal "${goal_name}" Created Successfully!`, 'success');
        form.reset();
    });
}

async function loadSavingsGoals() {
    try {
        const res = await fetch(`${API_BASE_URL}/savings`);
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
            savingsGoalsList = data.data;
        }
    } catch (err) {}
    renderSavingsGoals();
}

function renderSavingsGoals() {
    const container = document.getElementById('savingsCardsContainer');
    if (!savingsGoalsList || savingsGoalsList.length === 0) {
        container.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:2rem;">No savings goals created yet. Use the form on the left to set your first goal!</div>';
        return;
    }

    container.innerHTML = savingsGoalsList.map(g => {
        const curr = parseFloat(g.current_amount) || 0;
        const target = parseFloat(g.target_amount) || 1;
        const percent = Math.min(100, Math.round((curr / target) * 100));

        return `
            <div class="goal-card">
                <div class="goal-header">
                    <span class="goal-title"><i class="fa-solid fa-bullseye text-indigo"></i> ${escapeHtml(g.goal_name)}</span>
                    <span>₹${curr.toLocaleString()} / <strong>₹${target.toLocaleString()}</strong> (${percent}%)</span>
                </div>
                <div class="progress-track" style="height:10px;">
                    <div class="progress-fill" style="width:${percent}%; background: linear-gradient(90deg, #10b981, #06b6d4);"></div>
                </div>
                <div class="deposit-row">
                    <input type="number" id="dep-${g.id}" placeholder="Add deposit amount (₹)" min="1">
                    <button class="btn-deposit" onclick="depositGoal('${g.id}')"><i class="fa-solid fa-plus"></i> Deposit</button>
                </div>
            </div>
        `;
    }).join('');
}

async function depositGoal(id) {
    const input = document.getElementById(`dep-${id}`);
    const amt = parseFloat(input.value);
    if (!amt || isNaN(amt)) return;

    try {
        await fetch(`${API_BASE_URL}/savings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deposit_amount: amt })
        });
    } catch (err) {}

    const goal = savingsGoalsList.find(x => x.id === id);
    if (goal) goal.current_amount = (parseFloat(goal.current_amount) || 0) + amt;
    renderSavingsGoals();
    triggerConfetti();
    showToast(`Deposited ₹${amt.toLocaleString()} into goal!`, 'success');
}

// =========================================================
// 7. USER SCHOLARSHIPS & APPLICATIONS
// =========================================================
function renderScholarships(list) {
    const grid = document.getElementById('scholarshipsGrid');
    if (!list || list.length === 0) {
        grid.innerHTML = '<div style="color:var(--text-muted); grid-column: 1/-1; text-align:center; padding: 2rem;">No matching scholarships found.</div>';
        return;
    }

    grid.innerHTML = list.map(s => `
        <div class="scholarship-card">
            <div>
                <span class="sch-badge">${escapeHtml(s.category)}</span>
                <h4 class="sch-title">${escapeHtml(s.title)}</h4>
                <div class="sch-provider"><i class="fa-solid fa-building"></i> ${escapeHtml(s.provider)}</div>
                <div class="sch-eligibility">${escapeHtml(s.eligibility)}</div>
            </div>
            <div class="sch-footer">
                <div class="sch-amount">${escapeHtml(s.amount)}</div>
                <button type="button" class="btn-apply-action" onclick="applyScholarship('${s.id}', '${escapeHtml(s.title)}', '${escapeHtml(s.amount)}')">Apply Now <i class="fa-solid fa-arrow-right"></i></button>
            </div>
        </div>
    `).join('');
}

async function applyScholarship(id, title, amount) {
    if (!currentUser) {
        showToast('Please Sign In to apply for scholarships.', 'warning');
        openUserAuthModal('signin');
        return;
    }

    try {
        await fetch(`${API_BASE_URL}/user/apply-scholarship`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_email: currentUser.email, scholarship_id: id, scholarship_title: title, amount })
        });
    } catch (err) {}

    triggerConfetti();
    showToast(`🎉 Applied for "${title}" successfully!`, 'success');
    userApplicationsList.unshift({ scholarship_title: title, amount, status: 'Submitted', applied_at: new Date().toISOString() });
    renderUserApplications();
}

async function loadUserApplications() {
    if (!currentUser) return;
    try {
        const res = await fetch(`${API_BASE_URL}/user/applications?email=${encodeURIComponent(currentUser.email)}`);
        const result = await res.json();
        if (result.success && result.data) {
            userApplicationsList = result.data;
            renderUserApplications();
        }
    } catch (err) {}
}

function renderUserApplications() {
    const tbody = document.getElementById('userApplicationsBody');
    document.getElementById('userAppliedCount').innerText = userApplicationsList.length;

    if (!userApplicationsList || userApplicationsList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No applications submitted yet. Go to Scholarships tab to apply.</td></tr>';
        return;
    }

    tbody.innerHTML = userApplicationsList.map(a => `
        <tr>
            <td><strong>${escapeHtml(a.scholarship_title)}</strong></td>
            <td style="color:#818cf8; font-weight:700;">${escapeHtml(a.amount)}</td>
            <td><span class="sch-badge" style="background:rgba(16,185,129,0.15); color:#10b981;">${escapeHtml(a.status || 'Submitted')}</span></td>
            <td>${new Date(a.applied_at).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

// =========================================================
// 8. EXPENSES, EMI & QUIZ
// =========================================================
function loadExpenses() {
    document.getElementById('expenseForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('txTitle').value.trim();
        const amount = parseFloat(document.getElementById('txAmount').value);
        const type = document.getElementById('txType').value;
        const category = document.getElementById('txCategory').value;
        const date = document.getElementById('txDate').value || new Date().toISOString().slice(0,10);

        if (!title || !amount) return;

        try {
            await fetch(`${API_BASE_URL}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, amount, type, category, date, full_name: currentUser ? currentUser.name : 'Guest User' })
            });
            fetchExpenses();
        } catch (err) {
            expensesList.unshift({ id: Date.now().toString(), title, amount, type, category, date });
            renderExpenses();
        }

        showToast('Transaction added!', 'success');
        document.getElementById('expenseForm').reset();
    });

    fetchExpenses();
}

async function fetchExpenses() {
    try {
        const res = await fetch(`${API_BASE_URL}/expenses`);
        const data = await res.json();
        if (data.success && data.data) expensesList = data.data;
    } catch (err) {}
    renderExpenses();
}

function renderExpenses() {
    const tbody = document.getElementById('txTableBody');
    let totalIncome = 0;
    let totalExpense = 0;

    tbody.innerHTML = expensesList.map(tx => {
        const amt = parseFloat(tx.amount);
        if (tx.type === 'income') totalIncome += amt;
        else totalExpense += amt;

        return `
            <tr>
                <td><strong>${escapeHtml(tx.title)}</strong></td>
                <td><span class="sch-badge" style="background:rgba(99,102,241,0.15); color:#818cf8;">${escapeHtml(tx.category)}</span></td>
                <td style="color:${tx.type === 'income' ? '#10b981' : '#ef4444'}; font-weight:700;">
                    ${tx.type === 'income' ? '+' : '-'}₹${amt.toLocaleString()}
                </td>
                <td><button onclick="deleteExpense('${tx.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No transactions recorded.</td></tr>';

    const netSavings = totalIncome - totalExpense;
    document.getElementById('userIncomeVal').innerText = `₹${totalIncome.toLocaleString()}`;
    document.getElementById('userExpenseVal').innerText = `₹${totalExpense.toLocaleString()}`;
    document.getElementById('userNetSavingsVal').innerText = `₹${netSavings.toLocaleString()}`;

    const usagePercent = Math.min(100, Math.round((totalExpense / 30000) * 100));
    document.getElementById('budgetProgressFill').style.width = `${usagePercent}%`;
    document.getElementById('budgetPercentText').innerText = `${usagePercent}% Used (₹${totalExpense.toLocaleString()} / ₹30,000)`;
}

async function deleteExpense(id) {
    try { await fetch(`${API_BASE_URL}/expenses/${id}`, { method: 'DELETE' }); } catch (err) {}
    expensesList = expensesList.filter(x => x.id !== id);
    renderExpenses();
}

function setupStudentPlanner() {
    const allowanceInput = document.getElementById('stuAllowance');
    const tuitionInput = document.getElementById('stuTuition');

    function calcStudentBudget() {
        const allowance = parseFloat(allowanceInput.value) || 0;
        const recMonthlyCap = Math.max(0, allowance * 0.7);
        const savingsPotential = Math.max(0, (allowance - recMonthlyCap) * 6);

        document.getElementById('stuCalcResult').innerHTML = `
            <div class="calc-badge"><i class="fa-solid fa-lightbulb"></i> Recommended Monthly Spend Cap: <strong>₹${Math.round(recMonthlyCap).toLocaleString()}</strong></div>
            <div class="calc-badge"><i class="fa-solid fa-piggy-bank"></i> Semester Savings Potential: <strong>₹${Math.round(savingsPotential).toLocaleString()}</strong></div>
        `;
    }

    allowanceInput.addEventListener('input', calcStudentBudget);
    tuitionInput.addEventListener('input', calcStudentBudget);
}

function setupEmiCalculator() {
    const loanAAmount = document.getElementById('loanAAmount');
    const loanARate = document.getElementById('loanARate');
    const loanATenure = document.getElementById('loanATenure');

    const loanBAmount = document.getElementById('loanBAmount');
    const loanBRate = document.getElementById('loanBRate');
    const loanBTenure = document.getElementById('loanBTenure');

    function calcEMI(p, rAnnual, nYears) {
        if (!p || !rAnnual || !nYears) return { emi: 0, totalInterest: 0, totalPayment: 0 };
        const r = rAnnual / 12 / 100;
        const n = nYears * 12;
        const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalPayment = emi * n;
        const totalInterest = totalPayment - p;
        return { emi: Math.round(emi), totalInterest: Math.round(totalInterest), totalPayment: Math.round(totalPayment) };
    }

    function updateComparison() {
        const resA = calcEMI(parseFloat(loanAAmount.value), parseFloat(loanARate.value), parseFloat(loanATenure.value));
        const resB = calcEMI(parseFloat(loanBAmount.value), parseFloat(loanBRate.value), parseFloat(loanBTenure.value));

        document.getElementById('emiAVal').innerText = `₹${resA.emi.toLocaleString()}/mo`;
        document.getElementById('interestAVal').innerText = `₹${resA.totalInterest.toLocaleString()}`;
        document.getElementById('totalAVal').innerText = `₹${resA.totalPayment.toLocaleString()}`;

        document.getElementById('emiBVal').innerText = `₹${resB.emi.toLocaleString()}/mo`;
        document.getElementById('interestBVal').innerText = `₹${resB.totalInterest.toLocaleString()}`;
        document.getElementById('totalBVal').innerText = `₹${resB.totalPayment.toLocaleString()}`;

        const verdictText = document.getElementById('verdictText');
        if (resA.totalInterest < resB.totalInterest) {
            verdictText.innerText = `💡 Loan Offer A saves you ₹${(resB.totalInterest - resA.totalInterest).toLocaleString()} in interest compared to Offer B.`;
        } else if (resB.totalInterest < resA.totalInterest) {
            verdictText.innerText = `💡 Loan Offer B saves you ₹${(resA.totalInterest - resB.totalInterest).toLocaleString()} in interest compared to Offer A.`;
        } else {
            verdictText.innerText = `Both loan offers have equal total cost.`;
        }
    }

    [loanAAmount, loanARate, loanATenure, loanBAmount, loanBRate, loanBTenure].forEach(el => el.addEventListener('input', updateComparison));
    updateComparison();
}

function loadQuizQuestion() {
    const q = QUIZ_QUESTIONS[currentQuizIndex];
    document.getElementById('quizQuestion').innerText = `${currentQuizIndex + 1}. ${q.q}`;
    const optsContainer = document.getElementById('quizOptions');

    optsContainer.innerHTML = q.options.map((opt, idx) => `
        <button class="quiz-opt-btn" onclick="checkQuizAnswer(${idx})">${opt}</button>
    `).join('');
}

function checkQuizAnswer(selectedIdx) {
    const q = QUIZ_QUESTIONS[currentQuizIndex];
    const btns = document.querySelectorAll('.quiz-opt-btn');

    btns.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === q.ans) btn.classList.add('correct');
        if (idx === selectedIdx && idx !== q.ans) btn.classList.add('wrong');
    });

    if (selectedIdx === q.ans) quizScore++;

    setTimeout(() => {
        currentQuizIndex++;
        if (currentQuizIndex < QUIZ_QUESTIONS.length) {
            loadQuizQuestion();
        } else {
            showQuizResults();
        }
    }, 1200);
}

function showQuizResults() {
    document.getElementById('quizCard').style.display = 'none';
    const scoreBox = document.getElementById('quizScoreBox');
    scoreBox.style.display = 'block';
    document.getElementById('quizScoreVal').innerText = `${quizScore}/${QUIZ_QUESTIONS.length}`;

    document.getElementById('restartQuizBtn').onclick = () => {
        currentQuizIndex = 0; quizScore = 0;
        scoreBox.style.display = 'none';
        document.getElementById('quizCard').style.display = 'block';
        loadQuizQuestion();
    };
}

function showToast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${escapeHtml(msg)}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function triggerConfetti() {
    if (typeof confetti === 'function') confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
}

function initCanvasAnimation() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    for (let i = 0; i < 30; i++) {
        particles.push({
            x: Math.random() * width, y: Math.random() * height,
            radius: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(129, 140, 248, 0.4)';
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
}
