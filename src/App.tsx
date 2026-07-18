import React, { useState, useEffect } from 'react';
import { MaterialItem, ConstructionSite, DeliveryInfo, PurchaseInfo, DeliveryStatus, Stage } from './types';
import { mockSites, initialMaterialItems } from './mockData';
import { 
  Building2, 
  MapPin, 
  Plus, 
  RefreshCw, 
  LayoutDashboard, 
  KanbanSquare, 
  Truck, 
  Table, 
  Info,
  Calendar,
  AlertCircle,
  Trash2
} from 'lucide-react';

// Components
import DashboardStats from './components/DashboardStats';
import RequestForm from './components/RequestForm';
import PurchaseModal from './components/PurchaseModal';
import DeliveryModal from './components/DeliveryModal';
import DeliverySimulation from './components/DeliverySimulation';
import KanbanBoard from './components/KanbanBoard';
import MaterialTable from './components/MaterialTable';
import ConfirmModal from './components/ConfirmModal';

const LOCAL_STORAGE_KEY = 'site_material_procurement_items';
const SITES_LOCAL_STORAGE_KEY = 'site_material_procurement_sites';

export default function App() {
  const [items, setItems] = useState<MaterialItem[]>([]);
  const [sites, setSites] = useState<ConstructionSite[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'kanban' | 'simulation' | 'table' | 'info'>('dashboard');
  
  // Modals state
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [purchaseItems, setPurchaseItems] = useState<MaterialItem[]>([]);
  const [deliveryItems, setDeliveryItems] = useState<MaterialItem[]>([]);

  // Site adding form state
  const [isAddingSite, setIsAddingSite] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteCode, setNewSiteCode] = useState('');
  const [newSiteLocation, setNewSiteLocation] = useState('');
  const [newSiteManager, setNewSiteManager] = useState('');
  const [newSiteLat, setNewSiteLat] = useState('-6.2088');
  const [newSiteLng, setNewSiteLng] = useState('106.8456');
  const [siteFormError, setSiteFormError] = useState<string | null>(null);

  // Custom Confirm Modal State
  const [appConfirmOpen, setAppConfirmOpen] = useState(false);
  const [appConfirmType, setAppConfirmType] = useState<'reset' | 'clear' | 'delete_site' | null>(null);
  const [siteToDelete, setSiteToDelete] = useState<{ id: string; name: string } | null>(null);

  const triggerResetData = () => {
    setAppConfirmType('reset');
    setAppConfirmOpen(true);
  };

  const triggerClearAllData = () => {
    setAppConfirmType('clear');
    setAppConfirmOpen(true);
  };

  const triggerDeleteSite = (id: string, name: string) => {
    setSiteToDelete({ id, name });
    setAppConfirmType('delete_site');
    setAppConfirmOpen(true);
  };

  const executeAppConfirm = () => {
    if (appConfirmType === 'reset') {
      saveSites(mockSites);
      saveItems(initialMaterialItems);
    } else if (appConfirmType === 'clear') {
      saveSites([]);
      saveItems([]);
      setSelectedSite('all');
    } else if (appConfirmType === 'delete_site' && siteToDelete) {
      const updated = sites.filter(s => s.id !== siteToDelete.id);
      saveSites(updated);
      if (selectedSite === siteToDelete.name) {
        setSelectedSite('all');
      }
      setSiteToDelete(null);
    }
    setAppConfirmType(null);
  };

  // Initialize data from local storage or empty array by default
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        setItems([]);
      }
    } else {
      setItems([]);
    }

    const savedSites = localStorage.getItem(SITES_LOCAL_STORAGE_KEY);
    if (savedSites) {
      try {
        setSites(JSON.parse(savedSites));
      } catch (e) {
        setSites([]);
      }
    } else {
      setSites([]); // Starts EMPTY as requested: "hapus semua nama proyek/site"
    }
  }, []);

  // Save to local storage on changes
  const saveItems = (updatedItems: MaterialItem[]) => {
    setItems(updatedItems);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedItems));
  };

  const saveSites = (updatedSites: ConstructionSite[]) => {
    setSites(updatedSites);
    localStorage.setItem(SITES_LOCAL_STORAGE_KEY, JSON.stringify(updatedSites));
  };

  const handleResetData = () => {
    triggerResetData();
  };

  const handleClearAllData = () => {
    triggerClearAllData();
  };

  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim() || !newSiteCode.trim() || !newSiteLocation.trim() || !newSiteManager.trim()) {
      setSiteFormError('Mohon isi semua field wajib!');
      return;
    }

    // Check for duplicate name
    if (sites.some(s => s.name.toLowerCase() === newSiteName.trim().toLowerCase())) {
      setSiteFormError('Proyek dengan nama tersebut sudah terdaftar!');
      return;
    }

    // Check for duplicate code
    if (sites.some(s => s.code.toLowerCase() === newSiteCode.trim().toLowerCase())) {
      setSiteFormError('Proyek dengan kode tersebut sudah terdaftar!');
      return;
    }

    const newSite: ConstructionSite = {
      id: 'site-' + Date.now(),
      name: newSiteName.trim(),
      code: newSiteCode.trim().toUpperCase(),
      location: newSiteLocation.trim(),
      manager: newSiteManager.trim(),
      latitude: -6.2088,
      longitude: 106.8456
    };

    saveSites([...sites, newSite]);

    // Reset fields
    setNewSiteName('');
    setNewSiteCode('');
    setNewSiteLocation('');
    setNewSiteManager('');
    setNewSiteLat('-6.2088');
    setNewSiteLng('106.8456');
    setSiteFormError(null);
    setIsAddingSite(false);
  };

  const handleDeleteSite = (siteId: string, siteName: string) => {
    triggerDeleteSite(siteId, siteName);
  };

  // Stage Transitions
  const handleApproveRequest = (itemId: string) => {
    const updated = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          requestStatus: 'approved' as const,
          approvedDate: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    });
    saveItems(updated);
  };

  const handleRejectRequest = (itemId: string) => {
    const updated = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          requestStatus: 'rejected' as const
        };
      }
      return item;
    });
    saveItems(updated);
  };

  const handleBatchAddPurchaseInfo = (purchaseMap: { [itemId: string]: PurchaseInfo }) => {
    const updated = items.map(item => {
      if (purchaseMap[item.id]) {
        return {
          ...item,
          stage: 'purchase' as const,
          purchase: purchaseMap[item.id]
        };
      }
      return item;
    });
    saveItems(updated);
  };

  const handleTogglePurchaseStatus = (itemId: string) => {
    const updated = items.map(item => {
      if (item.id === itemId && item.purchase) {
        return {
          ...item,
          purchase: {
            ...item.purchase,
            status: 'ready_for_delivery' as const
          }
        };
      }
      return item;
    });
    saveItems(updated);
  };

  const handleBatchAddDeliveryInfo = (deliveryMap: { [itemId: string]: DeliveryInfo }) => {
    const updated = items.map(item => {
      if (deliveryMap[item.id]) {
        return {
          ...item,
          stage: 'delivery' as const,
          delivery: deliveryMap[item.id]
        };
      }
      return item;
    });
    saveItems(updated);
  };

  const handleAddTransitLog = (itemId: string, status: DeliveryStatus, note: string) => {
    const updated = items.map(item => {
      if (item.id === itemId && item.delivery) {
        const now = new Date();
        const timestamp = now.toISOString().replace('T', ' ').substring(0, 16);
        
        const newLog = {
          id: 'log-' + Date.now(),
          status,
          timestamp,
          note
        };

        const currentLogs = [...item.delivery.transitLogs, newLog];

        // If status is arrived, but not yet verified received
        return {
          ...item,
          delivery: {
            ...item.delivery,
            currentStatus: status,
            transitLogs: currentLogs
          }
        };
      }
      return item;
    });
    saveItems(updated);
  };

  const handleVerifyArrival = (itemId: string, receivedBy: string) => {
    const updated = items.map(item => {
      if (item.id === itemId && item.delivery) {
        const now = new Date();
        const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);
        
        const newLog = {
          id: 'log-received-' + Date.now(),
          status: 'received' as const,
          timestamp: dateStr,
          note: `Material telah dibongkar, divalidasi, dan ditandatangani oleh ${receivedBy}. Pengiriman Selesai.`
        };

        return {
          ...item,
          stage: 'completed' as const,
          delivery: {
            ...item.delivery,
            currentStatus: 'received' as const,
            transitLogs: [...item.delivery.transitLogs, newLog],
            deliveredDate: dateStr,
            receivedBy
          }
        };
      }
      return item;
    });
    saveItems(updated);
  };

  const handleQuickMoveToArrived = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || !item.delivery) return;

    const currentStatus = item.delivery.currentStatus;
    let nextStatus: DeliveryStatus = 'transit';
    let note = '';

    if (currentStatus === 'warehouse') {
      nextStatus = 'transit';
      note = 'Armada truk berangkat meninggalkan gudang logistik supplier.';
    } else if (currentStatus === 'transit') {
      nextStatus = 'arrived';
      note = 'Truk kargo tiba di gerbang proyek konstruksi, bersiap proses pemeriksaan manifes.';
    }

    handleAddTransitLog(itemId, nextStatus, note);
  };

  const handleQuickMoveToReceived = (itemId: string, receiverName: string) => {
    handleVerifyArrival(itemId, receiverName);
  };

  const handleAddMaterialRequest = (newItemsData: Omit<MaterialItem, 'id' | 'stage' | 'requestStatus'>[]) => {
    const newRequests: MaterialItem[] = [];
    
    newItemsData.forEach((data) => {
      const siteObj = sites.find(s => s.name === data.site);
      const projectCode = siteObj ? siteObj.code.toUpperCase() : 'GEN';
      
      const date = data.dateRequested ? new Date(data.dateRequested) : new Date();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yy = String(date.getFullYear()).slice(-2);
      const prefix = `${projectCode}/MAT/${mm}${yy}/`;

      // Find highest counter across all items (items in memory, and ones already added in this batch)
      let maxCounter = 0;
      
      items.forEach(item => {
        if (item.id.startsWith(prefix)) {
          const parts = item.id.split('/');
          const lastPart = parts[parts.length - 1];
          const num = parseInt(lastPart, 10);
          if (!isNaN(num) && num > maxCounter) {
            maxCounter = num;
          }
        }
      });
      
      newRequests.forEach(item => {
        if (item.id.startsWith(prefix)) {
          const parts = item.id.split('/');
          const lastPart = parts[parts.length - 1];
          const num = parseInt(lastPart, 10);
          if (!isNaN(num) && num > maxCounter) {
            maxCounter = num;
          }
        }
      });

      const nextCounter = maxCounter + 1;
      const formattedId = `${prefix}${String(nextCounter).padStart(3, '0')}`;

      newRequests.push({
        ...data,
        id: formattedId,
        stage: 'request',
        requestStatus: 'pending'
      });
    });

    saveItems([...newRequests, ...items]);
  };

  const handleDeleteItem = (itemId: string) => {
    const filtered = items.filter(item => item.id !== itemId);
    saveItems(filtered);
  };

  const handleDeleteItems = (itemIds: string[]) => {
    const filtered = items.filter(item => !itemIds.includes(item.id));
    saveItems(filtered);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* APP TOP BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo and App Title */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-500/15">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 leading-tight tracking-tight sm:text-lg">LogistikSite</h1>
                <p className="text-[10px] text-slate-500 font-medium">Monitoring Permintaan & Status Material</p>
              </div>
            </div>

            {/* Right side controls: Site selector & action buttons */}
            <div className="flex items-center gap-3">
              
              {/* Site Selector Dropdown */}
              <div className="relative">
                <select
                  id="site-selector"
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 cursor-pointer max-w-[180px] sm:max-w-[260px] truncate"
                >
                  <option value="all">Semua Proyek Site</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Default Data */}
              <button
                onClick={handleResetData}
                title="Isi Ulang Data Contoh"
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors bg-white hidden sm:block"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Kosongkan Semua Data */}
              <button
                onClick={handleClearAllData}
                title="Kosongkan Semua Data"
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-lg border border-slate-200 transition-colors bg-white"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Buat Permintaan Button */}
              <button
                onClick={() => setIsRequestOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs py-1.5 px-3 rounded-lg shadow-sm flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Permintaan Baru</span>
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* NAVIGATION TABS SUBBAR */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 py-3" aria-label="Tabs">
            
            {/* Dashboard / Ringkasan */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Ringkasan</span>
            </button>

            {/* Kanban Board */}
            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'kanban'
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <KanbanSquare className="w-4 h-4" />
              <span>Alur Kanban</span>
            </button>

            {/* Transit Simulation Map */}
            <button
              onClick={() => setActiveTab('simulation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'simulation'
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Simulasi Pengantaran</span>
            </button>

            {/* Logistics Table */}
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'table'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Tabel Logistik</span>
            </button>

            {/* Project Site Profiles */}
            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'info'
                  ? 'bg-slate-100 text-slate-800'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>Profil Site</span>
            </button>

          </nav>
        </div>
      </div>

      {/* MAIN LAYOUT BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Selected Project banner info */}
        {selectedSite !== 'all' && (
          <div className="bg-blue-600/5 border border-blue-500/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-700 mt-0.5">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">{selectedSite}</h2>
                <p className="text-xs text-slate-500">
                  Site Manager: <span className="font-semibold text-slate-700">{sites.find(s => s.name === selectedSite)?.manager || 'Tidak diketahui'}</span> &bull; 
                  Lokasi: <span className="font-medium">{sites.find(s => s.name === selectedSite)?.location || 'Tidak diketahui'}</span>
                </p>
              </div>
            </div>
            <span className="text-[10px] sm:self-center bg-slate-200/60 font-semibold px-2 py-1 rounded border border-slate-300/40 text-slate-600">
              LOKASI TERFILTER
            </span>
          </div>
        )}

        {/* Dynamic Dashboard KPI Stats (Always on top for Dashboard or Kanban, optional) */}
        {activeTab === 'dashboard' && (
          <DashboardStats items={items} selectedSite={selectedSite} />
        )}

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick Action Widget Panels */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Recent Active Deliveries Banner widget */}
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Pengiriman Sedang Berlangsung</h3>
                    <p className="text-xs text-slate-500">Material dalam proses pengantaran jalan raya.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('simulation')} 
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold transition-colors"
                  >
                    Buka Simulator &rarr;
                  </button>
                </div>

                <div className="space-y-3">
                  {items.filter(i => i.stage === 'delivery' && i.delivery?.currentStatus !== 'received').length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                      Tidak ada pengiriman aktif. Hubungkan PO material di tab Kanban untuk memulai kiriman.
                    </div>
                  ) : (
                    items.filter(i => i.stage === 'delivery' && i.delivery?.currentStatus !== 'received').slice(0, 3).map((item) => {
                      const d = item.delivery!;
                      return (
                        <div key={item.id} className="border border-slate-100 bg-slate-50/40 rounded-lg p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                              <Truck className="w-4 h-4 animate-bounce" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-800">{item.itemName}</h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Proyek: <span className="font-semibold text-slate-600">{item.site}</span> &bull; SJ: <span className="font-mono text-slate-700">{d.suratJalan}</span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="text-right">
                              <span className="text-[9px] font-bold text-slate-400 uppercase block">DRIVER</span>
                              <span className="text-xs font-medium text-slate-700">{d.driverName}</span>
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                              {d.currentStatus === 'transit' ? 'DALAM TRANSIT' : 'DI GUDANG'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action Flow Chart / Manual Guidance */}
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Alur Monitoring Material</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  
                  {/* Step 1 */}
                  <div className="p-3 bg-blue-50/30 border border-blue-100/50 rounded-lg flex flex-col items-center">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-2">1</span>
                    <h4 className="text-xs font-bold text-slate-800">Permintaan</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Diajukan supervisor site proyek konstruksi.</p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3 bg-purple-50/30 border border-purple-100/50 rounded-lg flex flex-col items-center">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center mb-2">2</span>
                    <h4 className="text-xs font-bold text-slate-800">Persetujuan & PO</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Disetujui PM, diterbitkan PO ke Supplier.</p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3 bg-orange-50/30 border border-orange-100/50 rounded-lg flex flex-col items-center">
                    <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center mb-2">3</span>
                    <h4 className="text-xs font-bold text-slate-800">Surat Jalan</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Muatan dikirim oleh Driver dengan Surat Jalan.</p>
                  </div>

                  {/* Step 4 */}
                  <div className="p-3 bg-emerald-50/30 border border-emerald-100/50 rounded-lg flex flex-col items-center">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-2">4</span>
                    <h4 className="text-xs font-bold text-slate-800">Verifikasi Tiba</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Material dicocokkan & diterima di lokasi.</p>
                  </div>

                </div>
              </div>

            </div>

            {/* Sidebar Columns (Right side) - Pending Actions, Urgencies */}
            <div className="space-y-6">
              
              {/* Action Required Widget */}
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Butuh Tindakan Segera
                </h3>
                
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {items.filter(i => (i.stage === 'request' && i.requestStatus === 'pending') || (i.stage === 'purchase' && i.purchase?.status === 'ready_for_delivery')).length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      Semua material aman & sudah diproses!
                    </div>
                  ) : (
                    items.filter(i => (i.stage === 'request' && i.requestStatus === 'pending') || (i.stage === 'purchase' && i.purchase?.status === 'ready_for_delivery')).map((item) => (
                      <div key={item.id} className="border border-slate-100 hover:border-slate-200 bg-slate-50/30 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-start gap-1">
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-extrabold ${
                            item.urgency === 'high' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {item.urgency.toUpperCase()}
                          </span>
                          <span className="font-mono text-[9px] text-slate-400">{item.id}</span>
                        </div>
                        
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.itemName}</h4>
                        
                        <p className="text-[10px] text-slate-500 truncate">
                          Site: <span className="font-medium text-slate-600">{item.site}</span>
                        </p>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400">
                            {item.stage === 'request' ? 'Butuh Persetujuan' : 'Siap Dikirim'}
                          </span>
                          <button
                            onClick={() => {
                              setActiveTab('kanban');
                            }}
                            className="text-[10px] text-blue-600 font-bold hover:underline"
                          >
                            Proses &rarr;
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Local Storage persistence status indicator */}
              <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Penyimpanan</span>
                    <span className="text-xs font-semibold text-slate-200">Local Browser AKTIF</span>
                  </div>
                </div>
                <button
                  onClick={handleResetData}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1 px-2 rounded border border-slate-700 transition-colors"
                >
                  Setel Ulang
                </button>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: KANBAN WORKFLOW */}
        {activeTab === 'kanban' && (
          <KanbanBoard
            items={items}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            onOpenPurchaseModal={(itemOrItems) => setPurchaseItems(Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems])}
            onOpenDeliveryModal={(itemOrItems) => setDeliveryItems(Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems])}
            onTogglePurchaseStatus={handleTogglePurchaseStatus}
            onQuickMoveToArrived={handleQuickMoveToArrived}
            onQuickMoveToReceived={handleQuickMoveToReceived}
            onOpenRequestModal={() => setIsRequestOpen(true)}
            selectedSite={selectedSite}
            onDeleteItems={handleDeleteItems}
          />
        )}

        {/* TAB 3: DELIVERY SIMULATION TRACKER */}
        {activeTab === 'simulation' && (
          <DeliverySimulation
            items={items}
            onAddTransitLog={handleAddTransitLog}
            onVerifyArrival={handleVerifyArrival}
          />
        )}

        {/* TAB 4: DATABASE TABLES */}
        {activeTab === 'table' && (
          <MaterialTable
            items={items}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            onOpenPurchaseModal={(itemOrItems) => setPurchaseItems(Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems])}
            onOpenDeliveryModal={(itemOrItems) => setDeliveryItems(Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems])}
            onDeleteItem={handleDeleteItem}
            onDeleteItems={handleDeleteItems}
            selectedSite={selectedSite}
          />
        )}

        {/* TAB 5: SITE INFORMATION DIRECTORY & ADD OWN PROJECTS MENU */}
        {activeTab === 'info' && (
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">Direktori Lokasi Proyek Site</h3>
                <p className="text-xs text-slate-500 mt-1">Daftar proyek konstruksi aktif dan site manager yang terhubung dalam sistem monitoring.</p>
              </div>
              <button
                onClick={() => setIsAddingSite(!isAddingSite)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingSite ? 'Tutup Form' : 'Tambah Proyek'}</span>
              </button>
            </div>

            {/* Expandable Form for Adding Own Project */}
            {isAddingSite && (
              <form onSubmit={handleAddSite} className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-5 space-y-4 animate-fade-in">
                <div className="border-b border-slate-200/60 pb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    Formulir Proyek Baru
                  </h4>
                </div>
                
                {siteFormError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 font-bold flex items-center gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{siteFormError}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label htmlFor="new-site-name" className="block text-xs font-medium text-slate-600 mb-1">Nama Proyek *</label>
                      <input 
                        id="new-site-name"
                        type="text" 
                        placeholder="Contoh: Series Sanur" 
                        value={newSiteName}
                        onChange={(e) => setNewSiteName(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="new-site-code" className="block text-xs font-medium text-slate-600 mb-1">Kode Proyek *</label>
                      <input 
                        id="new-site-code"
                        type="text" 
                        placeholder="Contoh: SS" 
                        value={newSiteCode}
                        onChange={(e) => setNewSiteCode(e.target.value.toUpperCase().slice(0, 6))}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold uppercase"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="new-site-loc" className="block text-xs font-medium text-slate-600 mb-1">Lokasi Proyek *</label>
                    <input 
                      id="new-site-loc"
                      type="text" 
                      placeholder="Contoh: Jakarta Selatan, DKI Jakarta" 
                      value={newSiteLocation}
                      onChange={(e) => setNewSiteLocation(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-site-manager" className="block text-xs font-medium text-slate-600 mb-1">Site Manager *</label>
                    <input 
                      id="new-site-manager"
                      type="text" 
                      placeholder="Contoh: Ir. Budi Santoso" 
                      value={newSiteManager}
                      onChange={(e) => setNewSiteManager(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setIsAddingSite(false)} 
                    className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                  >
                    Simpan Proyek
                  </button>
                </div>
              </form>
            )}

            {sites.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/40">
                <div className="p-3 bg-slate-100 rounded-full text-slate-400 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">Belum Ada Proyek Site</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Semua nama proyek bawaan telah dihapus sesuai permintaan Anda. Gunakan tombol <strong>Tambah Proyek</strong> di kanan atas untuk mendaftarkan proyek Anda sendiri, atau klik tombol muat ulang data contoh (🔄) di pojok kanan atas aplikasi.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sites.map((site) => (
                  <div key={site.id} className="border border-slate-150 rounded-lg p-5 space-y-4 hover:shadow-2xs transition-shadow relative bg-white">
                    <div className="flex justify-between items-start pr-8">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{site.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{site.id}</span>
                        </div>
                      </div>
                      <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                        AKTIF
                      </span>
                    </div>

                    {/* Delete Site button at the absolute top right */}
                    <button
                      onClick={() => handleDeleteSite(site.id, site.name)}
                      title="Hapus Proyek Ini"
                      className="absolute top-4 right-4 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3.5">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{site.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Site Manager:</span>
                        <span className="font-semibold text-slate-700">{site.manager}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Kode Proyek:</span>
                        <span className="font-mono font-bold text-blue-600">{site.code}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedSite(site.name);
                        setActiveTab('dashboard');
                      }}
                      className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors flex items-center justify-center gap-1"
                    >
                      Saring ke Site Ini
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
          &copy; 2026 LogistikSite - Sistem Monitoring & Tracker Material Konstruksi. All rights reserved.
        </div>
      </footer>

      {/* MODAL: CREATE REQUEST */}
      <RequestForm
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        onSubmit={handleAddMaterialRequest}
        sites={sites}
      />

      {/* MODAL: PROCESS PURCHASE PO */}
      <PurchaseModal
        items={purchaseItems}
        onClose={() => setPurchaseItems([])}
        onSubmit={handleBatchAddPurchaseInfo}
      />

      {/* MODAL: DISPATCH DELIVERY */}
      <DeliveryModal
        items={deliveryItems}
        onClose={() => setDeliveryItems([])}
        onSubmit={handleBatchAddDeliveryInfo}
      />

      {/* APP CONFIRMATION MODALS */}
      <ConfirmModal
        isOpen={appConfirmOpen}
        onClose={() => setAppConfirmOpen(false)}
        onConfirm={executeAppConfirm}
        title={
          appConfirmType === 'reset'
            ? 'Isi Ulang Data Contoh'
            : appConfirmType === 'clear'
            ? 'Kosongkan Semua Data'
            : 'Hapus Proyek Site'
        }
        message={
          appConfirmType === 'reset'
            ? 'Apakah Anda yakin ingin mengisi ulang dengan data simulasi bawaan? Semua proyek dan permintaan saat ini akan ditimpa.'
            : appConfirmType === 'clear'
            ? 'Apakah Anda yakin ingin menghapus semua data proyek dan permintaan material? Tindakan ini akan mengosongkan seluruh aplikasi.'
            : `Apakah Anda yakin ingin menghapus proyek "${siteToDelete?.name}"? Semua data permintaan material untuk proyek ini akan kehilangan filter site yang tepat.`
        }
        confirmText={
          appConfirmType === 'reset'
            ? 'Ya, Isi Ulang'
            : appConfirmType === 'clear'
            ? 'Ya, Kosongkan'
            : 'Ya, Hapus Proyek'
        }
        cancelText="Batal"
        type="danger"
      />

    </div>
  );
}
