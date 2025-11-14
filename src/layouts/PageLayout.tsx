import React from 'react';

// Updated interface to include optional className
interface PageLayoutProps {
  children: React.ReactNode;
  className?: string; // Make className optional
}

export default function PageLayout({ children, className = "" }: PageLayoutProps) {
  // Merge default classes with the optional className prop
  const defaultClasses = "flex-1 h-[93vh] overflow-y-auto no-scrollbar";
  
  return (
    <div className={`${defaultClasses} ${className}`}>
      {children}
    </div>
  );
}
