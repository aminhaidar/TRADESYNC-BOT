from utils.db import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

class User(UserMixin):
    def __init__(self, username=None, email=None, google_id=None, id=None):
        self.id = id
        self.username = username
        self.email = email
        self.google_id = google_id
        self.password_hash = None
    
    def set_password(self, password):
        """Set the user's password hash"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if the provided password matches the stored hash"""
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)
    
    def save(self):
        """Save the user to the database"""
        if self.id:
            # Update existing user
            data = {
                'username': self.username,
                'email': self.email
            }
            
            if self.password_hash:
                data['password_hash'] = self.password_hash
            
            if self.google_id:
                data['google_id'] = self.google_id
            
            condition = {'id': self.id}
            db.update_row('users', data, condition)
            return self.id
        else:
            # Insert new user
            data = {
                'username': self.username,
                'email': self.email
            }
            
            if self.password_hash:
                data['password_hash'] = self.password_hash
            
            if self.google_id:
                data['google_id'] = self.google_id
            
            self.id = db.insert_row('users', data)
            return self.id
    
    @staticmethod
    def from_row(row):
        """Create a User object from a database row"""
        user = User(
            id=row['id'],
            username=row['username'],
            email=row['email'],
            google_id=row['google_id']
        )
        user.password_hash = row['password_hash']
        return user
    
    @staticmethod
    def get_by_id(user_id):
        """Get a user by ID"""
        query = "SELECT * FROM users WHERE id = ?"
        
        # Use fetch_one=True to get a single result
        row = db.execute_query(query, (user_id,), fetch_one=True)
        
        if row:
            return User.from_row(row)
        return None
    
    @staticmethod
    def get_by_username(username):
        """Get a user by username"""
        query = "SELECT * FROM users WHERE username = ?"
        
        # Use fetch_one=True to get a single result
        row = db.execute_query(query, (username,), fetch_one=True)
        
        if row:
            return User.from_row(row)
        return None
    
    @staticmethod
    def get_by_email(email):
        """Get a user by email"""
        query = "SELECT * FROM users WHERE email = ?"
        
        # Use fetch_one=True to get a single result
        row = db.execute_query(query, (email,), fetch_one=True)
        
        if row:
            return User.from_row(row)
        return None
    
    @staticmethod
    def get_by_google_id(google_id):
        """Get a user by Google ID"""
        query = "SELECT * FROM users WHERE google_id = ?"
        
        # Use fetch_one=True to get a single result
        row = db.execute_query(query, (google_id,), fetch_one=True)
        
        if row:
            return User.from_row(row)
        return None
    
    @staticmethod
    def get_all(limit=None):
        """Get all users with optional limit"""
        query = "SELECT * FROM users"
        
        if limit:
            query += f" LIMIT {limit}"
        
        # Don't use fetch_one for multiple results
        rows = db.execute_query(query)
        
        return [User.from_row(row) for row in rows]