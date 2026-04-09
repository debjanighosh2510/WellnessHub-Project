import { useState } from 'react';

export default function Landing() {
  const [showSOS, setShowSOS] = useState(false);
  const [sosForm, setSosForm] = useState({
    name: '',
    phone: '',
    location: '',
    emergency: '',
    description: ''
  });
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSuccess, setSosSuccess] = useState(false);

  const handleSOSSubmit = async (e) => {
    e.preventDefault();
    setSosLoading(true);
    
    try {
      const response = await fetch('/api/sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sosForm),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit emergency report');
      }
      
      setSosSuccess(true);
      setTimeout(() => {
        setShowSOS(false);
        setSosSuccess(false);
        setSosForm({ name: '', phone: '', location: '', emergency: '', description: '' });
      }, 3000);
    } catch (error) {
      console.error('SOS submission failed:', error);
      alert('Failed to submit emergency report. Please call 108 immediately for assistance.');
    } finally {
      setSosLoading(false);
    }
  };

  return (
    <section>
      <div className="hero">
        <h1>WellnessHub</h1>
        <p className="hero-subtitle">
          Collaborative Digital Ecosystem for Inclusive Health & Well‑Being
        </p>
        <p className="hero-description">
          Connect communities, health workers, NGOs, and providers to advance SDG‑3 with real‑time data,
          service mapping, telemedicine, preventive education, and community feedback.
        </p>
        <div className="actions">
          <a className="btn primary" href="#/register">
            Get Started
          </a>
          <button 
            className="btn sos-btn" 
            onClick={() => setShowSOS(true)}
          >
            🚨 SOS Emergency Report
          </button>
          <a className="btn secondary" href="#/education">
            Explore Education
          </a>
        </div>
      </div>

      {/* SOS Emergency Modal */}
      {showSOS && (
        <div className="modal-overlay" onClick={() => !sosLoading && setShowSOS(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🚨 Emergency Case Report</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowSOS(false)}
                disabled={sosLoading}
              >
                ×
              </button>
            </div>
            
            {sosSuccess ? (
              <div className="sos-success">
                <div className="success-icon">✅</div>
                <h3>Emergency Report Submitted!</h3>
                <p>Your emergency case has been reported. Healthcare workers will be notified immediately.</p>
                <p className="emergency-contact">For immediate assistance, call: <strong>108</strong></p>
              </div>
            ) : (
              <form className="sos-form" onSubmit={handleSOSSubmit}>
                <p className="sos-description">
                  Report an emergency health case. This information will be immediately shared with healthcare providers.
                </p>
                
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    value={sosForm.name}
                    onChange={(e) => setSosForm({...sosForm, name: e.target.value})}
                    placeholder="Enter your name"
                    required
                    disabled={sosLoading}
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    value={sosForm.phone}
                    onChange={(e) => setSosForm({...sosForm, phone: e.target.value})}
                    placeholder="Enter phone number"
                    required
                    disabled={sosLoading}
                  />
                </div>
                
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    value={sosForm.location}
                    onChange={(e) => setSosForm({...sosForm, location: e.target.value})}
                    placeholder="Enter location/address"
                    required
                    disabled={sosLoading}
                  />
                </div>
                
                <div className="form-group">
                  <label>Type of Emergency *</label>
                  <select
                    value={sosForm.emergency}
                    onChange={(e) => setSosForm({...sosForm, emergency: e.target.value})}
                    required
                    disabled={sosLoading}
                  >
                    <option value="">Select emergency type</option>
                    <option value="medical">Medical Emergency</option>
                    <option value="accident">Accident</option>
                    <option value="pregnancy">Pregnancy Complication</option>
                    <option value="child">Child Health Emergency</option>
                    <option value="elderly">Elderly Health Issue</option>
                    <option value="mental">Mental Health Crisis</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={sosForm.description}
                    onChange={(e) => setSosForm({...sosForm, description: e.target.value})}
                    placeholder="Describe the emergency situation"
                    rows="3"
                    disabled={sosLoading}
                  />
                </div>
                
                <div className="sos-actions">
                  <button 
                    type="button" 
                    className="btn secondary"
                    onClick={() => setShowSOS(false)}
                    disabled={sosLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn sos-submit"
                    disabled={sosLoading}
                  >
                    {sosLoading ? (
                      <>
                        <div className="spinner"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Emergency Report'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="features">
        <h2>Key Features</h2>
        <div className="grid">
          <div className="card feature-card">
            <div className="feature-icon">🚨</div>
            <h3>Emergency SOS</h3>
            <p>Report emergency health cases immediately without registration. Get instant help when you need it most.</p>
          </div>
          
          <div className="card feature-card">
            <div className="feature-icon">🏥</div>
            <h3>Health Camp Locator</h3>
            <p>Find the nearest blood donation and health camps in your area with real-time location services.</p>
          </div>
          
          <div className="card feature-card">
            <div className="feature-icon">🎓</div>
            <h3>Health Education</h3>
            <p>Access preventive healthcare education materials and resources for better community health awareness.</p>
          </div>
          
          <div className="card feature-card">
            <div className="feature-icon">💻</div>
            <h3>Telemedicine</h3>
            <p>Connect with healthcare providers remotely for consultations and medical advice.</p>
          </div>
          
          <div className="card feature-card">
            <div className="feature-icon">🧠</div>
            <h3>Mental Health AI</h3>
            <p>Chat with our AI assistant for mental health support and guidance anytime, anywhere.</p>
          </div>
          
          <div className="card feature-card">
            <div className="feature-icon">💬</div>
            <h3>Community Feedback</h3>
            <p>Share feedback and suggestions to improve healthcare services in your community.</p>
          </div>
        </div>
      </div>

      <div className="stats">
        <h2>Impact Numbers</h2>
        <div className="grid">
          <div className="card stat">
            <div className="stat-value">500+</div>
            <div className="stat-label">Health Camps</div>
          </div>
          <div className="card stat">
            <div className="stat-value">10K+</div>
            <div className="stat-label">Users Served</div>
          </div>
          <div className="card stat">
            <div className="stat-value">50+</div>
            <div className="stat-label">Communities</div>
          </div>
          <div className="card stat">
            <div className="stat-value">95%</div>
            <div className="stat-label">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
}


