// Simple Projection Lab Export - Background Script
console.log('🔧 Background script loaded');

chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  if (request.type === 'PL_EXPORT_ERROR') {
    // Forward error to popup
    chrome.runtime.sendMessage({ 
      type: 'PL_EXPORT_ERROR', 
      error: request.error 
    });
    sendResponse({ success: true });
    return true;
  }
  
  if (request.type === 'PL_EXPORT_SUCCESS') {
    // Forward success data to popup
    chrome.runtime.sendMessage({ 
      type: 'PL_EXPORT_SUCCESS', 
      data: request.data 
    });
    sendResponse({ success: true });
    return true;
  }
  
  sendResponse({ success: true });
});
