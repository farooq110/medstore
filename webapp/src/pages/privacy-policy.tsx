import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last Updated: May 8, 2026</p>

        <div className="prose prose-lg max-w-none space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              Hyperdev Solutions ("we," "our," "us," or "Company") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
              you use our mobile application ("App") available on the Google Play Store and our related services.
            </p>
            <p className="text-gray-700">
              Please read this Privacy Policy carefully. If you do not agree with our policies and practices, 
              please do not use our App.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Information You Provide Directly</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Account Information: Name, email address, phone number, business name, and address</li>
              <li>Authentication Data: Login credentials, passwords, and security questions</li>
              <li>Order Information: Product details, quantities, pricing, customer information, and delivery addresses</li>
              <li>Payment Information: Payment methods, transaction history, and financial records</li>
              <li>Communication Data: Messages, support inquiries, and feedback you send to us</li>
              <li>Profile Information: Business type, business registration details, and preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Information Collected Automatically</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Device Information: Device model, operating system, unique device identifiers, mobile network information</li>
              <li>Usage Data: App features accessed, actions performed, pages viewed, time and duration of activities</li>
              <li>Location Data: GPS location data (with your permission) for delivery tracking and route optimization</li>
              <li>Log Data: IP address, access times, pages visited, referring URL, and error information</li>
              <li>Diagnostic Data: App crashes, performance metrics, and system diagnostics</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Information from Third Parties</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Business Partners: Client information provided by sales representatives</li>
              <li>Payment Processors: Transaction confirmations and payment status updates</li>
              <li>Device Sensors: Camera (for document scanning), contacts (for client management)</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Primary Purposes</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Service Delivery: Creating and managing orders, processing payments, and managing delivery operations</li>
              <li>User Authentication: Verifying identity and managing account access</li>
              <li>Communication: Sending order updates, payment confirmations, technical support, and service announcements</li>
              <li>Analytics: Understanding app usage patterns and improving features</li>
              <li>Personalization: Customizing the app experience based on your role and preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Business Operations</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Inventory Management: Tracking stock levels and managing backorders</li>
              <li>Financial Reporting: Generating invoices, receipts, and sales reports</li>
              <li>Performance Optimization: Analyzing user behavior to improve app functionality</li>
              <li>Security: Detecting fraud, preventing abuse, and maintaining system integrity</li>
              <li>Compliance: Meeting legal, regulatory, and contractual obligations</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Marketing and Notifications</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Push Notifications: Order status updates, payment reminders, and feature announcements</li>
              <li>Email Communications: Service updates, promotional offers (with your consent)</li>
              <li>In-App Messages: Important alerts and system notifications</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Share Your Information</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Internal Sharing</h3>
            <p className="text-gray-700 mb-4">
              Information may be shared with different user roles within your organization:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Owner: Full access to all order and financial data</li>
              <li>Sales Person: Access to orders they created and assigned to them</li>
              <li>Delivery Agent: Access to orders assigned to them for delivery</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Third-Party Service Providers</h3>
            <p className="text-gray-700 mb-4">We may share information with:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Payment Processors: To process payments securely</li>
              <li>Cloud Storage Providers: For data backup and synchronization</li>
              <li>Analytics Services: To understand app performance and user behavior</li>
              <li>Push Notification Services: To send timely updates</li>
              <li>Customer Support Tools: To provide technical assistance</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Legal Requirements</h3>
            <p className="text-gray-700 mb-4">We may disclose information when:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Required by law, court order, or government request</li>
              <li>Necessary to protect our legal rights or enforce this policy</li>
              <li>Preventing fraud, security threats, or physical harm</li>
              <li>With your explicit consent</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.4 Business Transfers</h3>
            <p className="text-gray-700">
              If InvoiceDesk is acquired, merged, or undergoes bankruptcy, your information may be transferred 
              as part of that transaction. We will provide notice before any such change.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Security Measures</h3>
            <p className="text-gray-700 mb-4">We implement comprehensive security measures including:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Encryption: SSL/TLS encryption for data in transit; AES-256 encryption for data at rest</li>
              <li>Authentication: Multi-factor authentication support for user accounts</li>
              <li>Access Controls: Role-based access control restricting data based on user permissions</li>
              <li>Regular Audits: Security assessments and penetration testing</li>
              <li>Monitoring: 24/7 monitoring for suspicious activities and unauthorized access</li>
              <li>Secure API: RESTful API with security headers and rate limiting</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Password Security</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Passwords are hashed using bcrypt algorithm</li>
              <li>We never store plain-text passwords</li>
              <li>Users should use strong, unique passwords</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Limitations</h3>
            <p className="text-gray-700">
              While we implement robust security measures, no system is completely secure. We cannot guarantee 
              absolute security of your information. You use the App at your own risk.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Retention Periods</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Active Account Data: Retained while your account is active</li>
              <li>Order History: Retained for minimum 3 years for financial/tax compliance</li>
              <li>Payment Records: Retained for minimum 5 years as per financial regulations</li>
              <li>Deleted Account Data: Permanently deleted within 30 days of account deletion</li>
              <li>Inactive Accounts: May be archived after 1 year of inactivity</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Data Deletion</h3>
            <p className="text-gray-700">
              You can request deletion of your data by contacting us. We will delete personal information 
              unless required to retain it for legal or business purposes.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Privacy Rights</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Access and Portability</h3>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Request access to your personal information</li>
              <li>Receive a copy of your data in a portable format</li>
              <li>Request correction of inaccurate information</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 Deletion and Opt-Out</h3>
            <p className="text-gray-700 mb-4">You can:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Request deletion of your account and associated data</li>
              <li>Opt-out of marketing communications</li>
              <li>Disable location tracking in app settings</li>
              <li>Revoke app permissions on your device</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.3 Exercising Your Rights</h3>
            <p className="text-gray-700">
              To exercise these rights, contact us at: <strong>hyperdevsolutions@gmail.com</strong>
              <br />
              Response time: We will respond to requests within 30 days.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700">
              InvoiceDesk is designed for business use and is not intended for children under 13 years old. 
              We do not knowingly collect information from children under 13. If we discover such collection, 
              we will delete the information and terminate the child's account immediately.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Regional Privacy Regulations</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.1 GDPR (European Economic Area)</h3>
            <p className="text-gray-700 mb-4">
              If you are in the EEA, you have additional rights under GDPR:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Right to be forgotten</li>
              <li>Right to data portability</li>
              <li>Right to restrict processing</li>
              <li>Right to object to processing</li>
              <li>Right to lodge complaints with supervisory authorities</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.2 CCPA (California Users)</h3>
            <p className="text-gray-700 mb-4">
              If you are a California resident, you have rights under CCPA:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Right to know what information is collected</li>
              <li>Right to delete collected information</li>
              <li>Right to opt-out of information sale</li>
              <li>Right to non-discrimination for exercising CCPA rights</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.3 Other Regions</h3>
            <p className="text-gray-700">
              We comply with applicable privacy laws in jurisdictions where we operate.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Cookies and Tracking Technologies</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.1 Local Storage</h3>
            <p className="text-gray-700 mb-4">The app uses local device storage to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Store authentication tokens</li>
              <li>Cache frequently accessed data</li>
              <li>Save user preferences and settings</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.2 Third-Party Analytics</h3>
            <p className="text-gray-700 mb-4">We use analytics services that may collect:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>App usage patterns</li>
              <li>Feature engagement metrics</li>
              <li>Crash reports and error logs</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.3 Managing Tracking</h3>
            <p className="text-gray-700 mb-4">You can:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Clear local app data in device settings</li>
              <li>Disable location services</li>
              <li>Restrict permissions in device settings</li>
              <li>Opt-out of analytics collection (if available)</li>
            </ul>
          </section>

          {/* Section 11-17 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Third-Party Links and Services</h2>
            <p className="text-gray-700">
              The App may contain links to third-party websites and services. We are not responsible for their 
              privacy practices. Please review their privacy policies before sharing information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. International Data Transfers</h2>
            <p className="text-gray-700">
              Your information may be transferred to, stored in, and processed in countries other than your country 
              of residence. These countries may have different data protection standards. By using the App, you consent 
              to such transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Updates to This Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy periodically to reflect changes in our practices or technology. 
              We will notify you of significant changes by:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Posting the new policy in the App</li>
              <li>Sending email notification</li>
              <li>Requiring consent to updated terms</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Your continued use of the App after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              For privacy inquiries, concerns, or to exercise your rights, please contact:
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-700"><strong>InvoiceDesk Privacy Team</strong></p>
              <p className="text-gray-700">📧 Email: hyperdevsolutions@gmail.com</p>
              <p className="text-gray-700">📧 Support: hyperdevsolutions@gmail.com</p>
              <p className="text-gray-700">🌐 Website: https://invoice.hyperdevsolutions.com</p>
              <p className="text-gray-700 mt-4">
                <strong>Response Time:</strong> We aim to respond to all privacy inquiries within 30 days.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. App Permissions</h2>
            <p className="text-gray-700 mb-4">The InvoiceDesk app requests the following permissions:</p>
            <div className="space-y-2 text-gray-700">
              <p><strong>CAMERA</strong> - Purpose: Scanning invoices and documents (Optional)</p>
              <p><strong>LOCATION</strong> - Purpose: GPS tracking for delivery optimization (Optional)</p>
              <p><strong>CONTACTS</strong> - Purpose: Accessing client contact information (Optional)</p>
              <p><strong>STORAGE</strong> - Purpose: Saving documents and data locally (Required)</p>
              <p><strong>INTERNET</strong> - Purpose: Communicating with servers (Required)</p>
              <p><strong>PHONE STATE</strong> - Purpose: Background app management (Optional)</p>
            </div>
            <p className="text-gray-700 mt-4">
              Users can revoke these permissions at any time in their device settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Sensitive Personal Information</h2>
            <p className="text-gray-700 mb-4">The app collects and processes:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Financial transaction data</li>
              <li>Location information</li>
              <li>Business contact information</li>
              <li>Order and inventory details</li>
            </ul>
            <p className="text-gray-700">
              All sensitive data is encrypted and protected with industry-standard security measures.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Data Safety</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Data Encryption: All data in transit uses TLS 1.2+; data at rest uses AES-256</li>
              <li>Secure Authentication: Multi-factor authentication available</li>
              <li>Access Controls: Role-based permissions restrict data visibility</li>
              <li>Regular Security Audits: Third-party security assessments conducted quarterly</li>
              <li>Privacy by Design: Privacy considerations built into every feature</li>
            </ul>
          </section>

          <section className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Acknowledgment</h2>
            <p className="text-blue-900">
              By using InvoiceDesk, you acknowledge that you have read and understand this Privacy Policy and 
              agree to its terms. If you do not agree with any part of this policy, please do not use the App.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
