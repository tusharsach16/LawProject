import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Scale } from 'lucide-react';

const TermsAndConditions: React.FC = () => {
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
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-xl">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-amber-400">Terms and Conditions</h1>
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
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              For the purpose of these Terms and Conditions, the term <strong>"we"</strong>, <strong>"us"</strong>, <strong>"our"</strong> used anywhere on this page shall mean <strong>NYAY SETU</strong>, whose registered/operational office is <strong>Haryana, India</strong>.
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong>"You"</strong>, <strong>"your"</strong>, <strong>"user"</strong>, <strong>"visitor"</strong> shall mean any natural or legal person who is visiting our website and/or agreed to use our services or make purchases from us.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Acceptance of Terms</h2>
            <p className="text-slate-700 leading-relaxed">
              By accessing and using this website (www.nyaysetu.com), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our website or services.
            </p>
          </section>

          {/* Services Provided */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Services Provided</h2>
            <p className="text-slate-700 leading-relaxed mb-3">Nyay Setu provides an online legal platform that offers:</p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>AI-powered legal chatbot assistance</li>
              <li>Legal quiz and educational content</li>
              <li>Mock trial simulations for law students and lawyers</li>
              <li>Connection services between users and verified lawyers</li>
              <li>Video consultation booking and payment services</li>
              <li>Legal information and resources</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. User Accounts</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 mb-3">4.1 Registration</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mb-4">
              <li>Users must provide accurate and complete information during registration</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You must be at least 18 years of age to create an account</li>
              <li>You agree to notify us immediately of any unauthorized use of your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mb-3">4.2 Account Types</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li><strong>General Users:</strong> Access to chatbot, legal resources, and lawyer consultation booking</li>
              <li><strong>Law Students:</strong> Additional access to mock trials, quizzes, and educational features</li>
              <li><strong>Lawyers:</strong> Verified professionals who can receive consultation bookings and appointments</li>
            </ul>
          </section>

          {/* Booking and Payment Services */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Booking and Payment Services</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 mb-3">6.1 Consultation Bookings</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mb-4">
              <li>Users can book video consultations with lawyers through our platform</li>
              <li>Payment must be completed at the time of booking</li>
              <li>Consultation fees are set by individual lawyers and paid through our secure payment gateway</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mb-3">6.2 Payment Processing</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mb-4">
              <li>We use <strong>Razorpay</strong> as our payment gateway partner</li>
              <li>All payments are processed securely in INR (Indian Rupees)</li>
              <li>Transaction fees of 2% are applicable on live payments</li>
              <li>Payment confirmation emails will be sent to both user and lawyer</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mb-3">6.3 Refund Policy</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>Refund requests must be made within 24 hours of booking</li>
              <li>Consultation fees are non-refundable once the video call has been initiated</li>
              <li>In case of technical issues preventing the consultation, full refund will be provided</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Limitation of Liability</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              We do not guarantee uninterrupted or error-free access to our services. Our total liability for any claims shall not exceed the amount paid by you for the specific service in question.
            </p>
            <p className="text-slate-700 leading-relaxed">
              We are not liable for indirect, consequential, or punitive damages arising from the use of our services.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">14. Dispute Resolution</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              These Terms and Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Rohtak, Haryana.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Users should first contact our customer support to resolve disputes at <strong>nyaysetu16@gmail.com</strong>
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8 p-6 bg-amber-50 rounded-lg border-2 border-amber-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Information</h2>
            <div className="space-y-2 text-slate-700">
              <p><strong>Nyay Setu</strong></p>
              <p>Registered Address: Haryana, India</p>
              <p>Email: <a href="mailto:nyaysetu16@gmail.com" className="text-amber-600 hover:underline">nyaysetu16@gmail.com</a></p>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">22. Acknowledgment</h2>
            <p className="text-slate-700 leading-relaxed">
              By using our website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
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

export default TermsAndConditions;