// Simple Projection Lab Export - Content Script
console.log('🔧 Projection Lab Export: Content script loaded');

// Inject inpage.js into the actual page so it can access window.projectionlabPluginAPI
(function inject() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inpage.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
})();

// Listen for popup "export" requests and forward them into the page
chrome.runtime.onMessage.addListener((msg) => {
  console.log('📨 Content script received message:', msg);
  if (msg.type === 'PL_EXPORT') {
    console.log('�� Forwarding export request to page...');
    window.postMessage({ type: 'PL_EXPORT_REQUEST', key: msg.key }, '*');
  }
});

// Receive the export data from inpage.js and send it to popup
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  const { type, ok, data, error } = event.data || {};
  console.log('📨 Content script received window message:', { type, ok, error });
  
  if (type === 'PL_EXPORT_RESPONSE') {
    if (!ok) {
      console.error('❌ Export error:', error);
      chrome.runtime.sendMessage({ 
        type: 'PL_EXPORT_ERROR', 
        error: 'ProjectionLab export error: ' + (error || 'Unknown') 
      });
      return;
    }
    
    console.log('✅ Export successful, data size:', JSON.stringify(data).length);
    // Send the data directly to popup instead of downloading
    chrome.runtime.sendMessage({ 
      type: 'PL_EXPORT_SUCCESS', 
      data: data 
    });
  }
});
