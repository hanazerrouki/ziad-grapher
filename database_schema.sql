-- ============================================
-- DATABASE SCHEMA for Bella Grapher Booking System
-- ============================================

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullname TEXT NOT NULL,
    phone TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_date TEXT NOT NULL,
    services TEXT,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blocked Dates Table (for manual blocking)
CREATE TABLE IF NOT EXISTS blocked_dates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data (Optional)
INSERT INTO bookings (fullname, phone, event_type, event_date, services) VALUES 
('سارة أحمد', '0555123456', 'wedding', '2025-05-15', 'makeup, dj'),
('نور علي', '0555789012', 'engagement', '2025-06-20', 'decoration'),
('ليلى محمد', '0555345678', 'graduation', '2025-07-10', '');

-- Sample Blocked Dates
INSERT INTO blocked_dates (date, reason) VALUES 
('2025-05-01', 'إجازة رسمية'),
('2025-05-02', 'إجازة رسمية');

-- Query Examples

-- Get all confirmed bookings
SELECT * FROM bookings WHERE status = 'confirmed' ORDER BY event_date;

-- Get all booked dates (confirmed bookings + blocked dates)
SELECT event_date FROM bookings WHERE status = 'confirmed'
UNION
SELECT date FROM blocked_dates;

-- Check if a specific date is available
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM bookings WHERE event_date = '2025-05-15') THEN 0
        WHEN EXISTS (SELECT 1 FROM blocked_dates WHERE date = '2025-05-15') THEN 0
        ELSE 1
    END as is_available;

-- Get upcoming bookings
SELECT * FROM bookings WHERE event_date >= date('now') ORDER BY event_date;

-- Get past bookings
SELECT * FROM bookings WHERE event_date < date('now') ORDER BY event_date DESC;



-- ============================================
-- DATABASE MIGRATION SCRIPT
-- Add location column to bookings table
-- ============================================

-- First, check if location column exists
-- This is for SQLite - we'll use Python to handle this safely

-- Add location column (nullable for existing records)
ALTER TABLE bookings ADD COLUMN location TEXT;

-- Update existing records with a default location
UPDATE bookings SET location = 'البويرة' WHERE location IS NULL;

-- Make location column NOT NULL for future records
-- Note: SQLite doesn't support ALTER COLUMN NOT NULL directly
-- We'll handle this in the application code instead

-- Optional: Update status for existing bookings to 'confirmed' (since they were booked before)
UPDATE bookings SET status = 'confirmed' WHERE status IS NULL;

-- View the updated schema
SELECT sql FROM sqlite_master WHERE type='table' AND name='bookings';