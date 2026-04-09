import { useState, useRef, useEffect } from 'react';

export default function MentalHealth() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your mental health AI assistant. I'm here to listen, provide support, and help you with any mental health concerns. How are you feeling today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const aiResponses = {
    greetings: [
      "I'm here to listen. How can I help you today?",
      "Thank you for reaching out. I'm here to support you.",
      "I understand this might be difficult. You're not alone."
    ],
    anxiety: [
      "Anxiety can be overwhelming. Try taking deep breaths - inhale for 4 counts, hold for 4, exhale for 4.",
      "Remember, anxiety is temporary. Focus on what you can control right now.",
      "It's okay to feel anxious. Consider talking to a mental health professional for support."
    ],
    depression: [
      "Depression is a serious condition that affects many people. You're not alone in this.",
      "Small steps matter. Even getting out of bed is an achievement.",
      "Please consider reaching out to a mental health professional. You deserve support."
    ],
    stress: [
      "Stress can be managed. Try breaking tasks into smaller, manageable parts.",
      "Remember to take breaks and practice self-care.",
      "Physical activity, even a short walk, can help reduce stress."
    ],
    sleep: [
      "Good sleep is crucial for mental health. Try establishing a regular bedtime routine.",
      "Avoid screens before bed and create a calm environment.",
      "If sleep problems persist, consider consulting a healthcare provider."
    ],
    default: [
      "I hear you. That sounds challenging.",
      "Thank you for sharing that with me.",
      "I'm here to listen. Would you like to talk more about this?",
      "It's important to acknowledge your feelings. You're doing great by reaching out."
    ]
  };

  const getAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return aiResponses.greetings[Math.floor(Math.random() * aiResponses.greetings.length)];
    } else if (lowerMessage.includes('anxiety') || lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
      return aiResponses.anxiety[Math.floor(Math.random() * aiResponses.anxiety.length)];
    } else if (lowerMessage.includes('depression') || lowerMessage.includes('sad') || lowerMessage.includes('hopeless')) {
      return aiResponses.depression[Math.floor(Math.random() * aiResponses.depression.length)];
    } else if (lowerMessage.includes('stress') || lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed')) {
      return aiResponses.stress[Math.floor(Math.random() * aiResponses.stress.length)];
    } else if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes('tired')) {
      return aiResponses.sleep[Math.floor(Math.random() * aiResponses.sleep.length)];
    } else {
      return aiResponses.default[Math.floor(Math.random() * aiResponses.default.length)];
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: getAIResponse(inputMessage),
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <section>
      <div className="mental-health-container">
        <div className="chat-header">
          <h2>🧠 Mental Health AI Assistant</h2>
          <p>Your confidential space to talk about mental health. I'm here to listen and support you.</p>
        </div>

        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-content">
                  <p>{message.text}</p>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message ai-message">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message here..."
              disabled={isTyping}
            />
            <button type="submit" disabled={!inputMessage.trim() || isTyping}>
              Send
            </button>
          </form>
        </div>

        <div className="mental-health-resources">
          <h3>Mental Health Resources</h3>
          <div className="resources-grid">
            <div className="resource-card">
              <h4>🆘 Crisis Helpline</h4>
              <p>National Mental Health Helpline: <strong>1800-599-0019</strong></p>
            </div>
            <div className="resource-card">
              <h4>📞 Emergency</h4>
              <p>For immediate crisis: <strong>108</strong></p>
            </div>
            <div className="resource-card">
              <h4>💡 Self-Care Tips</h4>
              <p>Practice deep breathing, exercise, and maintain a routine</p>
            </div>
            <div className="resource-card">
              <h4>👥 Professional Help</h4>
              <p>Consider reaching out to a mental health professional</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
