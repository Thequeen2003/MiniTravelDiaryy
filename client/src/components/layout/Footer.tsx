import { Scale } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Scale className="h-6 w-6 text-primary" />
            <span className="ml-2 text-lg font-medium text-gray-900">Mini Travel Diary</span>
          </div>
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Mini Travel Diary. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
