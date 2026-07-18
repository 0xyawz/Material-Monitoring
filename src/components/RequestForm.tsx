import React, { useState, useEffect } from 'react';
import { MaterialItem, UrgencyLevel, ConstructionSite } from '../types';
import { X, Plus, ClipboardList, Trash2, Check, AlertCircle, Layers } from 'lucide-react';

interface RequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newItemsData: Omit<MaterialItem, 'id' | 'stage' | 'requestStatus'>[]) => void;
  sites: ConstructionSite[];
}

const PREDEFINED_MATERIALS = [
  { name: 'Semen Portland Composite (Tiga Roda)', unit: 'Sak (50kg)' },
  { name: 'Besi Beton Ulir D16 (U-40) Krakatau Steel', unit: 'Batang (12m)' },
  { name: 'Besi Beton Ulir D13 (U-40) Krakatau Steel', unit: 'Batang (12m)' },
  { name: 'Beton Ready Mix K-350 (Slump 12)', unit: 'm3' },
  { name: 'Beton Ready Mix K-300 (Slump 12)', unit: 'm3' },
  { name: 'Pasir Beton Extra Super (Cimalaka)', unit: 'Truck Index 8' },
  { name: 'Pasir Pasang Cihonje', unit: 'Truck Index 8' },
  { name: 'Batu Kali Pecah / Batu Belah', unit: 'm3' },
  { name: 'Keramik Lantai 60x60 Granite (Indogress)', unit: 'Dus' },
  { name: 'Keramik Dinding 30x60 Mulia', unit: 'Dus' },
  { name: 'Pipa PVC AW 4 inch Rucika', unit: 'Batang (4m)' },
  { name: 'Pipa PVC AW 2 inch Rucika', unit: 'Batang (4m)' },
  { name: 'Baja WF 250 (Wide Flange) Gunung Garuda', unit: 'Batang (12m)' },
  { name: 'Baja WF 200 (Wide Flange) Gunung Garuda', unit: 'Batang (12m)' },
  { name: 'Bata Merah Press Garut', unit: 'Pcs' },
  { name: 'Triplek / Plywood Cor 12mm', unit: 'Lembar' },
];

interface DraftItem {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
}

export default function RequestForm({ isOpen, onClose, onSubmit, sites }: RequestFormProps) {
  const [useCustomMaterial, setUseCustomMaterial] = useState(false);
  const [materialSelect, setMaterialSelect] = useState(PREDEFINED_MATERIALS[0].name);
  const [customMaterial, setCustomMaterial] = useState('');
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState(PREDEFINED_MATERIALS[0].unit);
  const [site, setSite] = useState(sites[0]?.name || '');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [requestedBy, setRequestedBy] = useState('Staff Site Logistik');
  
  // State for multi-item list
  const [addedItems, setAddedItems] = useState<DraftItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (sites.length > 0 && (!site || !sites.some(s => s.name === site))) {
      setSite(sites[0].name);
    }
  }, [sites, site]);

  if (!isOpen) return null;

  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setMaterialSelect(val);
    const found = PREDEFINED_MATERIALS.find(item => item.name === val);
    if (found) {
      setUnit(found.unit);
    }
  };

  const handleAddItemToList = () => {
    const finalItemName = useCustomMaterial ? customMaterial.trim() : materialSelect;
    
    if (!finalItemName) {
      setErrorMessage('Nama material tidak boleh kosong!');
      return;
    }

    if (quantity <= 0) {
      setErrorMessage('Jumlah material harus lebih besar dari 0!');
      return;
    }

    if (!unit.trim()) {
      setErrorMessage('Satuan material tidak boleh kosong!');
      return;
    }

    // Check for duplicates in the draft list
    if (addedItems.some(item => item.itemName.toLowerCase() === finalItemName.toLowerCase())) {
      setErrorMessage('Material ini sudah ada di dalam daftar!');
      return;
    }

    const newItem: DraftItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      itemName: finalItemName,
      quantity: Number(quantity),
      unit: unit.trim()
    };

    setAddedItems(prev => [...prev, newItem]);
    setErrorMessage(null);

    // Reset item input fields
    setCustomMaterial('');
    setQuantity(100);
    
    // Auto-update to predefined material unit if not custom
    if (!useCustomMaterial) {
      const found = PREDEFINED_MATERIALS.find(item => item.name === materialSelect);
      if (found) {
        setUnit(found.unit);
      }
    } else {
      setUnit('');
    }
  };

  const handleRemoveItemFromList = (id: string) => {
    setAddedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let itemsToSubmit = [...addedItems];
    
    // If the list is currently empty, try to auto-add what is currently typed in the input fields
    if (itemsToSubmit.length === 0) {
      const activeItemName = useCustomMaterial ? customMaterial.trim() : materialSelect;
      if (!activeItemName) {
        setErrorMessage('Silakan tambahkan minimal satu material ke dalam daftar!');
        return;
      }
      if (quantity <= 0) {
        setErrorMessage('Jumlah material harus lebih besar dari 0!');
        return;
      }
      if (!unit.trim()) {
        setErrorMessage('Satuan material tidak boleh kosong!');
        return;
      }

      itemsToSubmit.push({
        id: 'temp-' + Date.now(),
        itemName: activeItemName,
        quantity: Number(quantity),
        unit: unit.trim()
      });
    }

    const dateRequested = new Date().toISOString().split('T')[0];
    
    const mappedItems = itemsToSubmit.map(item => ({
      itemName: item.itemName,
      quantity: item.quantity,
      unit: item.unit,
      site,
      urgency,
      requestedBy: requestedBy.trim() || 'Staff Site Logistik',
      dateRequested
    }));

    onSubmit(mappedItems);

    // Reset Form & Close
    setAddedItems([]);
    setCustomMaterial('');
    setQuantity(100);
    setUseCustomMaterial(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div id="request-modal" className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 leading-tight">Buat Permintaan Material Baru</h2>
              <p className="text-[10px] text-slate-500 font-medium">Bisa menambahkan banyak item material sekaligus ke log permintaan</p>
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

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs font-bold flex items-center gap-2 animate-fade-in shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Two Columns: Config on Left, Compose on Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Column 1: Header / Destination Config */}
            <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Informasi Pengiriman & Pemohon
              </h3>

              {/* Destination Site */}
              <div>
                <label htmlFor="input-site" className="block text-xs font-semibold text-slate-700 mb-1">Lokasi Proyek Penerima (Site) *</label>
                {sites.length === 0 ? (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
                    ⚠️ Belum ada proyek site terdaftar. Silakan tambahkan proyek terlebih dahulu.
                  </div>
                ) : (
                  <select
                    id="input-site"
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800"
                  >
                    {sites.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.location.split(',')[0]})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Requester */}
              <div>
                <label htmlFor="input-requester" className="block text-xs font-semibold text-slate-700 mb-1">Pemohon (Requested By) *</label>
                <input
                  id="input-requester"
                  type="text"
                  placeholder="Nama Site Supervisor"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
                />
              </div>

              {/* Urgency Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tingkat Urgensi *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as UrgencyLevel[]).map((level) => {
                    const colors = {
                      low: 'border-emerald-200 text-emerald-800 hover:bg-emerald-50 bg-white',
                      medium: 'border-amber-200 text-amber-800 hover:bg-amber-50 bg-white',
                      high: 'border-red-200 text-red-800 hover:bg-red-50 bg-white'
                    };
                    const activeColors = {
                      low: 'bg-emerald-500 text-white ring-1 ring-emerald-500/20 border-emerald-500 font-bold',
                      medium: 'bg-amber-500 text-white ring-1 ring-amber-500/20 border-amber-500 font-bold',
                      high: 'bg-red-500 text-white ring-1 ring-red-500/20 border-red-500 font-bold'
                    };
                    const labelInIndo = { low: 'Rendah', medium: 'Sedang', high: 'Tinggi' };
                    const isSelected = urgency === level;

                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setUrgency(level)}
                        className={`py-1.5 px-2 text-xs rounded-lg border text-center transition-all cursor-pointer ${
                          isSelected ? activeColors[level] : colors[level]
                        }`}
                      >
                        {labelInIndo[level]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Column 2: Compose Material Item Form */}
            <div className="space-y-4 bg-blue-50/20 p-4 rounded-xl border border-blue-100/50">
              <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Input Item Material
              </h3>

              {/* Material Selector or Custom Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">Nama Material *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomMaterial(!useCustomMaterial);
                      if (useCustomMaterial) {
                        setUnit(PREDEFINED_MATERIALS[0].unit);
                      } else {
                        setUnit('');
                      }
                    }}
                    className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline font-bold focus:outline-none"
                  >
                    {useCustomMaterial ? 'Pilih Template' : 'Tulis Kustom'}
                  </button>
                </div>
                
                {useCustomMaterial ? (
                  <input
                    id="input-material-custom"
                    type="text"
                    placeholder="Misal: Semen Gresik, Paku Kayu 5cm, dll"
                    value={customMaterial}
                    onChange={(e) => setCustomMaterial(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
                  />
                ) : (
                  <select
                    id="input-material-select"
                    value={materialSelect}
                    onChange={handleMaterialChange}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800"
                  >
                    {PREDEFINED_MATERIALS.map((item, idx) => (
                      <option key={idx} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Quantity & Unit in same row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="input-qty" className="block text-xs font-semibold text-slate-700 mb-1">Jumlah *</label>
                  <input
                    id="input-qty"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="input-unit" className="block text-xs font-semibold text-slate-700 mb-1">Satuan *</label>
                  <input
                    id="input-unit"
                    type="text"
                    placeholder="Sak / m3 / Pcs"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
                  />
                </div>
              </div>

              {/* Add item button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAddItemToList}
                  className="w-full py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-lg border border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tambah Ke Daftar
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Section: Current Draft Items List */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-500" />
                Daftar Material yang Diajukan ({addedItems.length} Item)
              </span>
              {addedItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAddedItems([])}
                  className="text-[10px] text-red-600 hover:text-red-800 hover:underline font-bold"
                >
                  Hapus Semua
                </button>
              )}
            </div>

            <div className="max-h-[180px] overflow-y-auto divide-y divide-slate-100">
              {addedItems.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <p>Belum ada material yang dimasukkan ke daftar.</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    * Tip: Jika Anda langsung menekan tombol <strong>Kirim Permintaan</strong> di bawah, material yang sedang aktif diinput di atas akan otomatis diajukan.
                  </p>
                </div>
              ) : (
                addedItems.map((item, index) => (
                  <div key={item.id} className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                      <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                        {index + 1}
                      </span>
                      <div className="truncate">
                        <span className="font-semibold text-slate-800">{item.itemName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {item.quantity} {item.unit}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItemFromList(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-white cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleFormSubmit}
            disabled={sites.length === 0}
            className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer ${
              sites.length === 0 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md shadow-blue-500/10'
            }`}
          >
            <Check className="w-4 h-4" />
            {addedItems.length > 0 
              ? `Kirim Permintaan (${addedItems.length} Item)` 
              : 'Kirim Permintaan'
            }
          </button>
        </div>

      </div>
    </div>
  );
}
