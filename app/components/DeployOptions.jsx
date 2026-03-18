'use client';
import { useState } from 'react';

export default function DeployOptions({ project, pages, onBack }) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState('');

  const handleVercelDeploy = async () => {
    let vercelToken = localStorage.getItem('vercel_token');

    if (!vercelToken) {
      const tokenInput = prompt(
        'To deploy to Vercel, you need an access token.\n\n' +
        '1. Go to: https://vercel.com/account/tokens\n' +
        '2. Create a new token\n' +
        '3. Paste it here:\n\n' +
        '(Your token will be saved locally)'
      );

      if (!tokenInput) return;

      vercelToken = tokenInput.trim();
      localStorage.setItem('vercel_token', vercelToken);
    }

    setIsDeploying(true);
    setDeployStatus('Preparing deployment...');

    try {
      setDeployStatus('Creating deployment on Vercel...');

      const response = await fetch('/api/deploy-vercel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pages,
          projectName: project?.name || 'My Pages',
          vercelToken,
        }),
      });

      const result = await response.json();

      if (result.needsAuth) {
        localStorage.removeItem('vercel_token');
        alert('Invalid Vercel token. Please try again.');
        setIsDeploying(false);
        setDeployStatus('');
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || 'Deployment failed');
      }

      setDeployStatus(`✓ Live at: ${result.url}`);

      setTimeout(() => {
        if (confirm(`✅ Deployment successful!\n\nYour site is live at:\n${result.url}\n\nOpen in new tab?`)) {
          window.open(result.url, '_blank');
        }
        setIsDeploying(false);
      }, 1000);

    } catch (error) {
      console.error('Vercel deployment error:', error);
      setDeployStatus(`❌ Error: ${error.message}`);
      setIsDeploying(false);

      if (error.message.includes('auth') || error.message.includes('token')) {
        if (confirm('Authentication failed. Clear saved token and try again?')) {
          localStorage.removeItem('vercel_token');
          handleVercelDeploy();
        }
      }
    }
  };

  const handleNetlifyDeploy = async () => {
    let netlifyToken = localStorage.getItem('netlify_token');

    if (!netlifyToken) {
      const tokenInput = prompt(
        'To deploy to Netlify, you need an access token.\n\n' +
        '1. Go to: https://app.netlify.com/user/applications#personal-access-tokens\n' +
        '2. Create a new token\n' +
        '3. Paste it here:\n\n' +
        '(Your token will be saved locally)'
      );

      if (!tokenInput) return;

      netlifyToken = tokenInput.trim();
      localStorage.setItem('netlify_token', netlifyToken);
    }

    setIsDeploying(true);
    setDeployStatus('Preparing deployment...');

    try {
      setDeployStatus('Creating deployment on Netlify...');

      const response = await fetch('/api/deploy-netlify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pages,
          projectName: project?.name || 'My Pages',
          netlifyToken,
        }),
      });

      const result = await response.json();

      if (result.needsAuth) {
        localStorage.removeItem('netlify_token');
        alert('Invalid Netlify token. Please try again.');
        setIsDeploying(false);
        setDeployStatus('');
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || 'Deployment failed');
      }

      setDeployStatus(`✓ Live at: ${result.url}`);

      setTimeout(() => {
        if (confirm(`✅ Deployment successful!\n\nYour site is live at:\n${result.url}\n\nOpen in new tab?`)) {
          window.open(result.url, '_blank');
        }
        setIsDeploying(false);
      }, 1000);

    } catch (error) {
      console.error('Netlify deployment error:', error);
      setDeployStatus(`❌ Error: ${error.message}`);
      setIsDeploying(false);

      if (error.message.includes('auth') || error.message.includes('token')) {
        if (confirm('Authentication failed. Clear saved token and try again?')) {
          localStorage.removeItem('netlify_token');
          handleNetlifyDeploy();
        }
      }
    }
  };

  const handleWordPressExport = async () => {
    try {
      const response = await fetch('/api/export-wordpress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages, projectName: project?.name || 'My Pages' }),
      });
      const result = await response.json();
      if (result.success) {
        const blob = new Blob([result.xml], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert(
          '✅ WordPress XML exported!\n\n' +
          'To import into WordPress:\n' +
          '1. Go to WordPress Admin → Tools → Import\n' +
          '2. Install "WordPress Importer" if needed\n' +
          '3. Upload the XML file\n' +
          '4. Click "Import" and assign to a user\n' +
          '5. Done! Your pages are now in WordPress'
        );
      }
    } catch (error) {
      console.error('WordPress export error:', error);
      alert('Failed to export for WordPress');
    }
  };

  const handleDownloadZIP = async () => {
    try {
      const response = await fetch('/api/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages, projectName: project?.name || 'My Pages' }),
      });
      const result = await response.json();
      if (result.success) {
        const byteCharacters = atob(result.data);
        const byteArray = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([byteArray], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to generate ZIP: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download ZIP');
    }
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-[#0f0f10] z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">

          <button
            onClick={onBack}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-8 flex items-center gap-2 transition-colors"
            disabled={isDeploying}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="mb-12">
            <h1 className="font-display text-6xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
              Deploy your pages
            </h1>
            <p className="text-2xl text-slate-500 dark:text-slate-400">
              Choose where to host your {pages?.length || 0} pages
            </p>
          </div>

          {/* Deployment status */}
          {isDeploying && deployStatus && (
            <div className="mb-8 p-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-3xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <div>
                  <div className="font-bold text-blue-900 dark:text-blue-300 mb-1">
                    Deploying...
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-400">
                    {deployStatus}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isDeploying && deployStatus && (
            <div className="mb-8 p-6 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-2xl text-sm font-medium text-slate-700 dark:text-slate-300">
              {deployStatus}
            </div>
          )}

          {/* Recommended option */}
          <div className="mb-8">
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
              Recommended (Fastest)
            </div>

            <div className="p-10 bg-gradient-to-r from-[#5b4cdb] to-[#4a3dc4] text-white rounded-3xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-5xl">⚡</div>
                    <h3 className="text-4xl font-black">Vercel</h3>
                  </div>

                  <ul className="space-y-2 mb-8 text-purple-100">
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Deploy in 30 seconds
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Free hosting with global CDN
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Custom domain support
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Automatic SSL certificate
                    </li>
                  </ul>

                  <button
                    onClick={handleVercelDeploy}
                    disabled={isDeploying}
                    className="px-10 py-5 bg-white text-purple-600 rounded-2xl font-black text-xl hover:bg-purple-50 disabled:opacity-50 transition-all hover:scale-105 hover:shadow-2xl"
                  >
                    Deploy to Vercel →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Other options */}
          <div>
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
              Other Options
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Netlify */}
              <div className="p-8 bg-white dark:bg-[#18181b] border-2 border-slate-200 dark:border-[#27272a] rounded-3xl hover:border-slate-300 dark:hover:border-[#3f3f46] hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">🌐</div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Netlify
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Free hosting with instant rollbacks
                </p>
                <button
                  onClick={handleNetlifyDeploy}
                  disabled={isDeploying}
                  className="w-full px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-all"
                >
                  Deploy to Netlify
                </button>
              </div>

              {/* WordPress */}
              <div className="p-8 bg-white dark:bg-[#18181b] border-2 border-slate-200 dark:border-[#27272a] rounded-3xl hover:border-slate-300 dark:hover:border-[#3f3f46] hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">📦</div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  WordPress
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Export as WordPress XML
                </p>
                <button
                  onClick={handleWordPressExport}
                  disabled={isDeploying}
                  className="w-full px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-all"
                >
                  Export for WordPress
                </button>
              </div>

              {/* Download ZIP */}
              <div className="p-8 bg-white dark:bg-[#18181b] border-2 border-slate-200 dark:border-[#27272a] rounded-3xl hover:border-slate-300 dark:hover:border-[#3f3f46] hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">💾</div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Download
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Get ZIP file of all pages
                </p>
                <button
                  onClick={handleDownloadZIP}
                  disabled={isDeploying}
                  className="w-full px-6 py-3 border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 disabled:opacity-50 transition-all"
                >
                  Download ZIP
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
