from utils.db import db
from datetime import datetime

class Trade:
    def __init__(self, symbol, price, quantity, trade_type, source=None, timestamp=None, id=None):
        self.id = id
        self.symbol = symbol
        self.price = price
        self.quantity = quantity
        self.trade_type = trade_type  # 'BUY' or 'SELL'
        self.source = source
        self.timestamp = timestamp or datetime.now()
    
    @classmethod
    def from_discord_message(cls, message):
        """Parse a Discord message and create a Trade object"""
        # Implement parsing logic here
        # This is a simplified example - you would have more complex parsing
        if "BOUGHT" in message:
            trade_type = "BUY"
        elif "SOLD" in message:
            trade_type = "SELL"
        else:
            return None
        
        # Very basic parsing - you would need more sophisticated parsing
        parts = message.split()
        symbol = parts[1] if len(parts) > 1 else "UNKNOWN"
        
        # Extract price and quantity (simplified)
        price = 0.0
        quantity = 1
        for part in parts:
            if part.startswith("$"):
                try:
                    price = float(part[1:])
                except ValueError:
                    pass
            elif part.isdigit():
                try:
                    quantity = int(part)
                except ValueError:
                    pass
        
        return cls(symbol, price, quantity, trade_type, "Discord")
    
    def save(self):
        """Save the trade to the database"""
        if self.id is None:
            cursor = db.execute_query(
                """
                INSERT INTO trades (symbol, price, quantity, trade_type, source, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (self.symbol, self.price, self.quantity, self.trade_type, self.source, self.timestamp)
            )
            self.id = cursor.lastrowid
        else:
            db.execute_query(
                """
                UPDATE trades
                SET symbol = ?, price = ?, quantity = ?, trade_type = ?, source = ?, timestamp = ?
                WHERE id = ?
                """,
                (self.symbol, self.price, self.quantity, self.trade_type, self.source, self.timestamp, self.id)
            )
        return self
    
    @classmethod
    def get_all(cls, limit=100):
        """Get all trades from the database"""
        cursor = db.execute_query(
            """
            SELECT * FROM trades
            ORDER BY timestamp DESC
            LIMIT ?
            """,
            (limit,)
        )
        
        trades = []
        for row in cursor:
            trade = cls(
                symbol=row['symbol'],
                price=row['price'],
                quantity=row['quantity'],
                trade_type=row['trade_type'],
                source=row['source'],
                timestamp=row['timestamp'],
                id=row['id']
            )
            trades.append(trade)
            
        return trades
    
    @classmethod
    def get_by_id(cls, id):
        """Get a trade by ID"""
        cursor = db.execute_query(
            """
            SELECT * FROM trades
            WHERE id = ?
            """,
            (id,)
        )
        
        row = cursor.fetchone()
        if row:
            return cls(
                symbol=row['symbol'],
                price=row['price'],
                quantity=row['quantity'],
                trade_type=row['trade_type'],
                source=row['source'],
                timestamp=row['timestamp'],
                id=row['id']
            )
        return None
