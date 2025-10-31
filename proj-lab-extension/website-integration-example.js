// Example: How to use the Projection Lab API key in your website (apsquared.co)
// This file shows different ways to access the API key from your website

// Method 1: Wait for the API key to be automatically injected
document.addEventListener('DOMContentLoaded', function() {
  // Listen for the custom event when API key is ready
  window.addEventListener('projectionLabApiKeyReady', function(event) {
    const apiKey = event.detail.apiKey;
    console.log('🔑 API key received via event:', apiKey);
    
    // Use the API key for your Projection Lab integration
    initializeProjectionLabIntegration(apiKey);
  });
  
  // Check if API key is already available
  if (window.projectionLabApiKey) {
    console.log('🔑 API key already available:', window.projectionLabApiKey);
    initializeProjectionLabIntegration(window.projectionLabApiKey);
  }
});

// Method 2: Manually request the API key
async function getProjectionLabApiKey() {
  try {
    if (typeof window.getProjectionLabApiKey === 'function') {
      const apiKey = await window.getProjectionLabApiKey();
      console.log('🔑 API key retrieved:', apiKey);
      return apiKey;
    } else {
      console.log('⚠️ Extension not installed or not available');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting API key:', error);
    return null;
  }
}

// Method 3: Check if extension is available and get API key
async function checkExtensionAndGetApiKey() {
  // Check if the extension function is available
  if (typeof window.getProjectionLabApiKey !== 'function') {
    console.log('⚠️ Projection Lab Export extension not detected');
    return null;
  }
  
  try {
    const apiKey = await window.getProjectionLabApiKey();
    if (apiKey) {
      console.log('✅ Extension found and API key retrieved');
      return apiKey;
    } else {
      console.log('⚠️ Extension found but no API key configured');
      return null;
    }
  } catch (error) {
    console.error('❌ Error communicating with extension:', error);
    return null;
  }
}

// Example function to use the API key
function initializeProjectionLabIntegration(apiKey) {
  if (!apiKey) {
    console.log('⚠️ No API key available for Projection Lab integration');
    return;
  }
  
  console.log('🚀 Initializing Projection Lab integration with API key');
  
  // Example: Make API calls to Projection Lab
  // fetch('https://api.projectionlab.com/your-endpoint', {
  //   headers: {
  //     'Authorization': `Bearer ${apiKey}`,
  //     'Content-Type': 'application/json'
  //   }
  // })
  // .then(response => response.json())
  // .then(data => {
  //   console.log('Projection Lab data:', data);
  // })
  // .catch(error => {
  //   console.error('Projection Lab API error:', error);
  // });
}

// Method 4: Utility function to handle extension detection and API key retrieval
async function setupProjectionLabIntegration() {
  const apiKey = await checkExtensionAndGetApiKey();
  
  if (apiKey) {
    // Extension is available and API key is configured
    initializeProjectionLabIntegration(apiKey);
    return true;
  } else {
    // Extension not available or API key not configured
    console.log('ℹ️ Projection Lab integration not available');
    
    // You could show a message to the user like:
    // showMessage('Install the Projection Lab Export extension to enable integration');
    
    return false;
  }
}

// Method 5: React/Vue component example (pseudo-code)
/*
// React example:
useEffect(() => {
  const setupIntegration = async () => {
    const apiKey = await getProjectionLabApiKey();
    if (apiKey) {
      setProjectionLabApiKey(apiKey);
      setExtensionAvailable(true);
    }
  };
  
  setupIntegration();
}, []);

// Vue example:
mounted() {
  this.setupProjectionLabIntegration();
}

async setupProjectionLabIntegration() {
  const apiKey = await getProjectionLabApiKey();
  if (apiKey) {
    this.projectionLabApiKey = apiKey;
    this.extensionAvailable = true;
  }
}
*/

// Export functions for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getProjectionLabApiKey,
    checkExtensionAndGetApiKey,
    setupProjectionLabIntegration
  };
}
