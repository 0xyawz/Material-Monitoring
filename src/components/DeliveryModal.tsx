import React, { useState, useEffect } from 'react';
import { MaterialItem, DeliveryInfo, DeliveryStatus } from '../types';
import { X, Truck, Calendar, Layers } from 'lucide-react';

interface DeliveryModalProps {
  items: MaterialItem[];
  onClose: () => void;
  onSubmit: (deliveryMap: { [itemId: string]: DeliveryInfo }) => void;
}

export default function DeliveryModal({ items, onClose, onSubmit }: DeliveryModalProps) {
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [suratJalan, setSuratJalan] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [eta, setEta] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>('warehouse');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length > 0) {
      // Auto-generate realistic Surat Jalan
      const rNum = Math.floor(100000 + Math.random() * 900000);
      setSuratJalan(`SJ-${rNum}`);

      // Set default dates
      const now = new Date();
      const nowStr = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
      setDepartureDate(nowStr);

      // Default ETA in 6 hours
      const etaTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      const etaStr = etaTime.toISOString().slice(0, 16);
      setEta(etaStr);

      // Reset other values
      setDriverName('');
      setDriverPhone('');
      setVehiclePlate('');
      setDeliveryStatus('warehouse');
      setError(null);
    }
  }, [items]);

  if (items.length === 0) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim()) {
      setError('Nama Pengemudi / Driver tidak boleh kosong!');
      return;
    }
    if (!vehiclePlate.trim()) {
      setError('Pelat Nomor kendaraan tidak boleh kosong!');
      return;
    }
    if (!suratJalan.trim()) {
      setError('Nomor Surat Jalan tidak boleh kosong!');
      return;
    }

    const formatLocalDateTime = (dtStr: string) => {
      if (!dtStr) return '';
      return dtStr.replace('T', ' ');
    };

    const deliveryMap: { [itemId: string]: DeliveryInfo } = {};
    const timestampStr = formatLocalDateTime(departureDate);

    items.forEach(item => {
      const initialLog = {
        id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        status: deliveryStatus,
        timestamp: timestampStr,
        note: deliveryStatus === 'warehouse' 
          ? `Material ${item.itemName} dimuat di Gudang dan sedang dipersiapkan untuk jalan.`
          : `Armada diberangkatkan membawa ${item.itemName} dengan driver ${driverName.trim()} menggunakan kendaraan ${vehiclePlate.trim()}.`,
      };

      deliveryMap[item.id] = {
        suratJalan: suratJalan.trim(),
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim(),
        vehiclePlate: vehiclePlate.toUpperCase().trim(),
        departureDate: timestampStr,
        eta: formatLocalDateTime(eta),
        currentStatus: deliveryStatus,
        transitLogs: [initialLog],
      };
    });

    onSubmit(deliveryMap);
    onClose();
  };

  const isBatch = items.length > 1;

  return (
    <div id="delivery-modal" className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-700">
              {isBatch ? <Layers className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                {isBatch ? 'Proses Gabungan Surat Jalan (Multiple Items)' : 'Atur Pengiriman (Surat Jalan & Driver)'}
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">
                {isBatch ? `Menggabungkan ${items.length} material ke dalam 1 nomor Surat Jalan` : 'Isi rincian pengiriman armada untuk material ini'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Info Card of Purchased Material */}
        <div className="bg-orange-50/40 p-4 border-b border-orange-100/60 mx-6 mt-4 rounded-xl text-xs space-y-2 max-h-40 overflow-y-auto">
          <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider block">Daftar Material yang Dikirim:</span>
          <div className="divide-y divide-orange-100/50">
            {items.map(item => (
              <div key={item.id} className="py-1.5 flex justify-between gap-4 text-slate-700">
                <div>
                  <span className="font-bold text-slate-800">{item.itemName}</span>
                  <span className="text-slate-500 text-[10px] ml-1.5 font-mono">({item.id})</span>
                </div>
                <div className="text-right font-medium text-slate-600">
                  <span>{item.quantity} {item.unit} &rarr; </span>
                  <span className="font-bold text-orange-800">{item.site}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Surat Jalan Number */}
          <div>
            <label htmlFor="input-sj" className="block text-xs font-bold text-slate-600 mb-1">Nomor Surat Jalan (SJ) *</label>
            <input
              id="input-sj"
              type="text"
              required
              value={suratJalan}
              onChange={(e) => setSuratJalan(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 font-mono font-bold bg-white text-xs"
            />
          </div>

          {/* Driver Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="input-driver" className="block text-xs font-bold text-slate-600 mb-1">Nama Driver *</label>
              <input
                id="input-driver"
                type="text"
                placeholder="Misal: Slamet Wahyudi"
                required
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 text-xs bg-white"
              />
            </div>
            <div>
              <label htmlFor="input-phone" className="block text-xs font-bold text-slate-600 mb-1">No. Handphone Driver *</label>
              <input
                id="input-phone"
                type="tel"
                placeholder="0812xxxxxx"
                required
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 text-xs bg-white"
              />
            </div>
          </div>

          {/* Vehicle Plate */}
          <div>
            <label htmlFor="input-plate" className="block text-xs font-bold text-slate-600 mb-1">Pelat Nomor Kendaraan (No. Polisi) *</label>
            <input
              id="input-plate"
              type="text"
              placeholder="B 1234 CD / D 9876 XYZ"
              required
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 font-mono font-bold text-xs bg-white"
            />
          </div>

          {/* Departure & ETA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="input-departure" className="block text-xs font-bold text-slate-600 mb-1">Waktu Keberangkatan *</label>
              <input
                id="input-departure"
                type="datetime-local"
                required
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 text-xs bg-white font-semibold"
              />
            </div>
            
            <div>
              <label htmlFor="input-eta" className="block text-xs font-bold text-slate-600 mb-1">Estimasi Tiba (ETA) *</label>
              <input
                id="input-eta"
                type="datetime-local"
                required
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 text-xs bg-white font-semibold"
              />
            </div>
          </div>

          {/* Departure Status */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Status Awal</label>
            <div className="flex flex-col sm:flex-row gap-3 mt-1.5">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 flex-1 transition-colors">
                <input
                  type="radio"
                  name="deliveryStatus"
                  checked={deliveryStatus === 'warehouse'}
                  onChange={() => setDeliveryStatus('warehouse')}
                  className="text-orange-600 focus:ring-orange-500 h-3.5 w-3.5 cursor-pointer"
                />
                <span>Dimuat di Gudang (Warehouse)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 flex-1 transition-colors">
                <input
                  type="radio"
                  name="deliveryStatus"
                  checked={deliveryStatus === 'transit'}
                  onChange={() => setDeliveryStatus('transit')}
                  className="text-orange-600 focus:ring-orange-500 h-3.5 w-3.5 cursor-pointer"
                />
                <span>Langsung Jalan (Transit)</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 rounded-lg transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4" /> 
              {isBatch ? `Mulai Pengiriman (${items.length} Item)` : 'Mulai Pengiriman'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
