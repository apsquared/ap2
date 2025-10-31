// Website-side script to access extension API key
(function() {
  console.log('🔧 APSquared website script injected');
  
  // Function to request API key from extension
  window.getProjectionLabApiKey = function() {
    return new Promise((resolve, reject) => {
      // Send message to content script
      window.postMessage({ 
        type: 'GET_PROJECTION_LAB_API_KEY' 
      }, '*');
      
      // Listen for response
      const handleResponse = (event) => {
        if (event.source !== window) return;
        const { type, apiKey, error } = event.data || {};
        
        if (type === 'PROJECTION_LAB_API_KEY_RESPONSE') {
          window.removeEventListener('message', handleResponse);
          if (error) {
            reject(new Error(error));
          } else {
            resolve(apiKey);
          }
        }
      };
      
      window.addEventListener('message', handleResponse);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        reject(new Error('Timeout waiting for API key'));
      }, 5000);
    });
  };
  
  // Auto-inject API key into window object when available
  window.postMessage({ 
    type: 'GET_PROJECTION_LAB_API_KEY' 
  }, '*');
  
  const handleAutoResponse = (event) => {
    if (event.source !== window) return;
    const { type, apiKey, error } = event.data || {};
    
    if (type === 'PROJECTION_LAB_API_KEY_RESPONSE') {
      window.removeEventListener('message', handleAutoResponse);
      if (apiKey) {
        window.projectionLabApiKey = apiKey;
        console.log('🔑 Projection Lab API key automatically injected into window.projectionLabApiKey');
        
        // Dispatch custom event to notify website
        window.dispatchEvent(new CustomEvent('projectionLabApiKeyReady', { 
          detail: { apiKey } 
        }));
      } else {
        console.log('⚠️ No Projection Lab API key found in extension');
      }
    }
  };
  
  window.addEventListener('message', handleAutoResponse);
})();
