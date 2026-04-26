"""
Flask Satellite Data Analysis Web Application

Main application entry point that initializes Flask app, database,
and registers all blueprints for authentication, dashboard, pricing, and API.
"""

import os
from flask import Flask, render_template, redirect, url_for, flash, request, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

# Import configuration
from config import config


# Initialize extensions (will be bound to app in create_app)
db = SQLAlchemy()
login_manager = LoginManager()
migrate = Migrate()


def create_app(config_name=None):
    """
    Application factory for creating Flask app instance.
    
    Args:
        config_name: Configuration environment name ('development', 'production', etc.)
        
    Returns:
        Configured Flask application instance
    """
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'default')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    
    # Configure login manager
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'info'
    
    # Import models BEFORE registering blueprints to avoid circular imports
    from models import User, DataLog
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.dashboard import dashboard_bp
    from routes.pricing import pricing_bp
    from routes.api import api_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(dashboard_bp, url_prefix='/dashboard')
    app.register_blueprint(pricing_bp, url_prefix='/pricing')
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Create tables within app context
    with app.app_context():
        db.create_all()
    
    # Setup user loader for Flask-Login
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    # Register error handlers
    register_error_handlers(app)
    
    # Register main routes
    @app.route('/')
    def index():
        """Landing page - redirect to dashboard if logged in, else to login."""
        if current_user.is_authenticated:
            return redirect(url_for('dashboard.index'))
        return redirect(url_for('auth.login'))
    
    @app.route('/health')
    def health_check():
        """Health check endpoint for monitoring."""
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'database': 'connected' if db.engine else 'disconnected'
        })
    
    return app


def register_error_handlers(app):
    """Register error handlers for the application."""
    
    @app.errorhandler(404)
    def not_found_error(error):
        """Handle 404 Not Found errors."""
        if request.is_json:
            return jsonify({'error': 'Not found'}), 404
        return render_template('errors/404.html'), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        """Handle 500 Internal Server errors."""
        db.session.rollback()
        if request.is_json:
            return jsonify({'error': 'Internal server error'}), 500
        return render_template('errors/500.html'), 500
    
    @app.errorhandler(403)
    def forbidden_error(error):
        """Handle 403 Forbidden errors."""
        if request.is_json:
            return jsonify({'error': 'Forbidden'}), 403
        return render_template('errors/403.html'), 403


# Create application instance
app = create_app()


if __name__ == '__main__':
    # Run the development server
    # In production, use a proper WSGI server like Gunicorn or uWSGI
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
