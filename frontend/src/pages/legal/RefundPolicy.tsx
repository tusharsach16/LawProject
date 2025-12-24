import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, RefreshCcw } from 'lucide-react';

const RefundPolicy: React.FC = () => {
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
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-xl">
                  <RefreshCcw className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-amber-400">Refund & Cancellation Policy</h1>
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
            <p className="text-slate-700 leading-relaxed">
              <strong>Nyay Setu</strong> believes in providing excellent service to all our users and has therefore established a fair and transparent refund and cancellation policy. This policy applies to all services purchased through our platform, including lawyer consultations and video call bookings.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8 p-6 bg-green-50 rounded-lg border-2 border-green-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Contact Information</h2>
            <div className="space-y-2 text-slate-700">
              <p><strong>Nyay Setu</strong></p>
              <p>Registered Address: Haryana, India</p>
              <p>Email: <a href="mailto:nyaysetu16@gmail.com" className="text-green-600 hover:underline">nyaysetu16@gmail.com</a></p>
              <p className="text-sm text-slate-600 mt-2">Business Hours: Monday to Saturday, 9:00 AM - 6:00 PM IST</p>
            </div>
          </section>

          {/* Cancellation Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Cancellation Policy for Lawyer Consultations</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 mb-3">1.1 User-Initiated Cancellations</h3>
            
            <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-bold text-green-800 mb-2">✅ Full Refund (100%)</h4>
              <p className="text-slate-700">
                Cancellations made <strong>more than 24 hours before</strong> the scheduled consultation time will receive a full refund.
              </p>
            </div>

            <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-bold text-yellow-800 mb-2">⚠️ Partial Refund (50%)</h4>
              <p className="text-slate-700 mb-2">
                Cancellations made <strong>between 6-24 hours before</strong> the scheduled consultation will receive a 50% refund.
              </p>
              <p className="text-sm text-slate-600">
                <strong>Deduction Reason:</strong> Covers administrative costs and lawyer's blocked time slot.
              </p>
            </div>

            <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-bold text-red-800 mb-2">❌ No Refund</h4>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                <li>Cancellations made <strong>less than 6 hours before</strong> the scheduled time</li>
                <li><strong>No-shows</strong> (failing to join the video call without prior cancellation)</li>
                <li>Consultation already completed</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">1.2 Lawyer-Initiated Cancellations</h3>
            <p className="text-slate-700 leading-relaxed mb-3">If a lawyer cancels the consultation:</p>
            
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mb-4">
              <li><strong>More than 48 hours before:</strong> User receives full refund + option to reschedule</li>
              <li><strong>Less than 48 hours before:</strong> User receives full refund plus 10% credit for future bookings</li>
              <li><strong>Emergency cancellations:</strong> Full refund processed immediately with priority rescheduling</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">1.3 Rescheduling</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li><strong>Free rescheduling</strong> if done 24+ hours before appointment</li>
              <li>One-time free rescheduling allowed per booking</li>
              <li>Additional rescheduling requests will incur a ₹100 administrative fee</li>
              <li>Lawyer-initiated rescheduling is always free for users</li>
            </ul>
          </section>

          {/* Refund Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Refund Policy</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 mb-3">2.1 Eligible Refund Scenarios</h3>
            
            <h4 className="font-semibold text-slate-700 mb-2 mt-4">Technical Issues</h4>
            <p className="text-slate-700 leading-relaxed mb-2">Full refund provided if:</p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mb-4">
              <li>Video call platform fails to connect</li>
              <li>Severe audio/video quality issues preventing consultation</li>
              <li>Platform downtime during scheduled consultation</li>
            </ul>

            <h4 className="font-semibold text-slate-700 mb-2">Service Quality Issues</h4>
            <p className="text-slate-700 leading-relaxed mb-2">Refund considered if:</p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mb-4">
              <li>Lawyer fails to join the call within 15 minutes of scheduled time</li>
              <li>Consultation is significantly shorter than paid duration (less than 50% of booked time)</li>
              <li>Lawyer provides incorrect or misleading information</li>
            </ul>

            <h4 className="font-semibold text-slate-700 mb-2">Payment Errors</h4>
            <p className="text-slate-700 leading-relaxed mb-2">Immediate refund if:</p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>Double payment charged due to technical error</li>
              <li>Payment debited but appointment not created</li>
              <li>Overcharged amount</li>
            </ul>
          </section>

          {/* Non-Refundable Scenarios */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2.2 Non-Refundable Scenarios</h2>
            <p className="text-slate-700 leading-relaxed mb-3">No refund will be provided for:</p>
            
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>User dissatisfaction with legal advice received (unless lawyer misconduct proven)</li>
              <li>Change of mind after consultation has started</li>
              <li>User's technical issues (poor internet, device problems)</li>
              <li>User providing incorrect information during booking</li>
              <li>Violation of platform terms and conditions by user</li>
            </ul>
          </section>

          {/* Refund Processing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2.3 Refund Processing Timeline</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-slate-50 rounded-lg">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-slate-700 font-semibold">Payment Method</th>
                    <th className="px-4 py-3 text-left text-slate-700 font-semibold">Processing Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-4 py-3 text-slate-700">Credit/Debit Card</td>
                    <td className="px-4 py-3 text-slate-700">5-7 business days</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-700">UPI</td>
                    <td className="px-4 py-3 text-slate-700">3-5 business days</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-700">Net Banking</td>
                    <td className="px-4 py-3 text-slate-700">5-7 business days</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-700">Wallet</td>
                    <td className="px-4 py-3 text-slate-700">2-3 business days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-slate-700 leading-relaxed mt-4">
              <strong>Note:</strong> Refund timeline depends on your bank's processing time. Nyay Setu initiates refunds within 24-48 hours of approval. Refunds are credited to the original payment method used.
            </p>
          </section>

          {/* Refund Request Process */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. How to Request Refund</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2">Step 1: Submit Request</h4>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li>Email: <a href="mailto:nyaysetu16@gmail.com" className="text-blue-600 hover:underline">nyaysetu16@gmail.com</a> with subject "Refund Request - [Appointment ID]"</li>
                  <li>Or use the "Request Refund" button in your appointment details</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2">Step 2: Provide Details</h4>
                <p className="text-slate-700 mb-2">Include the following information:</p>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li>Your registered name and email</li>
                  <li>Appointment ID or booking reference number</li>
                  <li>Date and time of consultation</li>
                  <li>Reason for refund request</li>
                  <li>Supporting documents (if applicable)</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2">Step 3: Review Process</h4>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li>Request received confirmation within 24 hours</li>
                  <li>Review completed within 3 business days</li>
                  <li>Decision communicated via email</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2">Step 4: Refund Processing</h4>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li>If approved, refund initiated within 24-48 hours</li>
                  <li>Credit to your account within 5-7 business days</li>
                  <li>Confirmation email sent once refund is processed</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Special Circumstances */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Special Circumstances</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 mb-3">5.1 Medical Emergencies</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Users facing medical emergencies may request refund or rescheduling with medical proof. Full refund or free rescheduling will be provided.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mb-3">5.2 Force Majeure Events</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              In case of natural disasters, government restrictions, or other force majeure events, affected users will receive full refund or rescheduling options.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mb-3">5.3 Lawyer Misconduct</h3>
            <p className="text-slate-700 leading-relaxed">
              If a lawyer engages in unprofessional conduct, full refund will be provided, the lawyer will be investigated, and the user may receive free consultation credit.
            </p>
          </section>

          {/* Contact Section */}
          <section className="mb-8 p-6 bg-amber-50 rounded-lg border-2 border-amber-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact for Refund Queries</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              For any questions or concerns about refunds and cancellations:
            </p>
            <div className="space-y-2 text-slate-700">
              <p><strong>Nyay Setu Customer Support</strong></p>
              <p>Email: <a href="mailto:nyaysetu16@gmail.com" className="text-amber-600 hover:underline">nyaysetu16@gmail.com</a></p>
              <p>Address: Haryana, India</p>
              <p className="text-sm text-slate-600 mt-3">
                <strong>Response Time:</strong> Email inquiries within 24 hours | Phone calls immediate during business hours
              </p>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">14. Acknowledgment</h2>
            <p className="text-slate-700 leading-relaxed">
              By booking services on Nyay Setu, you acknowledge that you have read, understood, and agree to this Refund and Cancellation Policy.
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

export default RefundPolicy;