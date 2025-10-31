'use client';

// App.tsx
import { useEffect, useState } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

// TypeScript declarations for extension integration
declare global {
  interface Window {
    projectionLabApiKey?: string;
    getProjectionLabApiKey?: () => Promise<string>;
  }
}

export default function ChatPage() {
	const [extensionStatus, setExtensionStatus] = useState<string>('Checking...');
	const [apiKey, setApiKey] = useState<string | null>(null);
	const [chatInitialized, setChatInitialized] = useState<boolean>(false);

	useEffect(() => {
		// Add custom CSS for better UX
		const style = document.createElement('style');
		style.textContent = `
			:root {
				--chat--color-primary: #e74266;
				--chat--color-primary-shade-50: #db4061;
				--chat--color-primary-shade-100: #cf3c5c;
				--chat--color-secondary: #20b69e;
				--chat--color-secondary-shade-50: #1ca08a;
				--chat--color-white: #ffffff;
				--chat--color-light: #f2f4f8;
				--chat--color-light-shade-50: #e6e9f1;
				--chat--color-light-shade-100: #c2c5cc;
				--chat--color-medium: #d2d4d9;
				--chat--color-dark: #101330;
				--chat--color-disabled: #777980;
				--chat--color-typing: #404040;

				--chat--spacing: 1rem;
				--chat--border-radius: 0.25rem;
				--chat--transition-duration: 0.15s;

				--chat--window--width: 100%;
				--chat--window--height: 100%;

				--chat--header-height: auto;
				--chat--header--padding: var(--chat--spacing);
				--chat--header--background: var(--chat--color-dark);
				--chat--header--color: var(--chat--color-light);
				--chat--header--border-top: none;
				--chat--header--border-bottom: none;
				--chat--heading--font-size: 2em;
				--chat--subtitle--font-size: inherit;
				--chat--subtitle--line-height: 1.8;

				--chat--textarea--height: 50px;

				--chat--message--font-size: 1rem;
				--chat--message--padding: var(--chat--spacing);
				--chat--message--border-radius: var(--chat--border-radius);
				--chat--message-line-height: 1.8;
				--chat--message--bot--background: var(--chat--color-white);
				--chat--message--bot--color: var(--chat--color-dark);
				--chat--message--bot--border: none;
				--chat--message--user--background: var(--chat--color-secondary);
				--chat--message--user--color: var(--chat--color-white);
				--chat--message--user--border: none;
				--chat--message--pre--background: rgba(0, 0, 0, 0.05);

				--chat--toggle--background: var(--chat--color-primary);
				--chat--toggle--hover--background: var(--chat--color-primary-shade-50);
				--chat--toggle--active--background: var(--chat--color-primary-shade-100);
				--chat--toggle--color: var(--chat--color-white);
				--chat--toggle--size: 64px;
			}
		`;
		document.head.appendChild(style);
		
		// Check for extension and API key, then initialize chat
		checkExtensionAndApiKey();
		
		// Cleanup function
		return () => {
			document.head.removeChild(style);
		};
	}, []);

	// Initialize chat when API key is available or determined to be unavailable
	useEffect(() => {
		console.log('useEffect apiKey', apiKey);
		if (!chatInitialized && apiKey ) {
			initializeChat();
		}
	}, [apiKey, chatInitialized]);

	const initializeChat = () => {
		console.log('Initializing chat with API key:', apiKey);
		
		createChat({
			webhookUrl: 'https://n8n.apsquared.co/webhook/eca6c54b-b76a-4f72-adf4-136daa48305d/chat',
			target: '#n8n-chat',
			mode: 'fullscreen',
			showWelcomeScreen: true,
			enableStreaming: false,
			defaultLanguage: 'en',
			metadata: {
				apiKey: apiKey || undefined
			},
			initialMessages: [
				'Hello, I am your Projection Lab AI Assistant. I\'m here to help you analyze and understand your financial projections.',
				'How can I assist you today? You can ask me to summarize your finances or make suggestions for improvements.'
			],
			i18n: {
				en: {
					title: 'Welcome to Projection Lab AI Assistant',
					subtitle: 'Your intelligent financial analysis companion',
					inputPlaceholder: 'Ask me about your projections, financial data, or any questions you have...',
					sendButton: 'Send',
					typingIndicator: 'AI is typing...',
					errorMessage: 'Sorry, I encountered an error. Please try again.',
					noMessages: 'Start a conversation by typing a message below.',
					loading: 'Loading...'
				}
			}
		});
		
		setChatInitialized(true);
	};

	const checkExtensionAndApiKey = async () => {
		try {
			// Method 1: Check if API key is already available
			if (window.projectionLabApiKey) {
				setApiKey(window.projectionLabApiKey);
				setExtensionStatus('✅ Extension detected - API key available');
				return;
			}

			// Method 2: Listen for the ready event
			const handleApiKeyReady = (event: CustomEvent) => {
				const apiKey = event.detail.apiKey;
				setApiKey(apiKey);
				setExtensionStatus('✅ Extension detected - API key loaded');
			};

			window.addEventListener('projectionLabApiKeyReady', handleApiKeyReady as EventListener);

			// Method 3: Manual request if function is available
			if (typeof window.getProjectionLabApiKey === 'function') {
				try {
					const apiKey = await window.getProjectionLabApiKey();
					if (apiKey) {
						setApiKey(apiKey);
						setExtensionStatus('✅ Extension detected - API key retrieved');
					} else {
						setExtensionStatus('⚠️ Extension detected - No API key configured');
					}
				} catch (error) {
					setExtensionStatus('❌ Extension detected - Error getting API key');
				}
			} else {
				setExtensionStatus('❌ Projection Lab Export extension not detected');
			}

			// Cleanup listener after 5 seconds
			setTimeout(() => {
				window.removeEventListener('projectionLabApiKeyReady', handleApiKeyReady as EventListener);
			}, 5000);

		} catch (error) {
			setExtensionStatus('❌ Error checking extension');
			console.error('Extension check error:', error);
		}
	};


	return (
		<div className='min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100'>
			<div className='container mx-auto px-4 py-8'>
				{/* Header */}
				<div className='text-center mb-8'>
					<h1 className='text-4xl font-bold text-gray-800 mb-2'>
						Projection Lab AI Assistant
					</h1>
					<p className='text-lg text-gray-600'>
						Your intelligent financial analysis companion
					</p>
				</div>
				
				{/* Extension Status and Instructions */}
				<div className='mb-8 max-w-4xl mx-auto'>
					<div className='bg-white rounded-xl shadow-lg p-6 border border-gray-200'>
						<div className='grid md:grid-cols-2 gap-6'>
							{/* Instructions */}
							<div>
								<h3 className='text-lg font-semibold text-gray-800 mb-3 flex items-center'>
									<span className='mr-2'>📋</span>
									How it works
								</h3>
								<div className='text-sm text-gray-600 space-y-2'>
									<div className='flex items-start space-x-2'>
										<span className='flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium'>1</span>
										<span>Enable Plugin Support in Projection Lab</span>
									</div>
									<div className='flex items-start space-x-2'>
										<span className='flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium'>1</span>
										<span>Install the Projection Lab Export Chrome extension</span>
									</div>
									<div className='flex items-start space-x-2'>
										<span className='flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium'>2</span>
										<span>Visit Projection Lab and save your API key in the extension popup</span>
									</div>
									<div className='flex items-start space-x-2'>
										<span className='flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium'>3</span>
										<span>Click &quot;Export Data to AI Assistant&quot; to sync your data</span>
									</div>
									<div className='flex items-start space-x-2'>
										<span className='flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium'>4</span>
										<span>Start chatting with Peter about your financial projections!</span>
									</div>
								</div>
							</div>
							
							{/* Status */}
							<div>
								<h3 className='text-lg font-semibold text-gray-800 mb-3 flex items-center'>
									<span className='mr-2'>🔗</span>
									Connection Status
								</h3>
								<div className='space-y-3'>
									<div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
										<span className='text-sm font-medium text-gray-700'>Extension Status:</span>
										<span className={`text-sm px-3 py-1 rounded-full ${
											extensionStatus.includes('✅') 
												? 'bg-green-100 text-green-700' 
												: extensionStatus.includes('⚠️')
												? 'bg-yellow-100 text-yellow-700'
												: 'bg-red-100 text-red-700'
										}`}>
											{extensionStatus}
										</span>
									</div>
									
									{apiKey && (
										<div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
											<span className='text-sm font-medium text-gray-700'>API Key:</span>
											<span className='text-sm font-mono bg-gray-200 px-3 py-1 rounded text-gray-600'>
												{apiKey.substring(0, 8)}...{apiKey.substring(apiKey.length - 4)}
											</span>
										</div>
									)}
									
									{!apiKey && !extensionStatus.includes('✅') && (
										<div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
											<p className='text-sm text-yellow-700'>
												💡 <strong>Tip:</strong> Make sure you have the Chrome extension installed and your API key configured to get the best experience.
											</p>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
				
				{/* Chat Interface */}
				<div className='max-w-6xl mx-auto'>
					<div className='bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden'>
						{/* Always render the chat container, but show loading overlay when not initialized */}
						<div className="relative">
							{!chatInitialized && (
								<div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-10">
									<div className="text-center">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
										<p className="text-gray-600">Initializing chat interface...</p>
										<p className="text-sm text-gray-500 mt-2">
											{extensionStatus === 'Checking...' ? 'Checking for extension...' : 'Setting up AI assistant...'}
										</p>
									</div>
								</div>
							)}
							<div id="n8n-chat" style={{ width: '100%', height: '75vh', minHeight: '600px' }}></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};


