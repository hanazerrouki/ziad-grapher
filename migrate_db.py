import sqlite3

DATABASE = 'bookings.db'

def migrate_database():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Check if location column exists
    cursor.execute("PRAGMA table_info(bookings)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'location' not in columns:
        print("Adding location column...")
        cursor.execute("ALTER TABLE bookings ADD COLUMN location TEXT")
        
        # Set default location for existing records
        cursor.execute("UPDATE bookings SET location = 'البويرة' WHERE location IS NULL")
        print("✓ Added location column with default value 'البويرة'")
    
    # Check if status column exists with correct default
    if 'status' in columns:
        # Update any null status to 'pending' for old records
        cursor.execute("UPDATE bookings SET status = 'pending' WHERE status IS NULL")
        # For old confirmed bookings, set status to 'confirmed'
        cursor.execute("UPDATE bookings SET status = 'confirmed' WHERE status IS NULL AND event_date < date('now')")
        
        print("✓ Updated status values")
    
    # Verify the table structure
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='bookings'")
    schema = cursor.fetchone()[0]
    print("\nCurrent table schema:")
    print(schema)
    
    # Show current data
    cursor.execute("SELECT COUNT(*) as total FROM bookings")
    total = cursor.fetchone()[0]
    print(f"\nTotal bookings in database: {total}")
    
    cursor.execute("SELECT status, COUNT(*) FROM bookings GROUP BY status")
    stats = cursor.fetchall()
    print("Status breakdown:")
    for status, count in stats:
        print(f"  - {status}: {count}")
    
    conn.commit()
    conn.close()
    print("\n✓ Migration completed successfully!")

if __name__ == '__main__':
    migrate_database()