import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function VerifyAccountDeletion() {
  const { id, token } = useParams<{ id: string; token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your request...');

  useEffect(() => {
    const verifyDeletion = async () => {
      try {
        if (!id || !token) {
          setStatus('error');
          setMessage('Invalid verification link');
          return;
        }

        const response = await fetch(`/api/account-deletion/verify/${id}/${token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Your account deletion has been confirmed and is being processed. You will receive a confirmation email shortly.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. The link may have expired.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification. Please try again or contact support.');
        console.error('Verification error:', error);
      }
    };

    verifyDeletion();
  }, [id, token]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Verifying Request</h1>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-green-900 mb-4">Verified Successfully</h1>
              <p className="text-gray-600 mb-8">{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Go to Login
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-red-900 mb-4">Verification Failed</h1>
              <p className="text-gray-600 mb-8">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/account-deletion')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Back to Home
                </button>
              </div>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-600">
            <p>Need help? Contact us at</p>
            <a href="mailto:hyperdevsolutions@gmail.com" className="text-blue-600 hover:underline">
              hyperdevsolutions@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
