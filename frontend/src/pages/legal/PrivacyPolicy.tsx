import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Shield } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b-2 border-amber-500/20 shadow-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="text-amber-400" size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-amber-400">Privacy Policy</h1>
                  <p className="text-slate-400 text-sm">Last Updated: December 20, 2024</p>
                </div>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors print:hidden"
            >
              <Printer size={18} />
              <span>Print</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-12">
          
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Introduction</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              This Privacy Policy sets out how <strong>Nyay Setu</strong> collects, uses, stores, and protects any information that you provide when you visit our website or use our services.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Nyay Setu is committed to ensuring that your privacy is protected. We only collect information necessary to provide you with better services, and we will only use it in accordance with this Privacy Policy.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Contact Information</h2>
            <div className="space-y-2 text-slate-700">
              <p><strong>Legal Entity Name:</strong> Nyay Setu</p>
              <p><strong>Registered Address:</strong> Haryana, India</p>
              <p><strong>Operational Address:</strong> Haryana, India</p>
              <p><strong>Email:</strong> <a href="mailto:nyaysetu16@gmail.com" className="text-blue-600 hover:underline">nyaysetu16@gmail.com</a></p>
            </div>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 mb-3">1.1 Personal Information</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mb-4">
              <li>Name (first name, last name)</li>
              <li>Contact information (email address, phone number)</li>
              <li>Demographic information (location, postcode, preferences)</li>
              <li>Professional information (for lawyers: license number, specialization, experience)</li>
              <li>Educational information (for law students: college name, year, enrollment number)</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mb-3">1.2 Transaction Information</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mb-4">
              <li>Payment details (processed securely through Razorpay)</li>
              <li>Booking and appointment history</li>
              <li>Consultation records (date, time, duration)</li>
              <li>Transaction IDs and payment status</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mb-3">1.3 Usage Information</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>Pages visited on our website</li>
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Quiz attempts and scores</li>
              <li>AI chatbot conversation history</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-slate-700 leading-relaxed mb-3">We require this information to understand your needs and provide you with better service, particularly for the following reasons:</p>
            
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>Internal record keeping and account management</li>
              <li>To facilitate lawyer consultation bookings and video calls</li>
              <li>To process payments securely through Razorpay</li>
              <li>To send booking confirmations and appointment reminders</li>
              <li>To improve our products and services</li>
              <li>To send promotional emails about new features and offers (with consent)</li>
              <li>To customize the website according to your interests</li>
              <li>For customer support and dispute resolution</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Data Sharing and Disclosure</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 mb-3">5.1 With Lawyers</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              When you book a consultation, we share your name, contact details, and appointment information with the lawyer. Lawyers do not have access to your payment information.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mb-3">5.2 With Payment Processors</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              We use <strong>Razorpay</strong> as our payment gateway. Transaction information is shared to process payments securely. We do not store credit/debit card details.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mb-3">5.3 What We Do NOT Do</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>We do not sell your personal information to third parties</li>
              <li>We do not rent your data to marketers</li>
              <li>We do not share your information for advertising without consent</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Data Security</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              We are committed to ensuring that your information is secure. We have implemented appropriate security measures:
            </p>
            
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li><strong>Encryption:</strong> SSL/TLS encryption for data transmission</li>
              <li><strong>Secure Storage:</strong> Encrypted database storage</li>
              <li><strong>Access Controls:</strong> Limited access to personal data</li>
              <li><strong>PCI-DSS Compliance:</strong> Payment processing through Razorpay (PCI-DSS certified)</li>
              <li><strong>Regular Backups:</strong> To prevent data loss</li>
            </ul>
          </section>

          {/* Cookies Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Cookies Policy</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 mb-3">8.1 What Are Cookies</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              A cookie is a small text file stored on your device that helps us remember your login session, understand website traffic, and personalize your experience.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mb-3">8.2 Types of Cookies We Use</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mb-4">
              <li><strong>Essential Cookies:</strong> Required for login and security (cannot be disabled)</li>
              <li><strong>Analytics Cookies:</strong> Help us understand user behavior</li>
              <li><strong>Preference Cookies:</strong> Remember your settings</li>
            </ul>

            <p className="text-slate-700 leading-relaxed">
              You can control cookies through your browser settings. Note that disabling cookies may limit website functionality.
            </p>
          </section>

          {/* Your Data Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Your Data Rights</h2>
            <p className="text-slate-700 leading-relaxed mb-3">You have the following rights regarding your personal information:</p>
            
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li><strong>Right to Access:</strong> Request a copy of personal data we hold</li>
              <li><strong>Right to Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Right to Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Object:</strong> Object to direct marketing communications</li>
              <li><strong>Right to Portability:</strong> Receive your data in a portable format</li>
            </ul>
          </section>

          {/* Controlling Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Controlling Your Personal Information</h2>
            
            <p className="text-slate-700 leading-relaxed mb-3">
              You may choose to restrict the collection or use of your personal information in the following ways:
            </p>
            
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mb-4">
              <li>Look for opt-out checkboxes when filling forms on our website</li>
              <li>Opt-out of promotional emails by clicking "unsubscribe"</li>
              <li>Update preferences in your account dashboard</li>
              <li>Contact us at <a href="mailto:nyaysetu16@gmail.com" className="text-blue-600 hover:underline">nyaysetu16@gmail.com</a> to change preferences</li>
            </ul>

            <p className="text-slate-700 leading-relaxed">
              If you believe that any information we are holding is incorrect or incomplete, please contact us as soon as possible. We will promptly correct any information found to be incorrect.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Changes to Privacy Policy</h2>
            <p className="text-slate-700 leading-relaxed">
              Nyay Setu may change this policy from time to time by updating this page. You should check this page periodically to ensure that you are aware of any changes. Changes are effective immediately upon posting on the website.
            </p>
          </section>

          {/* Contact Section */}
          <section className="mb-8 p-6 bg-amber-50 rounded-lg border-2 border-amber-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              For any questions, concerns, or requests regarding this Privacy Policy or your personal data:
            </p>
            <div className="space-y-2 text-slate-700">
              <p><strong>Nyay Setu</strong></p>
              <p>Haryana, India</p>
              <p>Email: <a href="mailto:nyaysetu16@gmail.com" className="text-amber-600 hover:underline">nyaysetu16@gmail.com</a></p>
              <p className="text-sm text-slate-600 mt-3">Business Hours: Monday to Saturday, 9:00 AM - 6:00 PM IST</p>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">17. Acknowledgment</h2>
            <p className="text-slate-700 leading-relaxed">
              By using our website and services, you acknowledge that you have read, understood, and agree to the collection, use, and disclosure of your information as described in this Privacy Policy.
            </p>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-slate-200 text-center text-slate-500 text-sm">
            <p>© 2024 Nyay Setu. All Rights Reserved.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;