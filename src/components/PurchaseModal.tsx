import React, { useState, useEffect } from 'react';
import { MaterialItem, PurchaseInfo, PurchaseStatus } from '../types';
import { X, ShoppingBag, DollarSign, Layers } from 'lucide-react';
import { formatIDR } from '../utils';

interface PurchaseModalProps {
  items: MaterialItem[];
  onClose: () => void;
  onSubmit: (purchaseMap: { [itemId: string]: PurchaseInfo }) => void;
}

export default function PurchaseModal({ items, onClose, onSubmit }: PurchaseModalProps) {
  const [supplier, setSupplier] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [unitPrices, setUnitPrices] = useState<{ [itemId: string]: number }>({});
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length > 0) {
      // Auto-generate a realistic PO number based on date and first item or batch indicator
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const cleanId = items[0].id.replace(/[^a-zA-Z0-9]/g, '');
      const isBatch = items.length > 1;
      setPoNumber(`PO-${dateStr}-${cleanId}${isBatch ? '-BCH' : ''}`);
      
      // Clear/Reset fields
      setSupplier('');
      const initialPrices: { [itemId: string]: number } = {};
      items.forEach(item => {
        initialPrices[item.id] = 0;
      });
      setUnitPrices(initialPrices);
      setPurchaseStatus('processing');
      setError(null);
    }
  }, [items]);

  if (items.length === 0) return null;

  const handlePriceChange = (itemId: string, value: number) => {
    setUnitPrices(prev => ({
      ...prev,
      [itemId]: Math.max(0, value)
    }));
  };

  const getGrandTotal = () => {
    return items.reduce((sum, item) => {
      const price = unitPrices[item.id] || 0;
      return sum + (price * item.quantity);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier.trim()) {
      setError('Nama Supplier tidak boleh kosong!');
      return;
    }
    if (!poNumber.trim()) {
      setError('Nomor PO tidak boleh kosong!');
      return;
    }

    // Check if any item has 0 or negative price
    const hasInvalidPrice = items.some(item => {
      const price = unitPrices[item.id] || 0;
      return price <= 0;
    });

    if (hasInvalidPrice) {
      setError('Semua item harus memiliki harga satuan lebih besar dari Rp 0!');
      return;
    }

    const purchaseMap: { [itemId: string]: PurchaseInfo } = {};
    const todayStr = new Date().toISOString().split('T')[0];

    items.forEach(item => {
      const price = unitPrices[item.id] || 0;
      purchaseMap[item.id] = {
        poNumber: poNumber.trim(),
        supplier: supplier.trim(),
        unitPrice: price,
        totalPrice: price * item.quantity,
        purchaseDate: todayStr,
        status: purchaseStatus,
      };
    });

    onSubmit(purchaseMap);
    onClose();
  };

  const isBatch = items.length > 1;

  return (
    <div id="purchase-modal" className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
              {isBatch ? <Layers className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                {isBatch ? 'Proses Gabungan PO (Multiple Items)' : 'Proses Pembelian (Purchase Order)'}
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">
                {isBatch ? `Menggabungkan ${items.length} permintaan ke dalam 1 nomor PO` : 'Isi rincian pembelian untuk permintaan material'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            {/* PO Number */}
            <div>
              <label htmlFor="input-po" className="block text-xs font-bold text-slate-600 mb-1">Nomor Purchase Order (PO) *</label>
              <input
                id="input-po"
                type="text"
                required
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 font-mono font-bold bg-white"
              />
            </div>

            {/* Supplier Name */}
            <div>
              <label htmlFor="input-supplier" className="block text-xs font-bold text-slate-600 mb-1">Nama Supplier / Vendor *</label>
              <input
                id="input-supplier"
                type="text"
                placeholder="Contoh: PT Semen Utama, CV Baja Mandiri"
                required
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 bg-white font-medium"
              />
            </div>
          </div>

          {/* List of items in this PO */}
          <div>
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Item-item dalam PO ini</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {items.map((item) => {
                const currentPrice = unitPrices[item.id] || 0;
                const totalItemPrice = currentPrice * item.quantity;
                return (
                  <div key={item.id} className="p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[9px] text-slate-400 font-semibold">{item.id}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold uppercase">{item.site}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 mt-1">{item.itemName}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Jumlah Diminta: <span className="font-semibold text-slate-700">{item.quantity} {item.unit}</span>
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div>
                        <label htmlFor={`price-${item.id}`} className="block text-[10px] font-bold text-slate-500 mb-1 sm:text-right">Harga Satuan (IDR)</label>
                        <div className="relative w-40">
                          <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs font-semibold">Rp</span>
                          <input
                            id={`price-${item.id}`}
                            type="number"
                            min="0"
                            required
                            value={currentPrice || ''}
                            onChange={(e) => handlePriceChange(item.id, parseInt(e.target.value) || 0)}
                            className="w-full pl-8 pr-2 py-1 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Contoh: 75000"
                          />
                        </div>
                      </div>

                      <div className="w-32">
                        <span className="block text-[10px] font-bold text-slate-500 mb-1">Subtotal</span>
                        <div className="text-xs font-extrabold text-slate-800 py-1">
                          {formatIDR(totalItemPrice)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
            {/* Purchase Status */}
            <div>
              <span className="block text-xs font-bold text-slate-600 mb-2">Status Pembelian</span>
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 flex-1 transition-colors">
                  <input
                    type="radio"
                    name="purchaseStatus"
                    checked={purchaseStatus === 'processing'}
                    onChange={() => setPurchaseStatus('processing')}
                    className="text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
                  />
                  <span>Sedang Diproses Supplier</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 flex-1 transition-colors">
                  <input
                    type="radio"
                    name="purchaseStatus"
                    checked={purchaseStatus === 'ready_for_delivery'}
                    onChange={() => setPurchaseStatus('ready_for_delivery')}
                    className="text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
                  />
                  <span>Ready / Siap Dikirim</span>
                </label>
              </div>
            </div>

            {/* Grand Total */}
            <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 flex justify-between items-center md:self-end">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Total Keseluruhan PO</span>
                <span className="text-base font-black text-purple-900 mt-1 block">
                  {formatIDR(getGrandTotal())}
                </span>
              </div>
              <div className="bg-purple-100 rounded-lg p-2 text-purple-700">
                <DollarSign className="w-5 h-5" />
              </div>
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
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <DollarSign className="w-4 h-4" /> 
              {isBatch ? `Simpan Detail PO (${items.length} Item)` : 'Simpan Detail PO'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
