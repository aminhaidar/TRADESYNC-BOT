from werkzeug.security import generate_password_hash, check_password_hash
from utils.db import db
from flask_login import UserMixin

class User(UserMixin):
    def __init__(self, username, email, password_hash=None, id=None):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        if self.password_hash is None:
            return False
        return check_password_hash(self.password_hash, password)
    
    def save(self):
        if self.id is None:
            cursor = db.execute_query(
                """
                INSERT INTO users (username, email, password_hash)
                VALUES (?, ?, ?)
                """,
                (self.username, self.email, self.password_hash)
            )
            self.id = cursor.lastrowid
        else:
            db.execute_query(
                """
                UPDATE users
                SET username = ?, email = ?, password_hash = ?
                WHERE id = ?
                """,
                (self.username, self.email, self.password_hash, self.id)
            )
        return self
    
    @classmethod
    def get_by_id(cls, user_id):
        cursor = db.execute_query(
            """
            SELECT * FROM users
            WHERE id = ?
            """,
            (user_id,)
        )
        
        row = cursor.fetchone()
        if row:
            return cls(
                username=row['username'],
                email=row['email'],
                password_hash=row['password_hash'],
                id=row['id']
            )
        return None
    
    @classmethod
    def get_by_username(cls, username):
        cursor = db.execute_query(
            """
            SELECT * FROM users
            WHERE username = ?
            """,
            (username,)
        )
        
        row = cursor.fetchone()
        if row:
            return cls(
                username=row['username'],
                email=row['email'],
                password_hash=row['password_hash'],
                id=row['id']
            )
        return None
    
    @classmethod
    def get_by_email(cls, email):
        cursor = db.execute_query(
            """
            SELECT * FROM users
            WHERE email = ?
            """,
            (email,)
        )
        
        row = cursor.fetchone()
        if row:
            return cls(
                username=row['username'],
                email=row['email'],
                password_hash=row['password_hash'],
                id=row['id']
            )
        return None