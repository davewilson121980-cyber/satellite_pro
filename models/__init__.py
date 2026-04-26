from extensions import db
from flask_login import UserMixin
from datetime import datetime


class User(UserMixin, db.Model):
    """User model for authentication and subscription management."""
    
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Subscription fields
    subscription_plan = db.Column(db.String(20), default='free')
    subscription_start = db.Column(db.DateTime)
    subscription_end = db.Column(db.DateTime)
    
    # Usage tracking
    queries_today = db.Column(db.Integer, default=0)
    last_query_date = db.Column(db.Date, default=datetime.utcnow().date)
    
    # Relationships
    data_logs = db.relationship('DataLog', backref='user', lazy='dynamic')
    
    def reset_daily_queries(self):
        """Reset daily query counter if it's a new day."""
        today = datetime.utcnow().date()
        if self.last_query_date != today:
            self.queries_today = 0
            self.last_query_date = today
    
    def can_make_query(self, limit):
        """Check if user can make another API query based on their plan."""
        self.reset_daily_queries()
        if limit == -1:  # unlimited
            return True
        return self.queries_today < limit
    
    def increment_query_count(self):
        """Increment the daily query counter."""
        self.reset_daily_queries()
        self.queries_today += 1
    
    def __repr__(self):
        return f'<User {self.username}>'


class DataLog(db.Model):
    """Log model for tracking data requests and API calls."""
    
    __tablename__ = 'data_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Request details
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    parameter_type = db.Column(db.String(50))  # weather, ndvi, solar, wind, etc.
    date_requested = db.Column(db.Date)
    date_range_start = db.Column(db.Date)
    date_range_end = db.Column(db.Date)
    
    # Response metadata
    api_source = db.Column(db.String(50))  # NASA_POWER, SENTINEL_HUB, etc.
    status_code = db.Column(db.Integer)
    response_size = db.Column(db.Integer)  # in bytes
    
    # Cached data reference (optional, for large responses)
    cache_key = db.Column(db.String(100), index=True)
    
    def __repr__(self):
        return f'<DataLog {self.id} - User {self.user_id}>'
