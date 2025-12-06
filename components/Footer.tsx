import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white p-6 mt-8">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} FlavorFinds. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <a href="#" className="text-gray-300 hover:text-orange-500 transition-colors">Privacy Policy</a>
          <a href="#" className="text-gray-300 hover:text-orange-500 transition-colors">Terms of Service</a>
          <a href="#" className="text-gray-300 hover:text-orange-500 transition-colors">Contact Us</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;