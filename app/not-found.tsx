import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-[#F97316]/10 border border-[#F97316]/30 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-[#F97316]" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <p className="text-xl text-gray-400 mb-8">Page not found</p>
        <Link href="/">
          <Button className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
