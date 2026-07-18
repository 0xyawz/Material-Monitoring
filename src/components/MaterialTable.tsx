import React, { useState } from 'react';
import { MaterialItem, UrgencyLevel, Stage, ConstructionSite } from '../types';
import ConfirmModal from './ConfirmModal';
import { 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  DollarSign,
  Truck,
  ArrowRight,
  Layers
} from 'lucide-react';
import { 
  formatIDR, 
  getUrgencyBadge, 
  getStageBadge, 
  getRequestStatusLabel, 
  getPurchaseStatusLabel, 
  getDeliveryStatusLabel,
  getDeliveryStatusColor
} from '../utils';

interface MaterialTableProps {
  items: MaterialItem[];
  onApproveRequest: (itemId: string) => void;
  onRejectRequest: (itemId: string) => void;
  onOpenPurchaseModal: (itemOrItems: MaterialItem | MaterialItem[]) => void;
  onOpenDeliveryModal: (itemOrItems: MaterialItem | MaterialItem[]) => void;
  onDeleteItem: (itemId: string) => void;
  onDeleteItems?: (itemIds: string[]) => void;
  selectedSite: string;
}

export default function MaterialTable({
  items,
  onApproveRequest,
  onRejectRequest,
  onOpenPurchaseModal,
  onOpenDeliveryModal,
  onDeleteItem,
  onDeleteItems,
  selectedSite
}: MaterialTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [selectedItemDetail, setSelectedItemDetail] = useState<MaterialItem | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Confirm Modal State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<'single' | 'batch'>('single');
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

  const triggerDeleteSingle = (id: string) => {
    setItemToDeleteId(id);
    setConfirmType('single');
    setConfirmModalOpen(true);
  };

  const triggerDeleteBatch = () => {
    if (selectedItemIds.length === 0) return;
    setConfirmType('batch');
    setConfirmModalOpen(true);
  };

  const executeDelete = () => {
    if (confirmType === 'single' && itemToDeleteId) {
      onDeleteItem(itemToDeleteId);
      if (selectedItemDetail?.id === itemToDeleteId) {
        setSelectedItemDetail(null);
      }
      setSelectedItemIds(prev => prev.filter(id => id !== itemToDeleteId));
      setItemToDeleteId(null);
    } else if (confirmType === 'batch' && selectedItemIds.length > 0) {
      if (onDeleteItems) {
        onDeleteItems(selectedItemIds);
      }
      setSelectedItemIds([]);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    // Site filter
    const matchesSite = selectedSite === 'all' || item.site === selectedSite;
    
    // Stage filter
    const matchesStage = stageFilter === 'all' || item.stage === stageFilter;
    
    // Urgency filter
    const matchesUrgency = urgencyFilter === 'all' || item.urgency === urgencyFilter;
    
    // Search term (Material Name, ID, PO Number, Surat Jalan)
    const normalizedSearch = searchTerm.toLowerCase();
    const matchesSearch = 
      item.itemName.toLowerCase().includes(normalizedSearch) ||
      item.id.toLowerCase().includes(normalizedSearch) ||
      (item.purchase?.poNumber || '').toLowerCase().includes(normalizedSearch) ||
      (item.delivery?.suratJalan || '').toLowerCase().includes(normalizedSearch);

    return matchesSite && matchesStage && matchesUrgency && matchesSearch;
  });

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFiltered = () => {
    const allSelected = filteredItems.length > 0 && filteredItems.every(item => selectedItemIds.includes(item.id));
    if (allSelected) {
      setSelectedItemIds(prev => prev.filter(id => !filteredItems.some(item => item.id === id)));
    } else {
      setSelectedItemIds(prev => {
        const added = filteredItems.filter(item => !prev.includes(item.id)).map(item => item.id);
        return [...prev, ...added];
      });
    }
  };

  const handleDeleteSelected = () => {
    triggerDeleteBatch();
  };


  return (
    <div className="space-y-4">
      
      {/* Filters bar */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <span className="absolute left-3 top-2.5 text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder="Cari material, ID, No. PO/SJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Stage Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Tahap:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Semua Tahap</option>
              <option value="request">Permintaan</option>
              <option value="purchase">Pembelian</option>
              <option value="delivery">Pengiriman</option>
              <option value="completed">Selesai / Tiba</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Urgensi:</span>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Semua Urgensi</option>
              <option value="high">Tinggi (High)</option>
              <option value="medium">Sedang (Medium)</option>
              <option value="low">Rendah (Low)</option>
            </select>
          </div>
        </div>

      </div>

      {/* Selected Items Actions Bar */}
      {selectedItemIds.length > 0 && (() => {
        const selectedApprovedRequests = items.filter(item => 
          selectedItemIds.includes(item.id) && 
          item.stage === 'request' && 
          item.requestStatus === 'approved'
        );
        const selectedReadyDeliveries = items.filter(item => 
          selectedItemIds.includes(item.id) && 
          item.stage === 'purchase' && 
          item.purchase?.status === 'ready_for_delivery'
        );
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex justify-between items-center text-xs text-blue-800 font-medium shadow-2xs animate-fade-in">
            <span className="flex items-center gap-1.5">
              <span>Terpilih: <strong>{selectedItemIds.length}</strong> item dari daftar filter saat ini</span>
            </span>
            <div className="flex gap-2">
              {selectedApprovedRequests.length > 0 && (
                <button
                  onClick={() => {
                    onOpenPurchaseModal(selectedApprovedRequests);
                    setSelectedItemIds(prev => prev.filter(id => !selectedApprovedRequests.some(r => r.id === id)));
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" /> Gabungkan Jadi 1 PO ({selectedApprovedRequests.length})
                </button>
              )}
              {selectedReadyDeliveries.length > 0 && (
                <button
                  onClick={() => {
                    onOpenDeliveryModal(selectedReadyDeliveries);
                    setSelectedItemIds(prev => prev.filter(id => !selectedReadyDeliveries.some(r => r.id === id)));
                  }}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" /> Gabungkan Jadi 1 Surat Jalan ({selectedReadyDeliveries.length})
                </button>
              )}
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus Terpilih
              </button>
            </div>
          </div>
        );
      })()}

      {/* Main Table layout split with detail view if an item is selected */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Table Body Column */}
        <div className={`bg-white border border-slate-100 rounded-xl overflow-hidden shadow-xs ${
          selectedItemDetail ? 'lg:col-span-2' : 'lg:col-span-3'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="px-5 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={filteredItems.length > 0 && filteredItems.every(item => selectedItemIds.includes(item.id))}
                      onChange={toggleSelectAllFiltered}
                      className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-5 py-3">ID / Material</th>
                  <th className="px-4 py-3">Site / Pemohon</th>
                  <th className="px-4 py-3">Jumlah</th>
                  <th className="px-4 py-3">Urgensi</th>
                  <th className="px-4 py-3">Tahap</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      Tidak ada data material yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isRowSelected = selectedItemIds.includes(item.id);
                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                          selectedItemDetail?.id === item.id 
                            ? 'bg-blue-50/10' 
                            : isRowSelected 
                              ? 'bg-blue-50/20' 
                              : ''
                        }`}
                        onClick={() => setSelectedItemDetail(item)}
                      >
                        <td className="px-5 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isRowSelected}
                            onChange={() => toggleSelectItem(item.id)}
                            className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-[10px] font-bold text-slate-400">{item.id}</span>
                          <h4 className="font-semibold text-slate-800 text-sm mt-0.5 line-clamp-1">{item.itemName}</h4>
                          <span className="text-[10px] text-slate-400 font-medium">Diajukan: {item.dateRequested}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-slate-700 text-xs line-clamp-1">{item.site}</p>
                          <p className="text-[10px] text-slate-400 truncate">{item.requestedBy}</p>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-700">
                          {item.quantity} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getUrgencyBadge(item.urgency)}`}>
                            {item.urgency.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold ${getStageBadge(item.stage)}`}>
                            {item.stage === 'request' ? 'Permintaan' : item.stage === 'purchase' ? 'Pembelian' : item.stage === 'delivery' ? 'Pengiriman' : 'Selesai'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedItemDetail(item)}
                              title="Lihat Detail"
                              className="p-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => triggerDeleteSingle(item.id)}
                              title="Hapus"
                              className="p-1.5 rounded text-red-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Item Detail Panel Column (Slides-in if selected) */}
        {selectedItemDetail && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-5 animate-fade-in flex flex-col">
            
            {/* Detail Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] text-slate-400 font-mono font-bold block">{selectedItemDetail.id}</span>
                <h3 className="font-bold text-slate-800 text-sm line-clamp-2">{selectedItemDetail.itemName}</h3>
              </div>
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-1 py-0.5 rounded hover:bg-slate-200/60"
              >
                Tutup
              </button>
            </div>

            {/* Core Details */}
            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span>Lokasi Penerima:</span>
                <span className="font-bold text-slate-800 text-right max-w-[60%]">{selectedItemDetail.site}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span>Jumlah:</span>
                <span className="font-bold text-slate-800">{selectedItemDetail.quantity} {selectedItemDetail.unit}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span>Diajukan Oleh:</span>
                <span className="font-medium text-slate-700">{selectedItemDetail.requestedBy}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span>Tanggal Pengajuan:</span>
                <span className="font-mono">{selectedItemDetail.dateRequested}</span>
              </div>
            </div>

            {/* Stage Timeline Overview inside Details */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tahapan Alur Material</h4>
              
              <div className="space-y-3.5">
                {/* Step 1: Request Status */}
                <div className="flex gap-2">
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      selectedItemDetail.requestStatus === 'approved' ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-700'
                    }`}>
                      1
                    </div>
                    <div className="w-0.5 h-6 bg-slate-200"></div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Permintaan (Request)</p>
                    <p className="text-[10px] text-slate-400">
                      {selectedItemDetail.requestStatus === 'approved' 
                        ? `Disetujui pada ${selectedItemDetail.approvedDate || selectedItemDetail.dateRequested}`
                        : 'Menunggu verifikasi Site Manager / PM'
                      }
                    </p>
                    {selectedItemDetail.requestStatus === 'pending' && (
                      <div className="flex gap-2 mt-1.5">
                        <button
                          onClick={() => {
                            onApproveRequest(selectedItemDetail.id);
                            // Update local reference
                            setSelectedItemDetail({
                              ...selectedItemDetail,
                              requestStatus: 'approved',
                              approvedDate: new Date().toISOString().split('T')[0]
                            });
                          }}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] rounded font-bold"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => {
                            onRejectRequest(selectedItemDetail.id);
                            setSelectedItemDetail({
                              ...selectedItemDetail,
                              requestStatus: 'rejected'
                            });
                          }}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[10px] rounded font-bold"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 2: Purchase Order */}
                <div className="flex gap-2">
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      selectedItemDetail.purchase ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      2
                    </div>
                    <div className="w-0.5 h-6 bg-slate-200"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800">Pembelian (Purchase Order)</p>
                    {selectedItemDetail.purchase ? (
                      <div className="bg-white border border-slate-100 rounded p-2 text-[10px] space-y-1 mt-1">
                        <p className="font-mono">PO: <span className="font-bold">{selectedItemDetail.purchase.poNumber}</span></p>
                        <p>Supplier: <span className="font-semibold">{selectedItemDetail.purchase.supplier}</span></p>
                        <p>Total: <span className="text-emerald-600 font-bold">{formatIDR(selectedItemDetail.purchase.totalPrice)}</span></p>
                        <p>Status: <span className="font-medium text-purple-700">{getPurchaseStatusLabel(selectedItemDetail.purchase.status)}</span></p>
                      </div>
                    ) : (
                      <>
                        <p className="text-[10px] text-slate-400">Belum diproses pembelian.</p>
                        {selectedItemDetail.requestStatus === 'approved' && (
                          <button
                            onClick={() => onOpenPurchaseModal(selectedItemDetail)}
                            className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[10px] rounded font-bold mt-1.5"
                          >
                            Buat PO Pembelian
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Step 3: Delivery Dispatch */}
                <div className="flex gap-2">
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      selectedItemDetail.delivery ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      3
                    </div>
                    <div className="w-0.5 h-6 bg-slate-200"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800">Pengiriman (Logistics / Delivery)</p>
                    {selectedItemDetail.delivery ? (
                      <div className="bg-white border border-slate-100 rounded p-2 text-[10px] space-y-1 mt-1">
                        <p className="font-mono">SJ: <span className="font-bold">{selectedItemDetail.delivery.suratJalan}</span></p>
                        <p>Armada: <span className="font-semibold">{selectedItemDetail.delivery.vehiclePlate}</span></p>
                        <p>Driver: <span className="font-semibold">{selectedItemDetail.delivery.driverName}</span></p>
                        <p>Transit: <span className="font-medium text-orange-700">{getDeliveryStatusLabel(selectedItemDetail.delivery.currentStatus)}</span></p>
                      </div>
                    ) : (
                      <>
                        <p className="text-[10px] text-slate-400">Menunggu pengaturan armada.</p>
                        {selectedItemDetail.purchase && selectedItemDetail.purchase.status === 'ready_for_delivery' && (
                          <button
                            onClick={() => onOpenDeliveryModal(selectedItemDetail)}
                            className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-[10px] rounded font-bold mt-1.5"
                          >
                            Atur & Kirim Material
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Step 4: Arrived */}
                <div className="flex gap-2">
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      selectedItemDetail.stage === 'completed' || selectedItemDetail.delivery?.currentStatus === 'received' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      4
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Tiba di Site & Verifikasi</p>
                    {selectedItemDetail.stage === 'completed' || selectedItemDetail.delivery?.currentStatus === 'received' ? (
                      <p className="text-[10px] text-emerald-600 font-medium">
                        Diterima oleh {selectedItemDetail.delivery?.receivedBy || 'Site Manager'} pada {selectedItemDetail.delivery?.deliveredDate || 'Selesai'}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400">Material belum tiba / belum terverifikasi.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={executeDelete}
        title={confirmType === 'single' ? 'Hapus Item Material' : 'Hapus Beberapa Item'}
        message={
          confirmType === 'single'
            ? 'Apakah Anda yakin ingin menghapus item material ini dari log? Tindakan ini tidak dapat dibatalkan.'
            : `Apakah Anda yakin ingin menghapus ${selectedItemIds.length} data material yang dipilih dari log? Tindakan ini tidak dapat dibatalkan.`
        }
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
      />

    </div>
  );
}
