// =========================================================
// FINHUB — FINANCIAL PLATFORM APPLICATION ENGINE (v2.5)
// Multi-Module Logic: Expenses, Student Planner, Scholarships,
// Savings Goals, Loan EMI Comparison, Subscriptions, Literacy Quiz, i18n
// =========================================================

const defaultOrigin = (typeof window !== 'undefined' && window.location.origin && window.location.origin.startsWith('http')) 
    ? `${window.location.origin}/api` 
    : 'http://localhost:5001/api';

let API_BASE_URL = defaultOrigin;
const CANDIDATE_PORTS = [5001, 5005, 5002, 5003, 5004, 5000];

// State Variables
let currentLang = 'en';
let expensesList = [];
let savingsGoalsList = [];
let subscriptionsList = [];
let scholarshipsList = [];
let currentQuizIndex = 0;
let quizScore = 0;

// Hindi & English Dictionary (i18n)
const I18N = {
    en: {
        subTitle: "Smart Financial Services & Literacy Hub",
        usersBtn: "Database Records",
        tabDashboard: "Expenses & Budget",
        tabStudent: "Student & Scholarships",
        tabSavings: "Savings Goals",
        tabEmi: "EMI Loan Compare",
        tabSubs: "Subscriptions",
        tabLiteracy: "Financial Literacy",
        tabRegister: "Registration",
        totalIncome: "Total Income",
        totalExpense: "Total Expenses",
        netSavings: "Net Savings",
        monthlyBudget: "Monthly Budget",
        budgetUsage: "Monthly Budget Limit Usage",
        addTxTitle: "Add Transaction",
        addTxSub: "Record income or expense entries into database.",
        lblTitle: "Title",
        lblAmount: "Amount (₹)",
        lblType: "Type",
        lblCategory: "Category",
        lblDate: "Date",
        btnAddTx: "Add Transaction",
        recentTxTitle: "Recent Transactions",
        recentTxSub: "Live sync with Supabase cloud database.",
        studentPlannerTitle: "Student Finance & Allowance Planner",
        studentPlannerSub: "Calculate semester budgets and recommended monthly spending limits for students.",
        monthlyAllowance: "Monthly Allowance / Stipend (₹)",
        tuitionFee: "Semester Tuition & Exam Fee (₹)",
        scholarshipTitle: "Active Scholarships & Financial Aid Directory",
        scholarshipSub: "Discover government, corporate, and merit scholarships for higher education.",
        createGoalTitle: "Set New Savings Goal",
        createGoalSub: "Track target goals like Emergency Fund, Laptop, or College Tuition.",
        lblGoalName: "Goal Name",
        lblTargetAmount: "Target Amount (₹)",
        lblInitialSaved: "Initial Savings (₹)",
        lblTargetDate: "Target Date",
        btnAddGoal: "Create Goal",
        yourGoalsTitle: "Your Active Goals",
        yourGoalsSub: "Deposit funds and monitor your visual progress rings.",
        emiTitle: "Side-by-Side Loan EMI Comparison Calculator",
        emiSub: "Compare monthly EMI, total interest, and total payout between 2 bank loan offers.",
        addSubTitle: "Track New Subscription",
        addSubSub: "Monitor monthly SaaS, streaming services, and membership recurring burn.",
        lblServiceName: "Service Name",
        lblSubAmount: "Amount (₹)"
    },
    hi: {
        subTitle: "स्मार्ट वित्तीय सेवाएं और साक्षरता मंच",
        usersBtn: "डेटाबेस रिकॉर्ड्स",
        tabDashboard: "खर्च एवं बजट",
        tabStudent: "छात्र एवं छात्रवृत्ति",
        tabSavings: "बचत लक्ष्य",
        tabEmi: "ईएमआई लोन तुलना",
        tabSubs: "सब्सक्रिप्शन",
        tabLiteracy: "वित्तीय साक्षरता",
        tabRegister: "पंजीकरण",
        totalIncome: "कुल आय",
        totalExpense: "कुल खर्च",
        netSavings: "शुद्ध बचत",
        monthlyBudget: "मासिक बजट",
        budgetUsage: "मासिक बजट सीमा उपयोग",
        addTxTitle: "लेनदेन जोड़ें",
        addTxSub: "डेटाबेस में आय या खर्च दर्ज करें।",
        lblTitle: "शीर्षक",
        lblAmount: "राशि (₹)",
        lblType: "प्रकार",
        lblCategory: "श्रेणी",
        lblDate: "दिनांक",
        btnAddTx: "लेनदेन जोड़ें",
        recentTxTitle: "हाल के लेनदेन",
        recentTxSub: "सुपाबेस क्लाउड डेटाबेस के साथ लाइव सिंक।",
        studentPlannerTitle: "छात्र वित्त और भत्ता योजनाकार",
        studentPlannerSub: "छात्रों के लिए सेमेस्टर बजट और अनुशंसित मासिक खर्च सीमा की गणना करें।",
        monthlyAllowance: "मासिक भत्ता / वजीफा (₹)",
        tuitionFee: "सेमेस्टर ट्यूशन और परीक्षा शुल्क (₹)",
        scholarshipTitle: "सक्रिय छात्रवृत्ति एवं वित्तीय सहायता निर्देशिका",
        scholarshipSub: "उच्च शिक्षा के लिए सरकारी, कॉर्पोरेट और योग्यता छात्रवृत्ति खोजें।",
        createGoalTitle: "नया बचत लक्ष्य निर्धारित करें",
        createGoalSub: "आपातकालीन कोष, लैपटॉप, या कॉलेज की पढ़ाई जैसे लक्ष्यों को ट्रैक करें।",
        lblGoalName: "लक्ष्य का नाम",
        lblTargetAmount: "लक्ष्य राशि (₹)",
        lblInitialSaved: "प्रारंभिक बचत (₹)",
        lblTargetDate: "लक्ष्य तिथि",
        btnAddGoal: "लक्ष्य बनाएं",
        yourGoalsTitle: "आपके सक्रिय लक्ष्य",
        yourGoalsSub: "राशि जमा करें और अपनी प्रगति की निगरानी करें।",
        emiTitle: "ऋण ईएमआई तुलना कैलकुलेटर",
        emiSub: "2 बैंक ऋण प्रस्तावों के बीच मासिक ईएमआई, कुल ब्याज और कुल भुगतान की तुलना करें।",
        addSubTitle: "नया सब्सक्रिप्शन ट्रैक करें",
        addSubSub: "मासिक आवर्ती खर्चों की निगरानी करें।",
        lblServiceName: "सेवा का नाम",
        lblSubAmount: "राशि (₹)"
    }
};

// Literacy Quiz Questions
const QUIZ_QUESTIONS = [
    {
        q: "What does the 50/30/20 budgeting rule suggest allocating 20% of your income to?",
        options: ["Entertainment & Fun", "Needs & Rent", "Savings & Investments", "Dining Out"],
        ans: 2
    },
    {
        q: "What is an EMI in financial loans?",
        options: ["Easy Money Investment", "Equated Monthly Installment", "Estimated Monthly Income", "Extra Monthly Interest"],
        ans: 1
    },
    {
        q: "Which credit score (CIBIL) is generally considered healthy for loan approvals in India?",
        options: ["Below 500", "500 - 600", "750 or above", "Any score is fine"],
        ans: 2
    },
    {
        q: "What is a major advantage of starting a SIP (Systematic Investment Plan) early?",
        options: ["Compounding Interest Growth", "Zero Income Tax", "Guaranteed 100% Returns", "No Market Risks"],
        ans: 0
    },
    {
        q: "Under Section 80C of Income Tax Act in India, what is the maximum tax deduction limit?",
        options: ["₹50,000", "₹1,50,000", "₹5,00,000", "₹2,50,000"],
        ans: 1
    }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initCanvasAnimation();
    checkBackendHealth();
    setupNavigation();
    setupEventListeners();
    setupEmiCalculator();
    setupStudentPlanner();
    loadScholarships();
    loadExpenses();
    loadSavingsGoals();
    loadSubscriptions();
    loadQuizQuestion();
});

// =========================================================
// 1. BACKEND HEALTH CHECK & DISCOVERY
// =========================================================
async function checkBackendHealth() {
    const statusDot = document.querySelector('#systemBadge .status-dot');
    const systemStatusText = document.getElementById('systemStatusText');
    const pingBadge = document.getElementById('pingBadge');
    const startTime = performance.now();

    for (const port of CANDIDATE_PORTS) {
        try {
            const testUrl = `http://localhost:${port}/api`;
            const res = await fetch(`${testUrl}/health`, { headers: { 'Accept': 'application/json' } });
            const data = await res.json();
            const latency = Math.round(performance.now() - startTime);

            if (data.status === 'online') {
                API_BASE_URL = testUrl;
                statusDot.className = 'status-dot online';
                systemStatusText.innerText = `Online (${port})`;
                pingBadge.innerText = `${latency} ms`;
                return;
            }
        } catch (err) {}
    }

    statusDot.className = 'status-dot error';
    systemStatusText.innerText = 'Offline';
    pingBadge.innerText = 'Err';
}

// =========================================================
// 2. NAVIGATION & BILINGUAL I18N ENGINE
// =========================================================
function setupNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    // Language Toggle
    const langToggleBtn = document.getElementById('langToggleBtn');
    const langLabel = document.getElementById('langLabel');

    langToggleBtn.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'hi' : 'en';
        document.documentElement.setAttribute('data-lang', currentLang);
        langLabel.innerText = currentLang === 'en' ? 'HI' : 'EN';
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
// 3. EXPENSE & BUDGET MANAGER
// =========================================================
function setupEventListeners() {
    // Expense Form
    document.getElementById('expenseForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('txTitle').value.trim();
        const amount = parseFloat(document.getElementById('txAmount').value);
        const type = document.getElementById('txType').value;
        const category = document.getElementById('txCategory').value;
        const date = document.getElementById('txDate').value || new Date().toISOString().slice(0,10);

        if (!title || !amount) return;

        try {
            const res = await fetch(`${API_BASE_URL}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, amount, type, category, date })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Transaction recorded into Supabase!', 'success');
                document.getElementById('expenseForm').reset();
                loadExpenses();
            }
        } catch (err) {
            // Local state fallback
            expensesList.unshift({ id: Date.now().toString(), title, amount, type, category, date });
            renderExpenses();
            showToast('Transaction added locally!', 'success');
            document.getElementById('expenseForm').reset();
        }
    });

    // Registration Form
    document.getElementById('registrationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const full_name = document.getElementById('fullName').value.trim();
        const father_name = document.getElementById('fatherName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();

        try {
            const res = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name, father_name, email, phone })
            });
            const data = await res.json();
            if (data.success) {
                triggerConfetti();
                showToast('🎉 Account registered successfully!', 'success');
                document.getElementById('registrationForm').reset();
            } else {
                showToast(data.error || 'Registration failed.', 'error');
            }
        } catch (err) {
            showToast('Registration submitted locally.', 'success');
        }
    });

    // Modal Trigger
    document.getElementById('viewUsersBtn').addEventListener('click', loadRegisteredUsersModal);
    document.getElementById('closeModalBtn').addEventListener('click', () => {
        document.getElementById('usersModal').classList.remove('active');
    });
}

async function loadExpenses() {
    try {
        const res = await fetch(`${API_BASE_URL}/expenses`);
        const data = await res.json();
        if (data.success && data.data) {
            expensesList = data.data;
        }
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
                <td><span class="tag-badge ${tx.type}">${escapeHtml(tx.category)}</span></td>
                <td style="color:${tx.type === 'income' ? '#10b981' : '#ef4444'}; font-weight:700;">
                    ${tx.type === 'income' ? '+' : '-'}₹${amt.toLocaleString()}
                </td>
                <td><button onclick="deleteExpense('${tx.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No transactions recorded yet.</td></tr>';

    const netSavings = totalIncome - totalExpense;
    document.getElementById('totalIncomeVal').innerText = `₹${totalIncome.toLocaleString()}`;
    document.getElementById('totalExpenseVal').innerText = `₹${totalExpense.toLocaleString()}`;
    document.getElementById('netSavingsVal').innerText = `₹${netSavings.toLocaleString()}`;

    // Budget Bar Calculation
    const budgetLimit = 30000;
    const usagePercent = Math.min(100, Math.round((totalExpense / budgetLimit) * 100));
    document.getElementById('budgetProgressFill').style.width = `${usagePercent}%`;
    document.getElementById('budgetPercentText').innerText = `${usagePercent}% Used (₹${totalExpense.toLocaleString()} / ₹${budgetLimit.toLocaleString()})`;
}

async function deleteExpense(id) {
    try {
        await fetch(`${API_BASE_URL}/expenses/${id}`, { method: 'DELETE' });
    } catch (err) {}
    expensesList = expensesList.filter(x => x.id !== id);
    renderExpenses();
}

// =========================================================
// 4. STUDENT FINANCE & SCHOLARSHIP FINDER
// =========================================================
function setupStudentPlanner() {
    const allowanceInput = document.getElementById('stuAllowance');
    const tuitionInput = document.getElementById('stuTuition');

    function calcStudentBudget() {
        const allowance = parseFloat(allowanceInput.value) || 0;
        const tuition = parseFloat(tuitionInput.value) || 0;

        const monthlyTuitionShare = tuition / 6; // 6 months per semester
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

async function loadScholarships() {
    try {
        const res = await fetch(`${API_BASE_URL}/scholarships`);
        const data = await res.json();
        if (data.success && data.data) scholarshipsList = data.data;
    } catch (err) {}

    renderScholarships(scholarshipsList);

    // Search & Filter Listeners
    const schSearchInput = document.getElementById('schSearchInput');
    const schCategoryFilter = document.getElementById('schCategoryFilter');

    function filterSch() {
        const q = schSearchInput.value.toLowerCase().trim();
        const cat = schCategoryFilter.value;

        const filtered = scholarshipsList.filter(s => {
            const matchesQuery = !q || s.title.toLowerCase().includes(q) || s.provider.toLowerCase().includes(q) || s.eligibility.toLowerCase().includes(q);
            const matchesCat = cat === 'all' || s.category === cat;
            return matchesQuery && matchesCat;
        });

        renderScholarships(filtered);
    }

    schSearchInput.addEventListener('input', filterSch);
    schCategoryFilter.addEventListener('change', filterSch);
}

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
                <a href="${s.link}" target="_blank" class="btn-apply">Apply <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
            </div>
        </div>
    `).join('');
}

// =========================================================
// 5. SAVINGS GOAL PLANNER
// =========================================================
function loadSavingsGoals() {
    document.getElementById('savingsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const goal_name = document.getElementById('goalName').value.trim();
        const target_amount = parseFloat(document.getElementById('goalTarget').value);
        const current_amount = parseFloat(document.getElementById('goalInitial').value) || 0;
        const target_date = document.getElementById('goalDate').value || null;

        if (!goal_name || !target_amount) return;

        try {
            const res = await fetch(`${API_BASE_URL}/savings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goal_name, target_amount, current_amount, target_date })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Savings Goal created!', 'success');
                document.getElementById('savingsForm').reset();
                fetchSavingsGoals();
            }
        } catch (err) {
            savingsGoalsList.push({ id: Date.now().toString(), goal_name, target_amount, current_amount, target_date });
            renderSavingsGoals();
            document.getElementById('savingsForm').reset();
        }
    });

    fetchSavingsGoals();
}

async function fetchSavingsGoals() {
    try {
        const res = await fetch(`${API_BASE_URL}/savings`);
        const data = await res.json();
        if (data.success && data.data) savingsGoalsList = data.data;
    } catch (err) {}
    renderSavingsGoals();
}

function renderSavingsGoals() {
    const container = document.getElementById('savingsCardsContainer');
    if (!savingsGoalsList || savingsGoalsList.length === 0) {
        container.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:2rem;">No savings goals created yet.</div>';
        return;
    }

    container.innerHTML = savingsGoalsList.map(g => {
        const curr = parseFloat(g.current_amount) || 0;
        const target = parseFloat(g.target_amount) || 1;
        const percent = Math.min(100, Math.round((curr / target) * 100));

        return `
            <div class="goal-card">
                <div class="goal-header">
                    <span class="goal-title">${escapeHtml(g.goal_name)}</span>
                    <span class="goal-amounts">₹${curr.toLocaleString()} / <strong>₹${target.toLocaleString()}</strong></span>
                </div>
                <div class="progress-track" style="height:10px;">
                    <div class="progress-fill" style="width:${percent}%; background: linear-gradient(90deg, #10b981, #06b6d4);"></div>
                </div>
                <div class="deposit-row">
                    <input type="number" id="dep-${g.id}" placeholder="Add deposit (₹)" min="1">
                    <button class="btn-deposit" onclick="depositGoal('${g.id}')"><i class="fa-solid fa-plus"></i> Deposit</button>
                </div>
            </div>
        `;
    }).join('');
}

async function depositGoal(id) {
    const input = document.getElementById(`dep-${id}`);
    const amt = parseFloat(input.value);
    if (!amt) return;

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
    showToast(`Deposited ₹${amt} into goal!`, 'success');
}

// =========================================================
// 6. EMI & LOAN COMPARISON CALCULATOR
// =========================================================
function setupEmiCalculator() {
    const loanAAmount = document.getElementById('loanAAmount');
    const loanARate = document.getElementById('loanARate');
    const loanATenure = document.getElementById('loanATenure');

    const loanBAmount = document.getElementById('loanBAmount');
    const loanBRate = document.getElementById('loanBRate');
    const loanBTenure = document.getElementById('loanBTenure');

    function calculateLoanEMI(p, rAnnual, nYears) {
        if (!p || !rAnnual || !nYears) return { emi: 0, totalInterest: 0, totalPayment: 0 };
        const r = rAnnual / 12 / 100;
        const n = nYears * 12;
        const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalPayment = emi * n;
        const totalInterest = totalPayment - p;
        return { emi: Math.round(emi), totalInterest: Math.round(totalInterest), totalPayment: Math.round(totalPayment) };
    }

    function updateLoanComparison() {
        const resA = calculateLoanEMI(parseFloat(loanAAmount.value), parseFloat(loanARate.value), parseFloat(loanATenure.value));
        const resB = calculateLoanEMI(parseFloat(loanBAmount.value), parseFloat(loanBRate.value), parseFloat(loanBTenure.value));

        document.getElementById('emiAVal').innerText = `₹${resA.emi.toLocaleString()}/mo`;
        document.getElementById('interestAVal').innerText = `₹${resA.totalInterest.toLocaleString()}`;
        document.getElementById('totalAVal').innerText = `₹${resA.totalPayment.toLocaleString()}`;

        document.getElementById('emiBVal').innerText = `₹${resB.emi.toLocaleString()}/mo`;
        document.getElementById('interestBVal').innerText = `₹${resB.totalInterest.toLocaleString()}`;
        document.getElementById('totalBVal').innerText = `₹${resB.totalPayment.toLocaleString()}`;

        const verdictText = document.getElementById('verdictText');
        if (resA.totalInterest < resB.totalInterest) {
            const diff = resB.totalInterest - resA.totalInterest;
            verdictText.innerText = `💡 Loan Offer A is better! You save ₹${diff.toLocaleString()} in total interest compared to Offer B.`;
        } else if (resB.totalInterest < resA.totalInterest) {
            const diff = resA.totalInterest - resB.totalInterest;
            verdictText.innerText = `💡 Loan Offer B is better! You save ₹${diff.toLocaleString()} in total interest compared to Offer A.`;
        } else {
            verdictText.innerText = `Both loan offers have equal total cost.`;
        }
    }

    [loanAAmount, loanARate, loanATenure, loanBAmount, loanBRate, loanBTenure].forEach(el => el.addEventListener('input', updateLoanComparison));
    updateLoanComparison();
}

// =========================================================
// 7. SUBSCRIPTION TRACKER
// =========================================================
function loadSubscriptions() {
    document.getElementById('subForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const service_name = document.getElementById('subName').value.trim();
        const amount = parseFloat(document.getElementById('subAmount').value);
        const billing_cycle = document.getElementById('subCycle').value;
        const next_billing_date = document.getElementById('subDate').value || null;

        if (!service_name || !amount) return;

        try {
            const res = await fetch(`${API_BASE_URL}/subscriptions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ service_name, amount, billing_cycle, next_billing_date })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Subscription added!', 'success');
                document.getElementById('subForm').reset();
                fetchSubs();
            }
        } catch (err) {
            subscriptionsList.push({ id: Date.now().toString(), service_name, amount, billing_cycle, next_billing_date });
            renderSubs();
            document.getElementById('subForm').reset();
        }
    });

    fetchSubs();
}

async function fetchSubs() {
    try {
        const res = await fetch(`${API_BASE_URL}/subscriptions`);
        const data = await res.json();
        if (data.success && data.data) subscriptionsList = data.data;
    } catch (err) {}
    renderSubs();
}

function renderSubs() {
    const listEl = document.getElementById('subsList');
    let totalBurn = 0;

    listEl.innerHTML = subscriptionsList.map(s => {
        const amt = parseFloat(s.amount);
        const monthlyAmt = s.billing_cycle === 'yearly' ? amt / 12 : amt;
        totalBurn += monthlyAmt;

        return `
            <div class="sub-item">
                <div class="sub-info">
                    <h5>${escapeHtml(s.service_name)}</h5>
                    <p>Cycle: ${s.billing_cycle} | Next: ${s.next_billing_date || 'N/A'}</p>
                </div>
                <div class="sub-right">
                    <span class="sub-price">₹${amt.toLocaleString()}</span>
                    <button onclick="deleteSub('${s.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join('') || '<div style="color:var(--text-muted); text-align:center; padding:1.5rem;">No active subscriptions tracked.</div>';

    document.getElementById('totalSubBurn').innerText = `₹${Math.round(totalBurn).toLocaleString()}/mo`;
}

async function deleteSub(id) {
    try { await fetch(`${API_BASE_URL}/subscriptions/${id}`, { method: 'DELETE' }); } catch (err) {}
    subscriptionsList = subscriptionsList.filter(x => x.id !== id);
    renderSubs();
}

// =========================================================
// 8. FINANCIAL LITERACY QUIZ
// =========================================================
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
        currentQuizIndex = 0;
        quizScore = 0;
        scoreBox.style.display = 'none';
        document.getElementById('quizCard').style.display = 'block';
        loadQuizQuestion();
    };
}

// =========================================================
// 9. DATABASE MODAL & TOAST SYSTEM
// =========================================================
async function loadRegisteredUsersModal() {
    const modal = document.getElementById('usersModal');
    const tbody = document.getElementById('usersTableBody');
    modal.classList.add('active');

    try {
        const res = await fetch(`${API_BASE_URL}/registrations`);
        const data = await res.json();
        if (data.success && data.data) {
            tbody.innerHTML = data.data.map(u => `
                <tr>
                    <td><strong>${escapeHtml(u.full_name)}</strong></td>
                    <td>${escapeHtml(u.father_name)}</td>
                    <td>${escapeHtml(u.email)}</td>
                    <td>${u.phone ? escapeHtml(u.phone) : 'N/A'}</td>
                    <td>${new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
            `).join('');
        }
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5">Failed to fetch database records.</td></tr>';
    }
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

// =========================================================
// 10. BACKGROUND CANVAS PARTICLES
// =========================================================
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
