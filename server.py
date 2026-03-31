from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import sqlite3
import os

app = Flask(__name__)
CORS(app)

# Database setup
DATABASE = 'bookings.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Create bookings table with location and status
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullname TEXT NOT NULL,
            phone TEXT NOT NULL,
            location TEXT NOT NULL,
            event_type TEXT NOT NULL,
            event_date TEXT NOT NULL,
            services TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# ============================================
# API Endpoints
# ============================================

@app.route('/api/confirmed-dates', methods=['GET'])
def get_confirmed_dates():
    """Get only confirmed booking dates"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT event_date FROM bookings WHERE status = 'confirmed'")
    confirmed = [row['event_date'] for row in cursor.fetchall()]
    conn.close()
    return jsonify({'confirmed_dates': confirmed})

@app.route('/api/book', methods=['POST'])
def create_booking():
    """Create a new booking (pending status)"""
    data = request.json
    
    fullname = data.get('fullname')
    phone = data.get('phone')
    location = data.get('location')
    event_type = data.get('event_type')
    event_date = data.get('event_date')
    services = data.get('services', '')
    
    # Validation
    if not all([fullname, phone, location, event_type, event_date]):
        return jsonify({'success': False, 'message': 'جميع الحقول مطلوبة'}), 400
    
    # Check if date is already confirmed (booked)
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM bookings WHERE event_date = ? AND status = 'confirmed'", (event_date,))
    confirmed_booking = cursor.fetchone()
    
    if confirmed_booking:
        conn.close()
        return jsonify({'success': False, 'message': 'Date already confirmed'}), 409
    
    # Create booking with pending status
    cursor.execute('''
        INSERT INTO bookings (fullname, phone, location, event_type, event_date, services, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
    ''', (fullname, phone, location, event_type, event_date, services))
    
    conn.commit()
    booking_id = cursor.lastrowid
    conn.close()
    
    return jsonify({'success': True, 'booking_id': booking_id})

@app.route('/api/bookings', methods=['GET'])
def get_all_bookings():
    """Get all bookings for admin"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM bookings ORDER BY event_date DESC")
    bookings = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({'bookings': bookings})

@app.route('/api/booking/<int:booking_id>/confirm', methods=['PUT'])
def confirm_booking(booking_id):
    """Confirm a booking - makes the date officially booked"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get the booking first
    cursor.execute("SELECT event_date FROM bookings WHERE id = ?", (booking_id,))
    booking = cursor.fetchone()
    
    if not booking:
        conn.close()
        return jsonify({'success': False, 'message': 'Booking not found'}), 404
    
    event_date = booking['event_date']
    
    # Check if another confirmed booking exists for this date
    cursor.execute("SELECT id FROM bookings WHERE event_date = ? AND status = 'confirmed' AND id != ?", (event_date, booking_id))
    existing = cursor.fetchone()
    
    if existing:
        conn.close()
        return jsonify({'success': False, 'message': 'هذا التاريخ محجوز بالفعل بواسطة حجز آخر'}), 409
    
    # Update booking status to confirmed
    cursor.execute("UPDATE bookings SET status = 'confirmed' WHERE id = ?", (booking_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/booking/<int:booking_id>', methods=['DELETE'])
def delete_booking(booking_id):
    """Delete a booking"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM bookings WHERE id = ?", (booking_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/booking/<int:booking_id>', methods=['PUT'])
def update_booking(booking_id):
    """Update booking date"""
    data = request.json
    new_date = data.get('event_date')
    
    if not new_date:
        return jsonify({'success': False, 'message': 'Date required'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if new date is already confirmed by another booking
    cursor.execute("SELECT id FROM bookings WHERE event_date = ? AND status = 'confirmed' AND id != ?", (new_date, booking_id))
    existing = cursor.fetchone()
    
    if existing:
        conn.close()
        return jsonify({'success': False, 'message': 'هذا التاريخ محجوز بالفعل'}), 409
    
    cursor.execute("UPDATE bookings SET event_date = ? WHERE id = ?", (new_date, booking_id))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get booking statistics"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Total bookings
    cursor.execute("SELECT COUNT(*) as total FROM bookings")
    total = cursor.fetchone()['total']
    
    # Pending bookings
    cursor.execute("SELECT COUNT(*) as pending FROM bookings WHERE status = 'pending'")
    pending = cursor.fetchone()['pending']
    
    # Confirmed bookings
    cursor.execute("SELECT COUNT(*) as confirmed FROM bookings WHERE status = 'confirmed'")
    confirmed = cursor.fetchone()['confirmed']
    
    conn.close()
    
    return jsonify({'total': total, 'pending': pending, 'confirmed': confirmed})

if __name__ == '__main__':
    app.run(debug=True, port=5000)