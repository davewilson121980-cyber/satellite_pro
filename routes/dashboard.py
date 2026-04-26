"""
Dashboard routes - Main application dashboard and analysis views.
"""

from flask import Blueprint, render_template, redirect, url_for, flash
from flask_login import login_required, current_user
from models import User

dashboard_bp = Blueprint('dashboard', __name__, template_folder='../templates')


@dashboard_bp.route('/')
@login_required
def index():
    """Main dashboard view."""
    # Reset daily query count if it's a new day
    current_user.reset_daily_queries()
    
    return render_template('dashboard.html', 
                         subscription_plan=current_user.subscription_plan)


@dashboard_bp.route('/analysis')
@login_required
def analysis():
    """Detailed analysis view (optional future feature)."""
    return render_template('analysis.html',
                         subscription_plan=current_user.subscription_plan)
