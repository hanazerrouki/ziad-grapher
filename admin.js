// ============================================
// ADMIN DASHBOARD - Management Logic (UPDATED)
// ============================================

const API_BASE_URL = 'http://localhost:5000/api';
const ADMIN_PASSWORD = 'admin123';

// State
let bookings = [];

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const bookingsTbody = document.getElementById('bookings-tbody');
const pendingBookingsEl = document.getElementById('pending-bookings');
const confirmedBookingsEl = document.getElementById('confirmed-bookings');
const totalBookingsEl = document.getElementById('total-bookings');
const refreshBtn = document.getElementById('refresh-btn');

// Check if already logged in
if (sessionStorage.getItem('adminLoggedIn') === 'true') {
    showDashboard();
}

// Login Handler
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;
    
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
    } else {
        loginError.textContent = 'كلمة المرور غير صحيحة';
    }
});

// Logout Handler
logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('adminLoggedIn');
    loginSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
    document.getElementById('admin-password').value = '';
});

// Show Dashboard
async function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    await loadBookings();
    await updateStats();
}

// Load Bookings from Server
async function loadBookings() {
    bookingsTbody.innerHTML = '<tr><td colspan="9" class="loading">جاري تحميل البيانات...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
        const data = await response.json();
        bookings = data.bookings || [];
        renderBookingsTable();
    } catch (error) {
        console.error('Error loading bookings:', error);
        bookingsTbody.innerHTML = '<tr><td colspan="9" class="loading">حدث خطأ في تحميل البيانات</td></tr>';
    }
}

// Render Bookings Table with Clear Confirm Button
function renderBookingsTable() {
    if (!bookings.length) {
        bookingsTbody.innerHTML = '<tr><td colspan="9" class="loading">لا توجد حجوزات حالياً</td></tr>';
        return;
    }
    
    bookingsTbody.innerHTML = bookings.map((booking, index) => `
        <tr data-id="${booking.id}">
            <td>${index + 1}</td>
            <td>${escapeHtml(booking.fullname)}</td>
            <td>${escapeHtml(booking.phone)}</td>
            <td>${escapeHtml(booking.location || 'غير محدد')}</td>
            <td>${getEventTypeName(booking.event_type)}</td>
            <td class="date-cell">${booking.event_date}</td>
            <td class="services-cell">${booking.services || '-'}</td>
            <td>
                <span class="status-badge ${booking.status === 'confirmed' ? 'confirmed' : 'pending'}">
                    ${booking.status === 'confirmed' ? 'مؤكد' : 'قيد الانتظار'}
                </span>
            </td>
            <td class="action-buttons">
                ${booking.status === 'pending' ? `
                    <button class="confirm-btn" onclick="confirmBooking(${booking.id}, '${booking.event_date}')" title="تأكيد الحجز">
                        <i class="fas fa-check-circle"></i> تأكيد
                    </button>
                ` : ''}
                <button class="edit-btn" onclick="editBooking(${booking.id})" title="تعديل التاريخ">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteBooking(${booking.id})" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Update Stats
async function updateStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        const stats = await response.json();
        
        pendingBookingsEl.textContent = stats.pending || 0;
        confirmedBookingsEl.textContent = stats.confirmed || 0;
        totalBookingsEl.textContent = stats.total || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Confirm Booking - This makes the date officially booked and unavailable
window.confirmBooking = async function(id, eventDate) {
    if (confirm(`هل أنت متأكد من تأكيد حجز التاريخ: ${eventDate}؟\n\nبعد التأكيد، لن يتمكن أي عميل آخر من حجز هذا التاريخ.`)) {
        try {
            const response = await fetch(`${API_BASE_URL}/booking/${id}/confirm`, {
                method: 'PUT'
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                alert(`✅ تم تأكيد الحجز بنجاح!\nالتاريخ ${eventDate} أصبح محجوزاً الآن.`);
                await loadBookings();
                await updateStats();
            } else {
                alert(result.message || '❌ حدث خطأ أثناء التأكيد');
            }
        } catch (error) {
            console.error('Error confirming booking:', error);
            alert('❌ حدث خطأ في الاتصال بالخادم');
        }
    }
};

// Delete Booking
window.deleteBooking = async function(id) {
    if (confirm('هل أنت متأكد من حذف هذا الحجز؟')) {
        try {
            const response = await fetch(`${API_BASE_URL}/booking/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await loadBookings();
                await updateStats();
                alert('تم حذف الحجز بنجاح');
            } else {
                alert('حدث خطأ أثناء الحذف');
            }
        } catch (error) {
            console.error('Error deleting booking:', error);
            alert('حدث خطأ في الاتصال بالخادم');
        }
    }
};

// Edit Booking Date
window.editBooking = async function(id) {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;
    
    const newDate = prompt('تعديل تاريخ المناسبة (YYYY-MM-DD):', booking.event_date);
    if (newDate && newDate !== booking.event_date) {
        try {
            const response = await fetch(`${API_BASE_URL}/booking/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event_date: newDate })
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                await loadBookings();
                await updateStats();
                alert('تم تحديث التاريخ بنجاح');
            } else {
                alert(result.message || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Error updating booking:', error);
            alert('حدث خطأ في الاتصال بالخادم');
        }
    }
};

// Refresh
refreshBtn.addEventListener('click', async () => {
    await loadBookings();
    await updateStats();
    alert('تم تحديث البيانات');
});

// Helper Functions
function getEventTypeName(type) {
    const types = {
        'wedding': 'عرس / زفاف',
        'engagement': 'خطوبة',
        'graduation': 'تخرج',
        'portrait': 'جلسة شخصية',
        'event': 'مناسبة خاصة'
    };
    return types[type] || type;
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}