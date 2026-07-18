import { UrgencyLevel, Stage, RequestStatus, PurchaseStatus, DeliveryStatus } from './types';

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getUrgencyBadge(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'high':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'medium':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'low':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

export function getStageBadge(stage: Stage): string {
  switch (stage) {
    case 'request':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'purchase':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'delivery':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

export function getRequestStatusLabel(status: RequestStatus): string {
  switch (status) {
    case 'pending':
      return 'Menunggu Persetujuan';
    case 'approved':
      return 'Disetujui';
    case 'rejected':
      return 'Ditolak';
    default:
      return status;
  }
}

export function getPurchaseStatusLabel(status: PurchaseStatus): string {
  switch (status) {
    case 'processing':
      return 'Sedang Diproses';
    case 'ready_for_delivery':
      return 'Siap Dikirim';
    default:
      return status;
  }
}

export function getDeliveryStatusLabel(status: DeliveryStatus): string {
  switch (status) {
    case 'warehouse':
      return 'Di Gudang';
    case 'transit':
      return 'Dalam Perjalanan (Transit)';
    case 'arrived':
      return 'Tiba di Lokasi';
    case 'received':
      return 'Diterima & Terverifikasi';
    default:
      return status;
  }
}

export function getDeliveryStatusColor(status: DeliveryStatus): string {
  switch (status) {
    case 'warehouse':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'transit':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'arrived':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'received':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
