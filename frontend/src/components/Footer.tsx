const Footer = () => {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-6 py-10 md:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Logo + Description */}
          <div>
            <h2 className="font-bold text-lg text-gray-800">VoiceFirst Legal Guardian</h2>
            <p className="mt-4 text-sm text-gray-600">
              Making legal literacy accessible to everyone through voice-first technology.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Resources</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li><a href="#">Legal Guides</a></li>
              <li><a href="#">Common Legal Terms</a></li>
              <li><a href="#">Legal Aid Directory</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Support</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Connect</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li><a href="#">Twitter</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Facebook</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="text-center text-sm text-gray-500 mt-6 py-4 border-t">
        © {new Date().getFullYear()} VoiceFirst Legal Guardian. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
