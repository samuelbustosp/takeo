import React from 'react';
import { OrderStatus } from '@/types';
import { Clock, CheckCircle2, ChefHat, Check, Bike, PackageCheck, XCircle } from 'lucide-react';

interface Props {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  PENDING: {
    label: 'Pendiente',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Confirmado',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30',
    icon: CheckCircle2,
  },
  PREPARING: {
    label: 'En Preparación',
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/30',
    icon: ChefHat,
  },
  READY: {
    label: 'Listo para Retiro',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    icon: Check,
  },
  OUT_FOR_DELIVERY: {
    label: 'En Camino',
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/30',
    icon: Bike,
  },
  DELIVERED: {
    label: 'Entregado',
    bg: 'bg-emerald-500/15 dark:bg-emerald-500/25',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/40',
    icon: PackageCheck,
  },
  CANCELLED: {
    label: 'Cancelado',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30',
    icon: XCircle,
  },
};

export function OrderStatusBadge({ status, size = 'md', showIcon = true }: Props) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs font-medium gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm font-medium gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
    </span>
  );
}
