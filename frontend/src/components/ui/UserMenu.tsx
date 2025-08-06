import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, UserPlus, LogIn, ChevronDown, Camera, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle responsive positioning
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Check if menu extends beyond left edge
      if (rect.left < 8) {
        menu.style.left = '8px';
        menu.style.right = 'auto';
      }
      
      // Check if menu extends beyond right edge
      if (rect.right > viewportWidth - 8) {
        menu.style.right = '8px';
        menu.style.left = 'auto';
      }
    }
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    onClose();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      variant: "default",
    });
  };

  const handleProfileClick = () => {
    navigate('/profile');
    onClose();
  };

  const handleAdminDashboardClick = () => {
    navigate('/admin-dashboard');
    onClose();
  };

  const handleWishlistClick = () => {
    navigate('/wishlist');
    onClose();
  };

  const handleLoginClick = () => {
    navigate('/login');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute top-full mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50 max-w-[calc(100vw-2rem)] sm:max-w-none left-1/2 transform -translate-x-1/2 sm:left-auto sm:transform-none sm:right-0 sm:ml-0"
      style={{
        maxWidth: 'calc(100vw - 2rem)',
        left: '50%',
        transform: 'translateX(-50%)'
      }}
    >
      {user ? (
        // Authenticated User Menu
        <div className="p-4 space-y-3">
          {/* User Info */}
          <div className="flex items-center space-x-3 pb-3 border-b border-border">
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleProfileClick}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleWishlistClick}
            >
              <Heart className="mr-2 h-4 w-4" />
              Wishlist
            </Button>

            {user.role === 'admin' && (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleAdminDashboardClick}
              >
                <Settings className="mr-2 h-4 w-4" />
                Admin Dashboard
              </Button>
            )}

            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      ) : (
        // Guest User Menu
        <div className="p-4 space-y-3">
          <div className="text-center pb-3 border-b border-border">
            <p className="text-sm text-muted-foreground">
              Log in to access your account
            </p>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={handleLoginClick}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Log In
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu; 