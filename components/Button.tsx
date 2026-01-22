
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  icon,
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-sky-500 hover:bg-sky-600 text-white shadow-md hover:shadow-lg",
    secondary: "bg-teal-500 hover:bg-teal-600 text-white shadow-md hover:shadow-lg",
    outline: "border-2 border-sky-500 text-sky-600 hover:bg-sky-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-rose-500 hover:bg-rose-600 text-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <i className="fas fa-circle-notch fa-spin"></i>
      ) : icon}
      {children}
    </button>
  );
};

export default Button;
