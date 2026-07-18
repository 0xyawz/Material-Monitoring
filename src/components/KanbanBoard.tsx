import { useState } from 'react';
import { MaterialItem, Stage, UrgencyLevel, ConstructionSite } from '../types';
import ConfirmModal from './ConfirmModal';
import { 
  ClipboardList, 
  ShoppingBag, 
  Truck, 
  CheckCircle, 
  ThumbsUp, 
  ThumbsDown, 
  ArrowRight, 
  ExternalLink,
  Plus,
  Trash2,
  Layers
} from 'lucide-react';
import { formatIDR, getUrgencyBadge, getRequestStatusLabel, getPurchaseStatusLabel, getDeliveryStatusLabel } from '../utils';

interface KanbanBoardProps {
  items: MaterialItem[];
  onApproveRequest: (itemId: string) => void;
  onRejectRequest: (itemId: string) => void;
  onOpenPurchaseModal: (itemOrItems: MaterialItem | MaterialItem[]) => void;
  onOpenDeliveryModal: (itemOrItems: MaterialItem | MaterialItem[]) => void;
  onTogglePurchaseStatus: (itemId: string) => void;
  onQuickMoveToArrived: (itemId: string) => void;
  onQuickMoveToReceived: (itemId: string, receiverName: string) => void;
  onOpenRequestModal: () => void;
  selectedSite: string;
  onDeleteItems: (itemIds: string[]) => void;
}

export default function KanbanBoard({
  items,
  onApproveRequest,
  onRejectRequest,
  onOpenPurchaseModal,
  onOpenDeliveryModal,
  onTogglePurchaseStatus,
  onQuickMoveToArrived,
  onQuickMoveToReceived,
  onOpenRequestModal,
  selectedSite,
  onDeleteItems
}: KanbanBoardProps) {
  
  const [selectedCompletedIds, setSelectedCompletedIds] = useState<string[]>([]);
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [selectedDeliveryIds, setSelectedDeliveryIds] = useState<string[]>([]);

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
    if (selectedCompletedIds.length === 0) return;
    setConfirmType('batch');
    setConfirmModalOpen(true);
  };

  const executeDelete = () => {
    if (confirmType === 'single' && itemToDeleteId) {
      onDeleteItems([itemToDeleteId]);
      setSelectedCompletedIds(prev => prev.filter(id => id !== itemToDeleteId));
      setItemToDeleteId(null);
    } else if (confirmType === 'batch' && selectedCompletedIds.length > 0) {
      onDeleteItems(selectedCompletedIds);
      setSelectedCompletedIds(prev => prev.filter(id => !selectedCompletedIds.includes(id)));
    }
  };

  // Filter items by site if selected
  const filteredItems = selectedSite === 'all' 
    ? items 
    : items.filter(item => item.site === selectedSite);

  const toggleSelectCompleted = (id: string) => {
    setSelectedCompletedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllCompleted = (completedItems: MaterialItem[]) => {
    const validCompleted = completedItems.map(i => i.id);
    const allSelected = validCompleted.every(id => selectedCompletedIds.includes(id));
    if (allSelected) {
      setSelectedCompletedIds(prev => prev.filter(id => !validCompleted.includes(id)));
    } else {
      setSelectedCompletedIds(prev => {
        const added = validCompleted.filter(id => !prev.includes(id));
        return [...prev, ...added];
      });
    }
  };

  const handleDeleteSelectedCompleted = () => {
    triggerDeleteBatch();
  };


  // Group items by stage
  const requests = filteredItems.filter(item => item.stage === 'request');
  const purchases = filteredItems.filter(item => item.stage === 'purchase');
  const deliveries = filteredItems.filter(
    item => item.stage === 'delivery' && item.delivery?.currentStatus !== 'received'
  );
  const completed = filteredItems.filter(
    item => item.stage === 'completed' || (item.stage === 'delivery' && item.delivery?.currentStatus === 'received')
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
      
      {/* COLUMN 1: PERMINTAAN */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 flex flex-col min-h-[500px]">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-1.5">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Permintaan Site</h3>
          </div>
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
            {requests.length}
          </span>
        </div>

        {/* Action Button: Create Request */}
        <button
          onClick={onOpenRequestModal}
          className="w-full py-2 bg-white hover:bg-slate-100/60 text-blue-600 border border-dashed border-blue-300 rounded-lg text-xs font-semibold mb-2 flex items-center justify-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Buat Permintaan Baru
        </button>

        {/* BATCH PO OPTION FOR APPROVED REQUESTS */}
        {(() => {
          const approvedRequests = requests.filter(r => r.requestStatus === 'approved');
          const selectedInBatchCount = selectedRequestIds.filter(id => approvedRequests.some(r => r.id === id)).length;
          
          if (approvedRequests.length === 0) return null;
          return (
            <div className="bg-slate-100/70 border border-slate-200/60 rounded-lg p-2.5 mb-3 space-y-2">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-extrabold text-slate-600 select-none uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={approvedRequests.length > 0 && approvedRequests.every(r => selectedRequestIds.includes(r.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRequestIds(prev => {
                          const newIds = [...prev];
                          approvedRequests.forEach(r => {
                            if (!newIds.includes(r.id)) newIds.push(r.id);
                          });
                          return newIds;
                        });
                      } else {
                        setSelectedRequestIds(prev => prev.filter(id => !approvedRequests.some(r => r.id === id)));
                      }
                    }}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                  />
                  Pilih Semua Disetujui
                </label>
                <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">{selectedInBatchCount} terpilih</span>
              </div>
              
              {selectedInBatchCount > 0 && (
                <button
                  onClick={() => {
                    const selectedItems = approvedRequests.filter(r => selectedRequestIds.includes(r.id));
                    if (selectedItems.length > 0) {
                      onOpenPurchaseModal(selectedItems);
                      setSelectedRequestIds([]);
                    }
                  }}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Layers className="w-3.5 h-3.5" /> Gabungkan Jadi 1 PO ({selectedInBatchCount})
                </button>
              )}
            </div>
          );
        })()}

        <div className="space-y-3 overflow-y-auto flex-1 max-h-[600px] pr-1">
          {requests.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">Tidak ada permintaan aktif.</div>
          ) : (
            requests.map((item) => (
              <div key={item.id} className="bg-white border border-slate-100 rounded-lg p-3.5 shadow-2xs hover:border-slate-200 transition-all space-y-3">
                <div className="flex justify-between items-start gap-1">
                  <div className="flex items-center gap-1.5">
                    {item.requestStatus === 'approved' && (
                      <input
                        type="checkbox"
                        checked={selectedRequestIds.includes(item.id)}
                        onChange={() => {
                          setSelectedRequestIds(prev => 
                            prev.includes(item.id) 
                              ? prev.filter(id => id !== item.id) 
                              : [...prev, item.id]
                          );
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                      />
                    )}
                    <span className="font-mono text-[9px] text-slate-400 block font-semibold">{item.id}</span>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${getUrgencyBadge(item.urgency)}`}>
                    {item.urgency.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800">{item.itemName}</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Jumlah: <span className="font-semibold text-slate-700">{item.quantity} {item.unit}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">Site: <span className="text-slate-700">{item.site}</span></p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">Status:</span>
                    <span className={`text-[10px] font-bold ${
                      item.requestStatus === 'pending' ? 'text-amber-600' : item.requestStatus === 'approved' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {getRequestStatusLabel(item.requestStatus)}
                    </span>
                  </div>

                  {item.requestStatus === 'pending' ? (
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        onClick={() => onApproveRequest(item.id)}
                        className="py-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md flex items-center justify-center gap-1 border border-emerald-200"
                      >
                        <ThumbsUp className="w-3 h-3" /> Setujui
                      </button>
                      <button
                        onClick={() => onRejectRequest(item.id)}
                        className="py-1 px-2 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold rounded-md flex items-center justify-center gap-1 border border-red-200"
                      >
                        <ThumbsDown className="w-3 h-3" /> Tolak
                      </button>
                    </div>
                  ) : item.requestStatus === 'approved' ? (
                    <button
                      onClick={() => onOpenPurchaseModal(item)}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-md flex items-center justify-center gap-1.5 mt-1 transition-colors"
                    >
                      <ShoppingBag className="w-3 h-3" /> Proses Pembelian <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <p className="text-[10px] text-red-500 italic text-center">Permintaan ditolak oleh PM</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* COLUMN 2: PEMBELIAN / PROCUREMENT */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 flex flex-col min-h-[500px]">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-800 text-sm">Pembelian (PO)</h3>
          </div>
          <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full">
            {purchases.length}
          </span>
        </div>

        {/* BATCH DELIVERY OPTION FOR READY FOR DELIVERY PURCHASES */}
        {(() => {
          const readyDeliveries = purchases.filter(p => p.purchase?.status === 'ready_for_delivery');
          const selectedReadyCount = selectedDeliveryIds.filter(id => readyDeliveries.some(r => r.id === id)).length;
          
          if (readyDeliveries.length === 0) return null;
          return (
            <div className="bg-slate-100/70 border border-slate-200/60 rounded-lg p-2.5 mb-3 space-y-2">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-extrabold text-slate-600 select-none uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={readyDeliveries.length > 0 && readyDeliveries.every(r => selectedDeliveryIds.includes(r.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDeliveryIds(prev => {
                          const newIds = [...prev];
                          readyDeliveries.forEach(r => {
                            if (!newIds.includes(r.id)) newIds.push(r.id);
                          });
                          return newIds;
                        });
                      } else {
                        setSelectedDeliveryIds(prev => prev.filter(id => !readyDeliveries.some(r => r.id === id)));
                      }
                    }}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                  />
                  Pilih Semua Siap Kirim
                </label>
                <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">{selectedReadyCount} terpilih</span>
              </div>
              
              {selectedReadyCount > 0 && (
                <button
                  onClick={() => {
                    const selectedItems = readyDeliveries.filter(r => selectedDeliveryIds.includes(r.id));
                    if (selectedItems.length > 0) {
                      onOpenDeliveryModal(selectedItems);
                      setSelectedDeliveryIds([]);
                    }
                  }}
                  className="w-full py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Layers className="w-3.5 h-3.5" /> Gabungkan Jadi 1 Surat Jalan ({selectedReadyCount})
                </button>
              )}
            </div>
          );
        })()}

        <div className="space-y-3 overflow-y-auto flex-1 max-h-[600px] pr-1">
          {purchases.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">Tidak ada material dalam antrian PO.</div>
          ) : (
            purchases.map((item) => {
              const p = item.purchase!;
              return (
                <div key={item.id} className="bg-white border border-slate-100 rounded-lg p-3.5 shadow-2xs hover:border-slate-200 transition-all space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5">
                      {p.status === 'ready_for_delivery' && (
                        <input
                          type="checkbox"
                          checked={selectedDeliveryIds.includes(item.id)}
                          onChange={() => {
                            setSelectedDeliveryIds(prev => 
                              prev.includes(item.id) 
                                ? prev.filter(id => id !== item.id) 
                                : [...prev, item.id]
                            );
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                        />
                      )}
                      <span className="font-mono text-[10px] font-bold text-purple-700">{p.poNumber}</span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${
                      p.status === 'processing' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}>
                      {getPurchaseStatusLabel(p.status)}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{item.itemName}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Jumlah: <span className="font-semibold text-slate-700">{item.quantity} {item.unit}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">Supplier: <span className="font-semibold text-slate-700">{p.supplier}</span></p>
                    <p className="text-xs text-emerald-600 font-bold mt-1.5">{formatIDR(p.totalPrice)}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                    {p.status === 'processing' ? (
                      <button
                        onClick={() => onTogglePurchaseStatus(item.id)}
                        className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold rounded-md flex items-center justify-center gap-1 border border-slate-200 transition-colors"
                      >
                        Jadikan "Siap Kirim"
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenDeliveryModal(item)}
                        className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Truck className="w-3 h-3" /> Atur Pengiriman <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* COLUMN 3: PENGANTARAN / LOGISTICS */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 flex flex-col min-h-[500px]">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-1.5">
            <Truck className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-slate-800 text-sm">Sedang Dikirim</h3>
          </div>
          <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">
            {deliveries.length}
          </span>
        </div>

        <div className="space-y-3 overflow-y-auto flex-1 max-h-[600px] pr-1">
          {deliveries.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">Tidak ada pengiriman aktif saat ini.</div>
          ) : (
            deliveries.map((item) => {
              const d = item.delivery!;
              return (
                <div key={item.id} className="bg-white border border-slate-100 rounded-lg p-3.5 shadow-2xs hover:border-slate-200 transition-all space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] font-bold text-orange-700">{d.suratJalan}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${
                      d.currentStatus === 'warehouse' ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {getDeliveryStatusLabel(d.currentStatus)}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{item.itemName}</h4>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      Tujuan: <span className="font-semibold text-slate-700">{item.site}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Driver: <span className="font-medium text-slate-700">{d.driverName} ({d.vehiclePlate})</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Est. Tiba: {d.eta}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                    {d.currentStatus === 'warehouse' ? (
                      <button
                        onClick={() => onQuickMoveToArrived(item.id)}
                        className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md flex items-center justify-center border border-blue-200"
                      >
                        Ubah &rarr; Jalan (Transit)
                      </button>
                    ) : d.currentStatus === 'transit' ? (
                      <button
                        onClick={() => onQuickMoveToArrived(item.id)}
                        className="w-full py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold rounded-md flex items-center justify-center border border-amber-200"
                      >
                        Ubah &rarr; Tiba di Site
                      </button>
                    ) : d.currentStatus === 'arrived' ? (
                      <button
                        onClick={() => onQuickMoveToReceived(item.id, 'Penerima Site Gudang')}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-md flex items-center justify-center"
                      >
                        Konfirmasi Diterima
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* COLUMN 4: TIBA / SELESAI VERIFIKASI */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 flex flex-col min-h-[500px]">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">Material Tiba</h3>
          </div>
          <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
            {completed.length}
          </span>
        </div>

        {completed.length > 0 && (
          <div className="flex justify-between items-center bg-white border border-slate-200/60 rounded-lg p-2.5 mb-3 text-xs shadow-3xs">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600 select-none">
              <input
                type="checkbox"
                checked={completed.length > 0 && completed.every(item => selectedCompletedIds.includes(item.id))}
                onChange={() => toggleSelectAllCompleted(completed)}
                className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span>Tandai Semua ({completed.length})</span>
            </label>
            {completed.some(item => selectedCompletedIds.includes(item.id)) && (
              <button
                onClick={handleDeleteSelectedCompleted}
                className="flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-md font-bold text-[10px] transition-colors shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus
              </button>
            )}
          </div>
        )}

        <div className="space-y-3 overflow-y-auto flex-1 max-h-[600px] pr-1">
          {completed.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">Belum ada material yang tiba di site.</div>
          ) : (
            completed.map((item) => {
              const d = item.delivery;
              const isSelected = selectedCompletedIds.includes(item.id);
              return (
                <div 
                  key={item.id} 
                  className={`border rounded-lg p-3.5 shadow-2xs transition-all flex gap-3 items-start ${
                    isSelected 
                      ? 'border-emerald-400 bg-emerald-50/30 shadow-xs' 
                      : 'bg-emerald-50/10 border-emerald-100 hover:border-emerald-200/80 hover:bg-emerald-50/20'
                  }`}
                >
                  <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectCompleted(item.id)}
                      className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-mono text-[9px] text-slate-400 block font-semibold truncate">{item.id}</span>
                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[9px] px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold leading-none">
                          SELESAI
                        </span>
                        <button
                          onClick={() => triggerDeleteSingle(item.id)}
                          title="Hapus"
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-snug break-words">{item.itemName}</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Jumlah: <span className="font-semibold">{item.quantity} {item.unit}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">Site: <span className="text-slate-700 font-medium">{item.site}</span></p>
                    </div>

                    {d && (
                      <div className="pt-2 border-t border-emerald-100/60 text-[11px] text-slate-500 space-y-1">
                        <p>SJ: <span className="font-mono font-bold text-slate-700">{d.suratJalan}</span></p>
                        <p>Diterima: <span className="font-semibold text-slate-700">{d.receivedBy || 'Site Manager'}</span></p>
                        <p className="text-[10px] text-slate-400">Tgl: {d.deliveredDate || '2026-07-15'}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={executeDelete}
        title={confirmType === 'single' ? 'Hapus Data Material Tiba' : 'Hapus Beberapa Data'}
        message={
          confirmType === 'single'
            ? 'Apakah Anda yakin ingin menghapus data material tiba ini dari log? Tindakan ini tidak dapat dibatalkan.'
            : `Apakah Anda yakin ingin menghapus ${selectedCompletedIds.length} data material tiba dari log? Tindakan ini tidak dapat dibatalkan.`
        }
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
      />

    </div>
  );
}
