import logging
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

logger = logging.getLogger(__name__)

Base = declarative_base()

class Trade(Base):
    __tablename__ = 'trades'
    id = Column(Integer, primary_key=True)
    symbol = Column(String)
    action = Column(String)
    quantity = Column(Float)
    price = Column(Float)
    status = Column(String)
    timestamp = Column(DateTime)
    confidence = Column(Float)
    source = Column(String)
    user = Column(String)
    url = Column(String)
    option_details = Column(String)
    closed = Column(Boolean)
    closed_timestamp = Column(DateTime)

def setup_database(database_uri):
    try:
        logger.info(f"Getting connection to database: {database_uri}")
        engine = create_engine(database_uri)
        Base.metadata.create_all(engine)
        logger.info("Successfully connected to database at trades.db")
        Session = sessionmaker(bind=engine)
        return Session()
    except Exception as e:
        logger.error(f"Error setting up database: {str(e)}")
        raise

def get_trades():
    try:
        session = setup_database('sqlite:///trades.db')
        trades = session.query(Trade).all()
        trade_list = [
            {
                "id": trade.id,
                "symbol": trade.symbol,
                "action": trade.action,
                "quantity": trade.quantity,
                "price": trade.price,
                "status": trade.status,
                "timestamp": trade.timestamp.strftime('%Y-%m-%d %H:%M:%S') if trade.timestamp else None,
                "confidence": trade.confidence,
                "source": trade.source,
                "user": trade.user,
                "url": trade.url,
                "option_details": trade.option_details,
                "closed": trade.closed,
                "closed_timestamp": trade.closed_timestamp.strftime('%Y-%m-%d %H:%M:%S') if trade.closed_timestamp else None
            }
            for trade in trades
        ]
        session.close()
        return trade_list
    except Exception as e:
        logger.error(f"Error fetching trades: {str(e)}")
        return []
