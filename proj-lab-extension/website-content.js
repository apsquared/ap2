// Content script for apsquared.co - makes extension API key available to website
console.log('🌐 APSquared website content script loaded');

// Inject website-inpage.js into the actual page so it can access window functions
(function inject() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('website-inpage.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
})();

// Listen for API key requests from the website
window.addEventListener('message', async (event) => {
  if (event.source !== window) return;
  const { type } = event.data || {};
  
  if (type === 'GET_PROJECTION_LAB_API_KEY') {
    console.log('📨 Website requesting Projection Lab API key');
    
    try {
      // Get API key from extension storage
      const result = await chrome.storage.sync.get(['projectionLabApiKey']);
      const apiKey = result.projectionLabApiKey;
      
      // Send response back to website
      window.postMessage({ 
        type: 'PROJECTION_LAB_API_KEY_RESPONSE',
        apiKey: apiKey || null,
        error: apiKey ? null : 'No API key found in extension'
      }, '*');
      
      console.log('✅ API key response sent:', !!apiKey);
    } catch (error) {
      console.error('❌ Error getting API key:', error);
      window.postMessage({ 
        type: 'PROJECTION_LAB_API_KEY_RESPONSE',
        apiKey: null,
        error: error.message
      }, '*');
    }
  }
});
