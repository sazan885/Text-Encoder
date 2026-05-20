 dgsdf 
import React, { useState } from 'react';
import { CryptoService } from './services/cryptoService';
import { EncodeResult, CryptoStatus } from './types';
import { 
  LockClosedIcon, 
  LockOpenIcon, 
  ArrowPathIcon, 
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [specialKeyEncode, setSpecialKeyEncode] = useState<string>('');
  
  const [lastResult, setLastResult] = useState<EncodeResult | null>(null);
  
  const [decodeInput, setDecodeInput] = useState<string>('');
  const [specialKeyDecode, setSpecialKeyDecode] = useState<string>('');
  const [decodedOutput, setDecodedOutput] = useState<string | null>(null);
  
  const [status, setStatus] = useState<CryptoStatus>(CryptoStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  const handleEncode = async () => {
    if (!inputText.trim() || !specialKeyEncode.trim()) {
      setError("Both message and special access key are required.");
      return;
    }
    try {
      setStatus(CryptoStatus.IDLE);
      const result = await CryptoService.encode(inputText, specialKeyEncode);
      setLastResult(result);
      setDecodeInput(result.package);
      setSpecialKeyDecode(specialKeyEncode);
      setDecodedOutput(null);
      setError(null);
    } catch (err) {
      setError("Failed to encode data. Ensure you are using a modern browser with Crypto support.");
    }
  };

  const handleDecode = async () => {
    if (!decodeInput.trim() || !specialKeyDecode.trim()) {
      setError("Both encrypted package and special access key are required.");
      return;
    }
    try {
      const result = await CryptoService.decode(decodeInput, specialKeyDecode);
      setDecodedOutput(result);
      setStatus(CryptoStatus.SUCCESS);
      setError(null);
    } catch (err) {
      setDecodedOutput(null);
      setStatus(CryptoStatus.ERROR);
      setError(err instanceof Error ? err.message : "Invalid package or key.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center font-sans">
      <div className="max-w-5xl w-full space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Dynamic Key + Special Key Access</h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            A high-security system blending <strong>unique dynamic entropy</strong> with your <strong>personal special key</strong>.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Encoder Section */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col space-y-4">
            <div className="flex items-center space-x-2 text-indigo-600 font-bold mb-2">
              <LockClosedIcon className="w-5 h-5" />
              <h2>ENCODER</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">1. Special Access Key</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="password"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Enter your secret key..."
                    value={specialKeyEncode}
                    onChange={(e) => setSpecialKeyEncode(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">2. Original Data</label>
                <textarea 
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  placeholder="Secret message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>
            </div>

            <button 
              onClick={handleEncode}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span>Generate Dynamic Package</span>
            </button>

            {lastResult && (
              <div className="mt-4 p-4 bg-slate-900 rounded-xl text-indigo-300 font-mono text-xs break-all relative group">
                <div className="flex justify-between mb-2">
                   <span className="text-slate-500 font-sans">DYNAMIC PART:</span>
                   <span className="text-indigo-400 truncate ml-2">{lastResult.raw.key.substring(0, 12)}...</span>
                </div>
                <div className="line-clamp-3 text-slate-300">
                  {lastResult.package}
                </div>
                <button 
                  onClick={() => copyToClipboard(lastResult.package)}
                  className="absolute bottom-2 right-2 p-2 bg-slate-800 rounded-md hover:bg-slate-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ClipboardDocumentCheckIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>

          {/* Decoder Section */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col space-y-4">
            <div className="flex items-center space-x-2 text-emerald-600 font-bold mb-2">
              <LockOpenIcon className="w-5 h-5" />
              <h2>DECODER</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">1. Special Access Key</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="password"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="Enter the same key..."
                    value={specialKeyDecode}
                    onChange={(e) => setSpecialKeyDecode(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">2. Encrypted Package</label>
                <textarea 
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none font-mono text-xs"
                  placeholder="Paste package here..."
                  value={decodeInput}
                  onChange={(e) => setDecodeInput(e.target.value)}
                />
              </div>
            </div>

            <button 
              onClick={handleDecode}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-100 active:scale-[0.98]"
            >
              <span>Verify & Decode</span>
            </button>

            {status === CryptoStatus.SUCCESS && decodedOutput && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div className="text-xs text-emerald-600 font-bold mb-1 uppercase tracking-tight">Decoded Result:</div>
                <p className="text-slate-800 font-medium whitespace-pre-wrap">{decodedOutput}</p>
              </div>
            )}

            {(status === CryptoStatus.ERROR || error) && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-red-600 font-bold uppercase">System Note</div>
                  <p className="text-red-700 text-sm">{error || "Decryption failed."}</p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Info Card */}
        <section className="bg-slate-900 text-slate-100 p-8 rounded-3xl shadow-xl space-y-4">
          <h3 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
             <ShieldCheckIcon className="w-6 h-6" />
             Security Architecture
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            This system utilizes <strong>AES-GCM (256-bit)</strong> encryption. The final encryption key is a bitwise XOR result of a cryptographically secure random session key and a password-derived key (PBKDF2 with 100,000 iterations). 
            <br/><br/>
            <strong>Result:</strong> Even if someone steals the encrypted package, they cannot decrypt it without your <em>Special Access Key</em>. Even if you use the same Special Key twice, the resulting package is completely different every time due to the <em>Dynamic Key</em> component.
          </p>
        </section>

        <footer className="text-center text-slate-400 text-xs pb-12">
           &copy; 2024 Secure Dynamic Crypto Labs. Powered by Web Crypto API.
        </footer>
      </div>
    </div>
  );
};

export default App;
