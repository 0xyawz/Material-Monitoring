import React, { useState } from 'react';
import { MaterialItem, DeliveryStatus, TransitLog } from '../types';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  PlusCircle, 
  Phone, 
  User, 
  FileText 
} from 'lucide-react';
import { getDeliveryStatusLabel, getDeliveryStatusColor } from '../utils';

interface DeliverySimulationProps {
  items: MaterialItem[];
  onAddTransitLog: (itemId: string, status: DeliveryStatus, note: string) => void;
  onVerifyArrival: (itemId: string, receivedBy: string) => void;
}

export default function DeliverySimulation({ items, onAddTransitLog, onVerifyArrival }: DeliverySimulationProps) {
  const activeDeliveries = items.filter(
    item => item.stage === 'delivery' || item.stage === 'completed'
  );

  const [selectedItemId, setSelectedItemId] = useState<string>(activeDeliveries[0]?.id || '');
  const [newLogNote, setNewLogNote] = useState('');
  const [newLogStatus, setNewLogStatus] = useState<DeliveryStatus>('transit');
  const [receiverName, setReceiverName] = useState('Ir. Budi Santoso');

  const selectedItem = items.find(item => item.id === selectedItemId);

  // Status index for visual step progress bar
  const getStatusStepIndex = (status: DeliveryStatus): number => {
    switch (status) {
      case 'warehouse': return 0;
      case 'transit': return 1;
      case 'arrived': return 2;
      case 'received': return 3;
      default: return 0;
    }
  };

  const currentStep = selectedItem?.delivery ? getStatusStepIndex(selectedItem.delivery.currentStatus) : 0;

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !newLogNote.trim()) return;

    onAddTransitLog(selectedItem.id, newLogStatus, newLogNote.trim());
    setNewLogNote('');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !receiverName.trim()) return;

    onVerifyArrival(selectedItem.id, receiverName.trim());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: List of Deliveries */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs flex flex-col h-[520px]">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Truck className="w-5 h-5 text-orange-600" />
            Daftar Surat Jalan Aktif
          </h3>
          <p className="text-xs text-slate-500 mt-1">Pilih pengiriman untuk melihat rute pelacakan real-time.</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {activeDeliveries.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Truck className="w-12 h-12 stroke-1 mb-2 text-slate-300" />
              <p className="text-sm">Belum ada pengiriman aktif.</p>
              <p className="text-xs mt-1">Gunakan tombol "Kirim" di tab Kanban atau Tabel untuk memulai pengiriman material.</p>
            </div>
          ) : (
            activeDeliveries.map((item) => {
              const isSelected = item.id === selectedItemId;
              const delivery = item.delivery;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-start gap-3 ${
                    isSelected 
                      ? 'border-orange-500 bg-orange-50/20 shadow-xs ring-2 ring-orange-500/10' 
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                    <Navigation className={`w-4 h-4 ${isSelected && delivery?.currentStatus === 'transit' ? 'animate-pulse' : ''}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-700 block truncate">
                        {delivery?.suratJalan || 'SJ-PENGIRIMAN'}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                        delivery ? getDeliveryStatusColor(delivery.currentStatus) : 'bg-slate-100'
                      }`}>
                        {delivery ? getDeliveryStatusLabel(delivery.currentStatus) : 'Pending'}
                      </span>
                    </div>
                    
                    <h4 className="text-sm font-medium text-slate-800 mt-1 truncate">{item.itemName}</h4>
                    
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <span className="font-semibold text-slate-600">{item.quantity} {item.unit}</span>
                      <span>&bull;</span>
                      <span className="truncate">{item.site}</span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Dynamic Delivery Simulation View & Interactive Log additions */}
      <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl p-5 shadow-xs flex flex-col h-[520px]">
        {selectedItem && selectedItem.delivery ? (
          <div className="flex flex-col h-full overflow-y-auto space-y-6">
            
            {/* Header / Delivery info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 font-mono">SURAT JALAN</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">{selectedItem.delivery.suratJalan}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mt-0.5">{selectedItem.itemName}</h3>
                <p className="text-xs text-slate-500">Tujuan: <span className="font-medium text-slate-700">{selectedItem.site}</span></p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-right hidden md:block">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Est. Tiba (ETA)</span>
                  <span className="text-xs font-medium text-slate-700 font-mono">{selectedItem.delivery.eta}</span>
                </div>
                <span className={`px-3 py-1 rounded-full border text-xs font-semibold shadow-2xs ${getDeliveryStatusColor(selectedItem.delivery.currentStatus)}`}>
                  {getDeliveryStatusLabel(selectedItem.delivery.currentStatus)}
                </span>
              </div>
            </div>

            {/* Visual Route Simulator Road */}
            <div className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden">
              {/* Grid backdrop accents */}
              <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_14px]"></div>
              
              <div className="relative z-10">
                <span className="text-[10px] font-mono tracking-widest text-orange-400 font-bold uppercase block mb-4">SIMULASI LOGISTIK LOKASI</span>
                
                {/* Visual checkpoints map-like bar */}
                <div className="relative py-8">
                  {/* Road Asphalt background */}
                  <div className="absolute h-4 left-0 right-0 top-1/2 -translate-y-1/2 bg-slate-800 rounded-full border border-slate-700"></div>
                  
                  {/* Road stripe lines */}
                  <div className="absolute h-0.5 left-0 right-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-amber-400 opacity-60"></div>
                  
                  {/* Blue Active Progress filling road */}
                  <div 
                    className="absolute h-4 left-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-600 to-amber-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  ></div>

                  {/* Nodes on road */}
                  <div className="absolute inset-0 flex justify-between items-center px-2">
                    
                    {/* Node 1: Warehouse */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        currentStep >= 0 
                          ? 'bg-orange-500 border-white text-white shadow-[0_0_12px_rgba(249,115,22,0.6)]' 
                          : 'bg-slate-800 border-slate-700 text-slate-500'
                      }`}>
                        <span className="text-xs font-bold">1</span>
                      </div>
                      <span className="text-[10px] font-bold mt-2 text-slate-300">Gudang</span>
                    </div>

                    {/* Node 2: Transit */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        currentStep >= 1 
                          ? 'bg-orange-500 border-white text-white shadow-[0_0_12px_rgba(249,115,22,0.6)]' 
                          : 'bg-slate-800 border-slate-700 text-slate-500'
                      }`}>
                        {currentStep === 1 ? (
                          <Truck className="w-4 h-4 animate-bounce" />
                        ) : (
                          <span className="text-xs font-bold">2</span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold mt-2 text-slate-300">Transit</span>
                    </div>

                    {/* Node 3: Arrived Gate */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        currentStep >= 2 
                          ? 'bg-orange-500 border-white text-white shadow-[0_0_12px_rgba(249,115,22,0.6)]' 
                          : 'bg-slate-800 border-slate-700 text-slate-500'
                      }`}>
                        <span className="text-xs font-bold">3</span>
                      </div>
                      <span className="text-[10px] font-bold mt-2 text-slate-300">Tiba di Site</span>
                    </div>

                    {/* Node 4: Received Verified */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        currentStep >= 3 
                          ? 'bg-emerald-500 border-white text-white shadow-[0_0_12px_rgba(16,185,129,0.6)]' 
                          : 'bg-slate-800 border-slate-700 text-slate-500'
                      }`}>
                        {currentStep === 3 ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-bold">4</span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold mt-2 text-slate-300">Verified</span>
                    </div>

                  </div>
                </div>

                {/* Driver information footer overlay */}
                <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-4 mt-2 text-xs">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-bold">DRIVER</span>
                      <span className="font-semibold text-slate-200">{selectedItem.delivery.driverName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-bold">KONTAK</span>
                      <span className="font-semibold text-slate-200 font-mono text-[11px]">{selectedItem.delivery.driverPhone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-bold">ARMADA</span>
                      <span className="font-semibold text-slate-200 font-mono">{selectedItem.delivery.vehiclePlate}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Logs Timeline & Control Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Transit Log History (Left side) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  LOG TIMELINE PERJALANAN
                </h4>
                
                <div className="relative border-l border-slate-200 pl-4 space-y-4 max-h-[160px] overflow-y-auto pr-1">
                  {selectedItem.delivery.transitLogs.map((log) => (
                    <div key={log.id} className="relative text-xs">
                      {/* Indicator Bullet */}
                      <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        log.status === 'received' ? 'bg-emerald-500' : 'bg-orange-500'
                      }`}></div>
                      
                      <div className="flex justify-between items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>{log.timestamp}</span>
                        <span className="uppercase text-[9px] font-semibold font-sans">{getDeliveryStatusLabel(log.status)}</span>
                      </div>
                      <p className="font-medium text-slate-700 mt-0.5">{log.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Controls (Right side) */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 space-y-3.5">
                {selectedItem.delivery.currentStatus !== 'received' ? (
                  <>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                      <PlusCircle className="w-4 h-4 text-blue-600" />
                      Kirim Update Status / Log
                    </h4>

                    {selectedItem.delivery.currentStatus === 'arrived' ? (
                      /* Verification panel if already arrived */
                      <form onSubmit={handleVerify} className="space-y-3">
                        <p className="text-xs text-slate-500">
                          Truk telah tiba di lokasi proyek! Verifikasi muatan, pastikan jumlahnya sesuai, dan tandatangani surat jalan.
                        </p>
                        <div>
                          <label htmlFor="input-verif-name" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Penerima Proyek</label>
                          <input
                            id="input-verif-name"
                            type="text"
                            required
                            value={receiverName}
                            onChange={(e) => setReceiverName(e.target.value)}
                            placeholder="Ir. Budi Santoso"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs transition-colors flex items-center justify-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verifikasi & Terima Material
                        </button>
                      </form>
                    ) : (
                      /* General transit updates if warehouse or transit */
                      <form onSubmit={handleAddLog} className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pilih Status</label>
                            <select
                              value={newLogStatus}
                              onChange={(e) => setNewLogStatus(e.target.value as DeliveryStatus)}
                              className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800"
                            >
                              <option value="transit">Transit / Di Jalan</option>
                              <option value="arrived">Tiba di Site Proyek</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => {
                                if (newLogStatus === 'transit') {
                                  setNewLogNote('Truk memasuki area tol dan dalam kondisi lancar.');
                                } else {
                                  setNewLogNote('Material telah sampai di lokasi proyek konstruksi dan siap dibongkar.');
                                }
                              }}
                              className="text-[10px] text-blue-600 hover:underline font-medium mb-1"
                            >
                              Gunakan Template
                            </button>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="input-log-desc" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Keterangan Aktivitas</label>
                          <input
                            id="input-log-desc"
                            type="text"
                            required
                            placeholder="Misal: Truk sedang mengantri tol Cikampek."
                            value={newLogNote}
                            onChange={(e) => setNewLogNote(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs transition-colors"
                        >
                          Kirim Log Lokasi
                        </button>
                      </form>
                    )}
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-1" />
                    <p className="text-xs font-semibold text-slate-700">PENGIRIMAN SELESAI</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Material telah diverifikasi dan diterima di lokasi oleh <span className="font-semibold text-slate-700">{selectedItem.delivery.receivedBy}</span> pada {selectedItem.delivery.deliveredDate}.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <MapPin className="w-14 h-14 stroke-1 mb-3 text-slate-300" />
            <h4 className="text-base font-semibold text-slate-700">Belum Ada Pengiriman yang Dipilih</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Silakan pilih surat jalan di kolom sebelah kiri untuk memantau status pengantaran, simulasi rute GPS, dan update timeline lokasi.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
