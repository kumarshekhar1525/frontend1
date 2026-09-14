// =========================================================
// REGISTRATION FORM FRONTEND APPLICATION LOGIC
// Express Backend Base URL (Default port 5001, fallback to 5000/5002)
let API_BASE_URL = 'http://localhost:5001/api';
const CANDIDATE_PORTS = [5001, 5000, 5002, 5003];

// DOM Element References
const form = document.getElementById('registrationForm');
const fullNameInput = document.getElementById('fullName');
const fatherNameInput = document.getElementById('fatherName');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const termsCheck = document.getElementById('termsCheck');
const submitBtn = document.getElementById('submitBtn');
const togglePasswordBtn = document.getElementById('togglePasswordBtn');
const strengthBar = document.getElementById('strengthBar');
const systemStatusText = document.getElementById('systemStatusText');
const systemBadge = document.getElementById('systemBadge');
const userCountBadge = document.getElementById('userCount');
const toastContainer = document.getElementById('toastContainer');

// Modal Elements
const viewUsersBtn = document.getElementById('viewUsersBtn');
const usersModal = document.getElementById('usersModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalLoading = document.getElementById('modalLoading');
const modalEmpty = document.getElementById('modalEmpty');
const usersTableWrapper = document.getElementById('usersTableWrapper');
const usersTableBody = document.getElementById('usersTableBody');

// State Variables
let isBackendOnline = false;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    checkBackendHealth();
    fetchUserCount();
    setupEventListeners();
});

// Event Listeners Setup
function setupEventListeners() {
    // Password Toggle
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordBtn.querySelector('i').className = type === 'password' ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
    });

    // Password Strength Check
    passwordInput.addEventListener('input', updatePasswordStrength);

    // Form Field Realtime Validation
    fullNameInput.addEventListener('input', () => validateRequired(fullNameInput, 'fullNameError'));
    fatherNameInput.addEventListener('input', () => validateRequired(fatherNameInput, 'fatherNameError'));
    emailInput.addEventListener('input', () => validateEmailInput());
    confirmPasswordInput.addEventListener('input', () => validatePasswordMatch());

    // Form Submission
    form.addEventListener('submit', handleFormSubmit);

    // Modal Triggers
    viewUsersBtn.addEventListener('click', openUsersModal);
    closeModalBtn.addEventListener('click', closeUsersModal);
    usersModal.addEventListener('click', (e) => {
        if (e.target === usersModal) closeUsersModal();
    });
}

// 1. Health Check & Database Status (Auto-discovers active port)
async function checkBackendHealth() {
    const statusDot = systemBadge.querySelector('.status-dot');
    
    for (const port of CANDIDATE_PORTS) {
        try {
            const testUrl = `http://localhost:${port}/api`;
            const res = await fetch(`${testUrl}/health`);
            const data = await res.json();

            if (data.status === 'online') {
                API_BASE_URL = testUrl;
                isBackendOnline = true;
                statusDot.className = 'status-dot online';
                
                if (data.tableExists) {
                    systemStatusText.innerText = `Online (Port ${port})`;
                } else {
                    systemStatusText.innerText = `Run SQL Schema (Port ${port})`;
                    showToast('Run supabase/schema.sql in Supabase SQL Editor to enable database tables.', 'error', 7000);
                }
                return;
            }
        } catch (err) {
            // Try next port candidate
        }
    }

    isBackendOnline = false;
    statusDot.className = 'status-dot error';
    systemStatusText.innerText = 'Backend Offline';
}

// 2. Fetch User Count for Header Counter
async function fetchUserCount() {
    try {
        const res = await fetch(`${API_BASE_URL}/registrations`);
        const result = await res.json();

        if (result.success) {
            userCountBadge.innerText = result.count || 0;
        }
    } catch (err) {
        userCountBadge.innerText = '0';
    }
}

// 3. Validation Helpers
function validateRequired(input, errorId) {
    const group = input.closest('.input-group');
    if (!input.value.trim()) {
        group.classList.add('error');
        group.classList.remove('valid');
        return false;
    } else {
        group.classList.remove('error');
        group.classList.add('valid');
        return true;
    }
}

function validateEmailInput() {
    const group = emailInput.closest('.input-group');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
        group.classList.add('error');
        group.classList.remove('valid');
        return false;
    } else {
        group.classList.remove('error');
        group.classList.add('valid');
        return true;
    }
}

function validatePasswordMatch() {
    const group = confirmPasswordInput.closest('.input-group');
    if (confirmPasswordInput.value !== passwordInput.value || !confirmPasswordInput.value) {
        group.classList.add('error');
        return false;
    } else {
        group.classList.remove('error');
        return true;
    }
}

function updatePasswordStrength() {
    const val = passwordInput.value;
    let strength = 0;

    if (val.length >= 6) strength += 30;
    if (val.length >= 10) strength += 20;
    if (/[A-Z]/.test(val)) strength += 20;
    if (/[0-9]/.test(val)) strength += 15;
    if (/[^A-Za-z0-9]/.test(val)) strength += 15;

    strengthBar.style.width = `${strength}%`;

    if (strength < 40) {
        strengthBar.style.backgroundColor = '#ef4444';
    } else if (strength < 75) {
        strengthBar.style.backgroundColor = '#eab308';
    } else {
        strengthBar.style.backgroundColor = '#10b981';
    }
}

// 4. Form Submission Handler
async function handleFormSubmit(e) {
    e.preventDefault();

    // Run Full Form Validation
    const isFullNameValid = validateRequired(fullNameInput, 'fullNameError');
    const isFatherNameValid = validateRequired(fatherNameInput, 'fatherNameError');
    const isEmailValid = validateEmailInput();
    const isPasswordValid = validateRequired(passwordInput, 'passwordError');
    const isPasswordMatch = validatePasswordMatch();

    const termsError = document.getElementById('termsError');
    if (!termsCheck.checked) {
        termsError.style.display = 'block';
    } else {
        termsError.style.display = 'none';
    }

    if (!isFullNameValid || !isFatherNameValid || !isEmailValid || !isPasswordValid || !isPasswordMatch || !termsCheck.checked) {
        showToast('Please fix the highlighted errors before submitting.', 'error');
        return;
    }

    // Set Button Loading State
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const payload = {
        full_name: fullNameInput.value.trim(),
        father_name: fatherNameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim() || null
    };

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showToast('🎉 Registration Successful! Saved to Supabase database.', 'success');
            form.reset();
            strengthBar.style.width = '0%';
            document.querySelectorAll('.input-group').forEach(g => g.classList.remove('valid', 'error'));
            fetchUserCount();
        } else {
            showToast(data.error || 'Registration failed.', 'error');
        }
    } catch (err) {
        showToast('Unable to connect to backend server at http://localhost:5000', 'error');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// 5. Toast Notification System
function showToast(message, type = 'success', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="${type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation'}"></i>
        <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// 6. Registered Users Modal Logic
async function openUsersModal() {
    usersModal.classList.add('active');
    modalLoading.style.display = 'flex';
    usersTableWrapper.style.display = 'none';
    modalEmpty.style.display = 'none';

    try {
        const res = await fetch(`${API_BASE_URL}/registrations`);
        const result = await res.json();

        modalLoading.style.display = 'none';

        if (result.success && result.data.length > 0) {
            usersTableBody.innerHTML = result.data.map(user => `
                <tr>
                    <td><strong>${escapeHtml(user.full_name)}</strong></td>
                    <td>${escapeHtml(user.father_name)}</td>
                    <td>${escapeHtml(user.email)}</td>
                    <td>${user.phone ? escapeHtml(user.phone) : '<span style="color:#6b7280;">N/A</span>'}</td>
                    <td>${new Date(user.created_at).toLocaleDateString()} ${new Date(user.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                </tr>
            `).join('');
            usersTableWrapper.style.display = 'block';
        } else {
            modalEmpty.style.display = 'flex';
            if (result.error) {
                modalEmpty.querySelector('p').innerText = result.error;
            }
        }
    } catch (err) {
        modalLoading.style.display = 'none';
        modalEmpty.style.display = 'flex';
        modalEmpty.querySelector('p').innerText = 'Failed to load records from server.';
    }
}

function closeUsersModal() {
    usersModal.classList.remove('active');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}
