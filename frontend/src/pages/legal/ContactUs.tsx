import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, HelpCircle } from 'lucide-react';

const ContactUs: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      
      {/* Header */}
      <header className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b-2 border-amber-500/20 shadow-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="text-amber-400" size={24} />
            </button>

            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-xl">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-amber-400">Contact Us</h1>
                <p className="text-slate-400 text-sm">
                  We’re here to help you
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-12">

          {/* Intro */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-slate-700 leading-relaxed">
              If you have any questions, concerns, feedback, or need assistance
              regarding our services, feel free to reach out to us.  
              Our team at <strong>Nyay Setu</strong> will respond as soon as possible.
            </p>
          </section>

          {/* Contact Details */}
          <section className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div className="p-6 bg-amber-50 rounded-lg border-2 border-amber-200">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="text-amber-600" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Email Support
                </h3>
              </div>
              <p className="text-slate-700 mb-2">
                For general queries, support, or legal platform issues:
              </p>
              <a
                href="mailto:nyaysetu16@gmail.com"
                className="text-amber-600 font-medium hover:underline"
              >
                nyaysetu16@gmail.com
              </a>
              <p className="text-sm text-slate-600 mt-3">
                Response Time: within 24 hours (Mon–Sat)
              </p>
            </div>

            <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Location
                </h3>
              </div>
              <p className="text-slate-700">
                <strong>Nyay Setu</strong><br />
                Haryana, India
              </p>
              <p className="text-sm text-slate-600 mt-3">
                Serving users across India
              </p>
            </div>

          </section>

          {/* Support Guidelines */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              When to Contact Us
            </h2>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>Issues with lawyer consultations or bookings</li>
              <li>Payment, refund, or cancellation queries</li>
              <li>Technical problems with the platform</li>
              <li>Questions about policies or legal resources</li>
              <li>Feedback and improvement suggestions</li>
            </ul>
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

export default ContactUs;
