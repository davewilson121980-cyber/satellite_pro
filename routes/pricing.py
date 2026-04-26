"""
Pricing routes - Subscription plans and payment processing.
"""

from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime, timedelta
from models import User, db
from config import Config

pricing_bp = Blueprint('pricing', __name__, template_folder='../templates')


@pricing_bp.route('/')
def index():
    """Pricing page with subscription plans."""
    plans = Config.SUBSCRIPTION_PLANS
    return render_template('pricing.html', plans=plans)


@pricing_bp.route('/subscribe/<plan_name>', methods=['POST'])
@login_required
def subscribe(plan_name):
    """Handle subscription upgrade (simulated payment)."""
    plan_name = plan_name.lower()
    
    # Validate plan name
    if plan_name not in Config.SUBSCRIPTION_PLANS:
        flash('Invalid subscription plan.', 'error')
        return redirect(url_for('pricing.index'))
    
    plan = Config.SUBSCRIPTION_PLANS[plan_name]
    
    # Simulate payment processing
    # In production, integrate with Stripe or other payment provider
    try:
        # Update user subscription
        current_user.subscription_plan = plan_name
        current_user.subscription_start = datetime.utcnow()
        
        # Set subscription end date (1 month from now for paid plans)
        if plan['price'] > 0:
            current_user.subscription_end = datetime.utcnow() + timedelta(days=30)
        else:
            current_user.subscription_end = None  # Free plan doesn't expire
        
        # Reset query limits
        current_user.queries_today = 0
        
        db.session.commit()
        
        flash(f'Successfully upgraded to {plan["name"]} plan!', 'success')
        return redirect(url_for('dashboard.index'))
    
    except Exception as e:
        db.session.rollback()
        flash('An error occurred while processing your subscription. Please try again.', 'error')
        return redirect(url_for('pricing.index'))


@pricing_bp.route('/simulate-payment', methods=['POST'])
@login_required
def simulate_payment():
    """Simulate payment processing for demonstration."""
    data = request.get_json()
    plan_name = data.get('plan', 'free')
    
    # Simulate payment delay
    import time
    time.sleep(1)  # 1 second delay to simulate API call
    
    # Always succeed in simulation
    return jsonify({
        'success': True,
        'message': f'Payment simulated for {plan_name} plan',
        'transaction_id': f'sim_{datetime.utcnow().timestamp()}'
    })
