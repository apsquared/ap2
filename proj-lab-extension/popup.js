// Simple Projection Lab Export - Popup Script
console.log('🖥️ Popup loaded');

document.addEventListener('DOMContentLoaded', async () => {
  const statusDiv = document.getElementById('status');
  const apiKeyInput = document.getElementById('apiKey');
  const resultDiv = document.getElementById('result');
  
  // Load saved API key
  try {
    const saved = await chrome.storage.sync.get(['projectionLabApiKey']);
    if (saved.projectionLabApiKey) {
      apiKeyInput.value = saved.projectionLabApiKey;
    }
  } catch (error) {
    console.error('Error loading API key:', error);
  }
  
  // Set initial status
  statusDiv.textContent = 'Ready - Enter API key and try export';
  statusDiv.className = 'status disconnected';
  
  // Event listeners
  document.getElementById('saveApiKey').addEventListener('click', saveApiKey);
  document.getElementById('exportData').addEventListener('click', exportData);
  document.getElementById('getStatus').addEventListener('click', getStatus);
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'PL_EXPORT_ERROR') {
      statusDiv.textContent = 'Export failed';
      showResult('Export failed: ' + request.error, 'error');
    } else if (request.type === 'PL_EXPORT_SUCCESS') {
      statusDiv.textContent = 'Export successful!';
      statusDiv.className = 'status connected';
      displayExportData(request.data);
    }
  });
  
  async function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      showResult('Please enter an API key', 'error');
      return;
    }
    
    try {
      await chrome.storage.sync.set({ projectionLabApiKey: apiKey });
      showResult('API key saved', 'success');
    } catch (error) {
      showResult('Error saving API key: ' + error.message, 'error');
    }
  }
  
  async function getStatus() {
    showResult('Status check not implemented - try export instead', 'error');
  }
  
  async function exportData() {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      showResult('Please enter an API key first', 'error');
      return;
    }
    
    console.log('📤 Attempting export...');
    statusDiv.textContent = 'Attempting export...';
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('app.projectionlab.com')) {
        showResult('Please navigate to Projection Lab first', 'error');
        statusDiv.textContent = 'Not on Projection Lab';
        return;
      }
      
      // Send export request to content script
      chrome.tabs.sendMessage(tab.id, { 
        type: 'PL_EXPORT',
        key: apiKey
      });
      
      statusDiv.textContent = 'Export in progress...';
      showResult('Export request sent. Waiting for data...', 'info');
      
    } catch (error) {
      console.error('Export error:', error);
      statusDiv.textContent = 'Export error';
      showResult('Error: ' + error.message, 'error');
    }
  }
  
  async function displayExportData(data) {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const dataSize = jsonString.length;
      
      let result = `✅ Export successful!\n\n`;
      result += `Data size: ${dataSize} characters\n`;
      result += `Data preview (first 1000 chars):\n\n`;
      result += jsonString.substring(0, 1000);
      
      if (dataSize > 1000) {
        result += `\n\n... (truncated, full data has ${dataSize} characters)`;
      }
      
      showResult(result, 'success');
      
      // Store the full data in a global variable for easy access
      window.exportedData = data;
      console.log('📊 Full export data stored in window.exportedData');
      
      // Send data to the new API endpoint
      await sendDataToApi(data);
      
    } catch (error) {
      showResult('Error displaying data: ' + error.message, 'error');
    }
  }

  async function sendDataToApi(data) {
    try {
      const apiKey = apiKeyInput.value.trim();
      if (!apiKey) {
        console.error('No API key available for sending to API');
        return;
      }

      console.log('📤 Sending data to API endpoint...');
      
      const response = await fetch('http://localhost:3000/api/set-projectionlab-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: apiKey,
          data: JSON.stringify(data)
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Data successfully sent to API:', result);
        
        // Update the result display to show API success
        const currentResult = document.getElementById('result').textContent;
        document.getElementById('result').textContent = currentResult + `\n\n🚀 Data also saved to database successfully!`;
      } else {
        const errorData = await response.json();
        console.error('❌ API call failed:', errorData);
        showResult(`Export successful, but failed to save to database: ${errorData.error}`, 'error');
      }
    } catch (error) {
      console.error('❌ Error sending data to API:', error);
      showResult(`Export successful, but failed to save to database: ${error.message}`, 'error');
    }
  }
  
  function showResult(message, type) {
    resultDiv.textContent = message;
    resultDiv.className = `result ${type}`;
    resultDiv.style.display = 'block';
    
    // Don't auto-hide for successful exports so user can read the data
    if (type !== 'success') {
      setTimeout(() => {
        resultDiv.style.display = 'none';
      }, 10000);
    }
  }
});
