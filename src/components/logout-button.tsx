'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut({ 
        callbackUrl: '/login',
      });
    } catch (error) {
      console.error('Error during logout:', error);
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`flex items-center w-full px-4 py-2 ${
        isLoading ? 'opacity-50 cursor-not-allowed' : ''
      } text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md`}
      onClick={handleLogout}
      disabled={isLoading}
    >
      <LogOut className="mr-3 h-5 w-5" />
      Cerrar Sesión
    </button>
  );
}