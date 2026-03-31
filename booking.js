// ============================================
// BOOKING PAGE - Calendar & Form Logic (UPDATED)
// ============================================

const API_BASE_URL = 'http://localhost:5000/api';

// Calendar State
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let confirmedDates = []; // Only dates that are CONFIRMED (status='confirmed')
let selectedDate = null;

// Initialize Calendar
async function initCalendar() {
    await fetchConfirmedDates();
    renderCalendar();
}

// Fetch ONLY confirmed dates from server (not pending)
async function fetchConfirmedDates() {
    try {
        const response = await fetch(`${API_BASE_URL}/confirmed-dates`);
        const data = await response.json();
        confirmedDates = data.confirmed_dates || [];
        console.log('Confirmed dates (booked):', confirmedDates); // For debugging
    } catch (error) {
        console.error('Error fetching confirmed dates:', error);
        confirmedDates = [];
    }
}

// Render Calendar
function renderCalendar() {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startDayOfWeek = firstDayOfMonth.getDay();
    
    const daysInMonth = lastDayOfMonth.getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    
    const calendarContainer = document.getElementById('calendar-container');
    if (!calendarContainer) return;
    
    const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    const weekdayNames = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
    
    let html = `
        <div class="calendar-header">
            <button class="calendar-nav" onclick="prevMonth()"><i class="fas fa-chevron-right"></i></button>
            <span class="calendar-month-year">${monthNames[currentMonth]} ${currentYear}</span>
            <button class="calendar-nav" onclick="nextMonth()"><i class="fas fa-chevron-left"></i></button>
        </div>
        <div class="calendar-weekdays">
            ${weekdayNames.map(day => `<div class="calendar-weekday">${day}</div>`).join('')}
        </div>
        <div class="calendar-days">
    `;
    
    // Previous month days
    let prevMonthStart = startDayOfWeek;
    for (let i = prevMonthStart - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        html += `<div class="calendar-day other-month">${day}</div>`;
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isConfirmed = confirmedDates.includes(dateStr);
        const isSelected = selectedDate === dateStr;
        const isPast = new Date(currentYear, currentMonth, day) < new Date(new Date().setHours(0, 0, 0, 0));
        
        let dayClass = 'calendar-day';
        // ONLY confirmed dates are disabled (not pending)
        if (isConfirmed || isPast) dayClass += ' disabled';
        if (isSelected && !isConfirmed && !isPast) dayClass += ' selected';
        
        // Add tooltip for disabled dates
        const title = isConfirmed ? 'هذا التاريخ محجوز (تم تأكيده)' : (isPast ? 'لا يمكن حجز تاريخ مضى' : '');
        
        html += `
            <div class="${dayClass}" data-date="${dateStr}" data-disabled="${isConfirmed || isPast}" onclick="selectDate('${dateStr}', ${isConfirmed || isPast})" title="${title}">
                ${day}
            </div>
        `;
    }
    
    // Next month days
    const totalDaysShown = startDayOfWeek + daysInMonth;
    const remainingDays = 42 - totalDaysShown;
    for (let day = 1; day <= remainingDays; day++) {
        html += `<div class="calendar-day other-month">${day}</div>`;
    }
    
    html += `</div>`;
    calendarContainer.innerHTML = html;
}

// Previous Month
function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

// Next Month
function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

// Select Date
function selectDate(dateStr, isDisabled) {
    const errorDiv = document.getElementById('date-error');
    const selectedDateInput = document.getElementById('selected-date');
    
    if (isDisabled) {
        errorDiv.textContent = '❌ هذا اليوم محجوز بالفعل (تم تأكيده)، يرجى اختيار تاريخ آخر';
        return;
    }
    
    errorDiv.textContent = '';
    selectedDate = dateStr;
    selectedDateInput.value = dateStr;
    renderCalendar();
}

// Submit Booking Form
async function submitBooking(event) {
    event.preventDefault();
    
    const fullname = document.getElementById('fullname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const location = document.getElementById('location').value;
    const eventType = document.getElementById('event-type').value;
    const eventDate = document.getElementById('selected-date').value;
    const services = Array.from(document.querySelectorAll('input[name="services"]:checked')).map(cb => cb.value);
    const messageDiv = document.getElementById('form-message');
    
    // Validation
    if (!fullname) {
        showMessage('الرجاء إدخال الاسم الكامل', 'error');
        return;
    }
    
    if (!phone) {
        showMessage('الرجاء إدخال رقم الهاتف', 'error');
        return;
    }
    
    if (!location) {
        showMessage('الرجاء اختيار مكان المناسبة', 'error');
        return;
    }
    
    if (!eventType) {
        showMessage('الرجاء اختيار نوع المناسبة', 'error');
        return;
    }
    
    if (!eventDate) {
        showMessage('الرجاء اختيار تاريخ المناسبة', 'error');
        return;
    }
    
    // Check if date is already confirmed (booked)
    if (confirmedDates.includes(eventDate)) {
        showMessage('❌ هذا اليوم محجوز بالفعل (تم تأكيده)، يرجى اختيار تاريخ آخر', 'error');
        document.getElementById('date-error').textContent = 'هذا اليوم محجوز بالفعل (تم تأكيده)، يرجى اختيار تاريخ آخر';
        return;
    }
    
    // Prepare data
    const bookingData = {
        fullname: fullname,
        phone: phone,
        location: location,
        event_type: eventType,
        event_date: eventDate,
        services: services.join(', ')
    };
    
    // Show loading state
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showMessage('✅ تم إرسال طلب الحجز بنجاح! سيتم التواصل معك لتأكيد الحجز خلال 24 ساعة.', 'success');
            document.getElementById('booking-form').reset();
            selectedDate = null;
            document.getElementById('selected-date').value = '';
            // Re-fetch confirmed dates to ensure calendar is up to date
            await fetchConfirmedDates();
            renderCalendar();
        } else {
            if (result.message === 'Date already confirmed') {
                showMessage('❌ هذا اليوم محجوز بالفعل (تم تأكيده)، يرجى اختيار تاريخ آخر', 'error');
                document.getElementById('date-error').textContent = 'هذا اليوم محجوز بالفعل (تم تأكيده)، يرجى اختيار تاريخ آخر';
                await fetchConfirmedDates();
                renderCalendar();
            } else {
                showMessage(result.message || 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى', 'error');
            }
        }
    } catch (error) {
        console.error('Booking error:', error);
        showMessage('❌ حدث خطأ في الاتصال بالخادم، يرجى المحاولة مرة أخرى', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.getElementById('form-message');
    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
        messageDiv.className = 'form-message';
    }, 5000);
}

// Phone number formatting
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 12) value = value.slice(0, 12);
    input.value = value;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initCalendar();
    
    const form = document.getElementById('booking-form');
    if (form) {
        form.addEventListener('submit', submitBooking);
    }
    
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', () => formatPhoneNumber(phoneInput));
    }
});