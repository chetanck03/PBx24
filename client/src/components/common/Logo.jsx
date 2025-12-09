import { Smartphone } from 'lucide-react';

const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8 md:w-9 md:h-9',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4 md:w-5 md:h-5',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} bg-[#c4ff0d] rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-[#c4ff0d]/30`}>
        <Smartphone className={`${iconSizes[size]} text-black`} />
      </div>
      {showText && (
        <span className={`font-bold text-white ${textSizes[size]}`}>
          PhoneBid
        </span>
      )}
    </div>
  );
};

export default Logo;