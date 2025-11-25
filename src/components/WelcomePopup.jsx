import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup when component mounts (site opens)
    setIsOpen(true);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-auto max-w-[90vw] sm:max-w-md p-0 overflow-hidden">
        <div className="relative">
          {/* Image */}
          <img
            src="/THEBUGSLAYERS.png"
            alt="Welcome"
            className="w-full h-auto object-contain"
            onError={(e) => {
              console.error('Failed to load welcome image');
              e.target.style.display = 'none';
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

