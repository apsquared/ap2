// Simple Projection Lab Export - Inpage Script
console.log('🔧 Projection Lab Export: Inpage script loaded');

// Listen for export requests from content script
window.addEventListener('message', async (event) => {
  if (event.source !== window) return;
  const { type, key } = event.data || {};
  
  if (type === 'PL_EXPORT_REQUEST') {
    console.log('📨 Inpage script received export request');
    console.log('🔑 API key provided:', !!key);
    console.log('🔍 API exists:', !!window.projectionlabPluginAPI);
    
    if (!window.projectionlabPluginAPI) {
      console.log('❌ API not available');
      window.postMessage({ 
        type: 'PL_EXPORT_RESPONSE', 
        ok: false, 
        error: 'Projection Lab API not available. Make sure plugin support is enabled.' 
      }, '*');
      return;
    }
    
    try {
      console.log('✅ API found, attempting export...');
      const result = await window.projectionlabPluginAPI.exportData({ key: key });
      console.log('✅ Export successful:', result);
      
      window.postMessage({ 
        type: 'PL_EXPORT_RESPONSE', 
        ok: true, 
        data: result 
      }, '*');
    } catch (error) {
      console.log('❌ Export failed:', error);
      window.postMessage({ 
        type: 'PL_EXPORT_RESPONSE', 
        ok: false, 
        error: error.message 
      }, '*');
    }
  }
});
