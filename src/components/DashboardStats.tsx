import { MaterialItem } from '../types';
import { formatIDR } from '../utils';
import { 
  ClipboardList, 
  ShoppingBag, 
  Truck, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

interface DashboardStatsProps {
  items: MaterialItem[];
  selectedSite: string;
}

export default function DashboardStats({ items, selectedSite }: DashboardStatsProps) {
  // Filter items by site if selected
  const filteredItems = selectedSite === 'all' 
    ? items 
    : items.filter(item => item.site === selectedSite);

  const totalRequests = filteredItems.length;
  
  const pendingRequests = filteredItems.filter(i => i.stage === 'request' && i.requestStatus === 'pending').length;
  
  const activePurchases = filteredItems.filter(i => i.stage === 'purchase').length;
  
  const activeDeliveries = filteredItems.filter(
    i => i.stage === 'delivery' && i.delivery?.currentStatus !== 'received'
  ).length;
  
  const completedDeliveries = filteredItems.filter(
    i => i.stage === 'completed' || (i.stage === 'delivery' && i.delivery?.currentStatus === 'received')
  ).length;

  const totalSpend = filteredItems.reduce((acc, item) => {
    if (item.purchase) {
      return acc + item.purchase.totalPrice;
    }
    return acc;
  }, 0);

  const highUrgencyCount = filteredItems.filter(i => i.urgency === 'high' && i.stage !== 'completed').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Permintaan */}
      <div id="stat-total" className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-200 transition-colors">
        <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
          <ClipboardList className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Permintaan</p>
          <h3 className="text-2xl font-semibold text-slate-900 mt-1">{totalRequests}</h3>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-semibold text-amber-600">{pendingRequests}</span> butuh persetujuan
          </p>
        </div>
      </div>

      {/* Pembelian */}
      <div id="stat-purchases" className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-200 transition-colors">
        <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sedang Dibeli</p>
          <h3 className="text-2xl font-semibold text-slate-900 mt-1">{activePurchases}</h3>
          <p className="text-xs text-slate-500 mt-1">
            Total Po aktif: <span className="font-semibold text-slate-700">{filteredItems.filter(i => i.purchase).length} PO</span>
          </p>
        </div>
      </div>

      {/* Pengiriman Aktif */}
      <div id="stat-deliveries" className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-200 transition-colors">
        <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
          <Truck className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pengiriman Aktif</p>
          <h3 className="text-2xl font-semibold text-slate-900 mt-1">{activeDeliveries}</h3>
          <p className="text-xs text-slate-500 mt-1">
            Dalam transit: <span className="font-semibold text-blue-600">
              {filteredItems.filter(i => i.delivery?.currentStatus === 'transit').length} armada
            </span>
          </p>
        </div>
      </div>

      {/* Selesai / Tiba */}
      <div id="stat-completed" className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-200 transition-colors">
        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Material Tiba</p>
          <h3 className="text-2xl font-semibold text-slate-900 mt-1">{completedDeliveries}</h3>
          <p className="text-xs text-slate-500 mt-1">
            Verifikasi lengkap
          </p>
        </div>
      </div>

      {/* Sisa & Spending */}
      <div id="stat-spend" className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-200 transition-colors md:col-span-2 lg:col-span-1">
        <div className={`p-3 rounded-lg ${highUrgencyCount > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
          {highUrgencyCount > 0 ? (
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Urgent Aktif</p>
          <h3 className={`text-2xl font-semibold mt-1 ${highUrgencyCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {highUrgencyCount} item
          </h3>
          <p className="text-xs text-slate-500 mt-1 truncate max-w-full">
            Biaya PO: <span className="font-semibold text-emerald-600">{formatIDR(totalSpend)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
