import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Car,
  Receipt,
  Wifi,
  ShoppingBag,
  HeartPulse,
  Film,
  Home,
  GraduationCap,
  MoreHorizontal,
  Briefcase,
  TrendingUp,
  Gift,
  Coins,
  DollarSign,
  Wallet,
  Landmark,
  Smartphone,
  CreditCard,
  PiggyBank,
  ArrowRightLeft,
  Tag,
  LucideIcon
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Utensils,
  ShoppingCart,
  Car,
  Receipt,
  Wifi,
  ShoppingBag,
  HeartPulse,
  Film,
  Home,
  GraduationCap,
  MoreHorizontal,
  Briefcase,
  TrendingUp,
  Gift,
  Coins,
  DollarSign,
  Wallet,
  Landmark,
  Smartphone,
  CreditCard,
  PiggyBank,
  ArrowRightLeft,
  Tag,
};

interface CategoryIconProps {
  name: string;
  color?: string;
  size?: number;
  className?: string;
  showBg?: boolean;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  color = '#64748b',
  size = 18,
  className = '',
  showBg = true,
}) => {
  const IconComponent = iconMap[name] || Tag;

  if (!showBg) {
    return <IconComponent size={size} style={{ color }} className={className} />;
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 ${className}`}
      style={{
        backgroundColor: `${color}18`,
        color: color,
        width: size * 2,
        height: size * 2,
      }}
    >
      <IconComponent size={size} />
    </div>
  );
};
