import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Mail, Phone } from 'lucide-react';

export default function AccountDeletion() {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim() || !phoneNumber.trim()) {
      setError('Please provide both email address and phone number');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/account-deletion/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phoneNumber,
          requestedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit deletion request');
      }

      setSubmitted(true);
      setEmail('');
      setPhoneNumber('');
    } catch (err) {
      setError('Failed to submit your request. Please try again or contact support.');
      console.error('Error submitting account deletion request:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Account Deletion Request</h1>
          <p className="text-lg text-gray-600">
            <strong>InvoiceDesk</strong> - Hyperdev Solutions
          </p>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-4">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-2">Request Submitted Successfully</h3>
              <p className="text-green-800 mb-2">
                Your account deletion request has been received. We will process your request within 30 days.
              </p>
              <p className="text-green-800 text-sm">
                A confirmation email will be sent to <strong>{email}</strong> with details about the deletion process.
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!submitted ? (
          <div className="space-y-8">
            {/* Information Section */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Request Account Deletion</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    What Happens When You Delete Your Account
                  </h3>
                  <p className="text-gray-700 mb-4">
                    When you request account deletion, we will permanently remove your account and associated data within 30 days. 
                    Please note the following:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-3">
                      <span className="text-red-600 font-bold">•</span>
                      <span><strong>Account Information Deleted:</strong> Name, email, phone number, business name, address, login credentials</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-red-600 font-bold">•</span>
                      <span><strong>Profile Data Deleted:</strong> Business type, registration details, preferences, and settings</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-red-600 font-bold">•</span>
                      <span><strong>Order History Deleted:</strong> All order records, payment history, and transaction data</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-red-600 font-bold">•</span>
                      <span><strong>Client Information Deleted:</strong> Customer data, contact information, and client assignments</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-red-600 font-bold">•</span>
                      <span><strong>Inventory Data Deleted:</strong> Stock levels, items, categories, and warehouse information</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-red-600 font-bold">•</span>
                      <span><strong>Communication Records Deleted:</strong> Messages, support inquiries, and feedback</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Retained for Legal/Compliance Reasons</h3>
                  <p className="text-gray-700 mb-4">
                    The following data may be retained for legal, regulatory, or compliance requirements:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-3">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Financial Records:</strong> Retained for 5 years to comply with tax and accounting regulations</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Audit Logs:</strong> May retain anonymized activity logs for security and fraud prevention</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Legal Records:</strong> May retain data if required by law or legal proceedings</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Important Notes
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-3">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>Account deletion is <strong>permanent</strong> and <strong>cannot be undone</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>You will <strong>lose access</strong> to all your data, orders, and clients</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>Deletion may take up to <strong>30 days</strong> to complete</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>You can still use your account normally until the deletion is processed</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Deletion Request Form */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Deletion Request</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    The email address associated with your InvoiceDesk account
                  </p>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your registered phone number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    The phone number associated with your InvoiceDesk account
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>Verification:</strong> We will verify your identity using the email address and phone number 
                    provided to ensure the account belongs to you before processing the deletion.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                >
                  {loading ? 'Submitting...' : 'Submit Account Deletion Request'}
                </button>

                <p className="text-xs text-gray-600 text-center">
                  By submitting this request, you acknowledge that this action cannot be undone and all your data will be permanently deleted.
                </p>
              </form>
            </div>

            {/* Contact Support */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Need Help?</h3>
              <p className="text-blue-800 mb-4">
                If you have any questions about account deletion or need assistance, please contact our support team:
              </p>
              <div className="space-y-2 text-blue-800">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:hyperdevsolutions@gmail.com" className="text-blue-600 hover:underline">
                    hyperdevsolutions@gmail.com
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>Support via email available within 30 days</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What Happens Next?</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>1. Verification:</strong> We will verify your identity using the email address and phone number you provided.
              </p>
              <p>
                <strong>2. Processing:</strong> Your account deletion request will be processed within 30 days from the date of submission.
              </p>
              <p>
                <strong>3. Confirmation:</strong> You will receive a confirmation email once your account and data have been permanently deleted.
              </p>
              <p>
                <strong>4. Retention:</strong> Some data may be retained for legal or compliance reasons as specified in our Privacy Policy.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t">
              <button
                onClick={() => setSubmitted(false)}
                className="text-blue-600 hover:underline font-semibold"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        )}

        {/* Footer Information */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600 text-sm">
          <p>
            For more information about our data practices, please see our{' '}
            <a href="/privacy-policy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
          <p className="mt-2">
            Last Updated: May 8, 2026 | Hyperdev Solutions
          </p>
        </div>
      </div>
    </div>
  );
}
