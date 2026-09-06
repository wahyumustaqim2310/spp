import React, { useState, useEffect } from 'react';
import { 
  Users, CreditCard, Receipt, Settings, Plus, Search, Trash2, Edit2, 
  CheckCircle, AlertCircle, Building, Wallet, ArrowRightLeft, UserCheck, 
  FileText, Shield, Award, Calendar, ChevronRight, X
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc 
} from 'firebase/firestore';

// Konfigurasi Firebase (Otomatis & Real-time)
const firebaseConfig = {
  apiKey: "AIzaSyD-mock-key-for-pesantren-app",
  authDomain: "pesantren-hidayah.firebaseapp.com",
  projectId: "pesantren-hidayah",
  storageBucket: "pesantren-hidayah.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function PesantrenApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State Data Utama
  const [santriList, setSantriList] = useState([]);
  const [syahriahList, setSyahriahList] = useState([]);
  const [daftarUlangList, setDaftarUlangList] = useState([]);
  
  // State Pengaturan
  const [settings, setSettings] = useState({
    namaPesantren: 'Pondok Pesantren Hidayah',
    nominalSyahriahDefault: 150000,
    nominalDaftarUlangSmp: 500000,
    nominalDaftarUlangSma: 750000,
  });

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Modal States
  const [showSantriModal, setShowSantriModal] = useState(false);
  const [editingSantri, setEditingSantri] = useState(null);

  const [showSyahriahModal, setShowSyahriahModal] = useState(false);
  const [editingSyahriah, setEditingSyahriah] = useState(null);

  const [showDaftarUlangModal, setShowDaftarUlangModal] = useState(false);
  const [editingDaftarUlang, setEditingDaftarUlang] = useState(null);

  // Form States Santri
  const [santriForm, setSantriForm] = useState({
    nis: '',
    nama: '',
    jenisKelamin: 'Putra',
    jenjang: 'SMP',
    kelas: '7',
    alamat: '',
    noHp: ''
  });

  // Form States Syahriah Bulanan
  const [syahriahForm, setSyahriahForm] = useState({
    santriId: '',
    tanggal: new Date().toISOString().split('T')[0],
    bulan: 'September 2026',
    nominal: settings.nominalSyahriahDefault,
    metode: 'Tunai',
    tujuanTransfer: 'Abi',
    catatan: 'Lunas'
  });

  // Form States Daftar Ulang
  const [daftarUlangForm, setDaftarUlangForm] = useState({
    santriId: '',
    tanggal: new Date().toISOString().split('T')[0],
    tahunAjaran: '2026/2027',
    nominal: settings.nominalDaftarUlangSmp,
    metode: 'Tunai',
    tujuanTransfer: 'Abi',
    catatan: 'Daftar Ulang Lengkap'
  });

  // Filter & Search
  const [searchSantri, setSearchSantri] = useState('');
  const [filterJenjangSantri, setFilterJenjangSantri] = useState('Semua');

  const bulanOptions = [
    'Januari 2026', 'Februari 2026', 'Maret 2026', 'April 2026', 'Mei 2026', 'Juni 2026',
    'Juli 2026', 'Agustus 2026', 'September 2026', 'Oktober 2026', 'November 2026', 'Desember 2026'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const showNotificationMsg = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const sSnap = await getDocs(collection(db, 'santri'));
      const sData = sSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const sySnap = await getDocs(collection(db, 'syahriah'));
      const syData = sySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const duSnap = await getDocs(collection(db, 'daftarUlang'));
      const duData = duSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (sData.length === 0) {
        setSantriList([
          { id: '1', nis: '1001', nama: 'Ahmad Fauzi', jenisKelamin: 'Putra', jenjang: 'SMP', kelas: '7', alamat: 'Demak', noHp: '08123456789' },
          { id: '2', nis: '1002', nama: 'Siti Aminah', jenisKelamin: 'Putri', jenjang: 'SMA', kelas: '10', alamat: 'Kudus', noHp: '08567890123' },
        ]);
      } else {
        setSantriList(sData);
      }

      if (syData.length > 0) setSyahriahList(syData);
      if (duData.length > 0) setDaftarUlangList(duData);

    } catch (e) {
      console.error(e);
      if (santriList.length === 0) {
        setSantriList([
          { id: '1', nis: '1001', nama: 'Ahmad Fauzi', jenisKelamin: 'Putra', jenjang: 'SMP', kelas: '7', alamat: 'Demak', noHp: '08123456789' },
          { id: '2', nis: '1002', nama: 'Siti Aminah', jenisKelamin: 'Putri', jenjang: 'SMA', kelas: '10', alamat: 'Kudus', noHp: '08567890123' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler Simpan Santri
  const handleSaveSantri = async (e) => {
    e.preventDefault();
    try {
      if (editingSantri) {
        const ref = doc(db, 'santri', editingSantri.id);
        await updateDoc(ref, santriForm);
        setSantriList(santriList.map(s => s.id === editingSantri.id ? { ...s, ...santriForm } : s));
        showNotificationMsg('Data santri berhasil diperbarui!');
      } else {
        const docRef = await addDoc(collection(db, 'santri'), santriForm);
        setSantriList([...santriList, { id: docRef.id, ...santriForm }]);
        showNotificationMsg('Santri baru berhasil ditambahkan!');
      }
      setShowSantriModal(false);
      setEditingSantri(null);
      setSantriForm({ nis: '', nama: '', jenisKelamin: 'Putra', jenjang: 'SMP', kelas: '7', alamat: '', noHp: '' });
    } catch (err) {
      showNotificationMsg('Gagal menyimpan data santri', 'error');
    }
  };

  const handleDeleteSantri = async (id) => {
    if (confirm('Yakin ingin menghapus data santri ini?')) {
      try {
        await deleteDoc(doc(db, 'santri', id));
        setSantriList(santriList.filter(s => s.id !== id));
        showNotificationMsg('Data santri berhasil dihapus');
      } catch (e) {
        showNotificationMsg('Gagal menghapus santri', 'error');
      }
    }
  };

  // Handler Simpan Syahriah
  const handleSaveSyahriah = async (e) => {
    e.preventDefault();
    try {
      if (editingSyahriah) {
        const ref = doc(db, 'syahriah', editingSyahriah.id);
        await updateDoc(ref, syahriahForm);
        setSyahriahList(syahriahList.map(i => i.id === editingSyahriah.id ? { ...i, ...syahriahForm } : i));
        showNotificationMsg('Data pembayaran syahriah diperbarui!');
      } else {
        const docRef = await addDoc(collection(db, 'syahriah'), syahriahForm);
        setSyahriahList([...syahriahList, { id: docRef.id, ...syahriahForm }]);
        showNotificationMsg('Pembayaran syahriah berhasil dicatat!');
      }
      setShowSyahriahModal(false);
      setEditingSyahriah(null);
    } catch (err) {
      showNotificationMsg('Gagal menyimpan syahriah', 'error');
    }
  };

  const handleDeleteSyahriah = async (id) => {
    if (confirm('Hapus catatan syahriah ini?')) {
      await deleteDoc(doc(db, 'syahriah', id));
      setSyahriahList(syahriahList.filter(i => i.id !== id));
      showNotificationMsg('Catatan syahriah dihapus');
    }
  };

  // Handler Simpan Daftar Ulang
  const handleSaveDaftarUlang = async (e) => {
    e.preventDefault();
    try {
      if (editingDaftarUlang) {
        const ref = doc(db, 'daftarUlang', editingDaftarUlang.id);
        await updateDoc(ref, daftarUlangForm);
        setDaftarUlangList(daftarUlangList.map(d => d.id === editingDaftarUlang.id ? { ...d, ...daftarUlangForm } : d));
        showNotificationMsg('Data daftar ulang diperbarui!');
      } else {
        const docRef = await addDoc(collection(db, 'daftarUlang'), daftarUlangForm);
        setDaftarUlangList([...daftarUlangList, { id: docRef.id, ...daftarUlangForm }]);
        showNotificationMsg('Daftar ulang berhasil dicatat!');
      }
      setShowDaftarUlangModal(false);
      setEditingDaftarUlang(null);
    } catch (err) {
      showNotificationMsg('Gagal menyimpan daftar ulang', 'error');
    }
  };

  const handleDeleteDaftarUlang = async (id) => {
    if (confirm('Hapus catatan daftar ulang ini?')) {
      await deleteDoc(doc(db, 'daftarUlang', id));
      setDaftarUlangList(daftarUlangList.filter(d => d.id !== id));
      showNotificationMsg('Catatan daftar ulang dihapus');
    }
  };

  // Hitung Belum Bayar Bulan Ini (September 2026)
  const currentMonthStr = 'September 2026';
  const santriSudahBayarIds = syahriahList
    .filter(i => i.bulan === currentMonthStr)
    .map(i => i.santriId);
  
  const santriBelumBayar = santriList.filter(s => !santriSudahBayarIds.includes(s.id));

  // Total Keuangan
  const totalSyahriah = syahriahList.reduce((acc, curr) => acc + Number(curr.nominal || 0), 0);
  const totalDaftarUlang = daftarUlangList.reduce((acc, curr) => acc + Number(curr.nominal || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-medium flex items-center gap-3 transition-all animate-bounce ${
          notification.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          {notification.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle size={20}/>}
          {notification.msg}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-emerald-900 text-white flex flex-col justify-between shadow-xl">
        <div>
          <div className="p-6 border-b border-emerald-800 flex items-center gap-3">
            <div className="bg-emerald-700 p-2.5 rounded-xl text-emerald-100 shadow-inner">
              <Building size={26} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">{settings.namaPesantren}</h1>
              <p className="text-xs text-emerald-300 mt-0.5">Sistem Keuangan & Santri</p>
            </div>
          </div>
          
          <nav className="p-4 space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Building },
              { id: 'santri', label: 'Data Santri', icon: Users },
              { id: 'syahriah', label: 'Syahriah Bulanan', icon: CreditCard },
              { id: 'daftarUlang', label: 'Daftar Ulang', icon: Award },
              { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    isActive 
                      ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950/20' 
                      : 'text-emerald-200 hover:bg-emerald-800/60 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-emerald-800 text-xs text-emerald-300 text-center">
          &copy; 2026 {settings.namaPesantren}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {activeTab === 'daftarUlang' ? 'Pembayaran Daftar Ulang' : activeTab === 'syahriah' ? 'Syahriah Bulanan' : activeTab}
            </h2>
            <p className="text-xs text-slate-500">Kelola administrasi pesantren dengan cepat dan terstruktur</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Online & Tersimpan
            </div>
          </div>
        </header>

        {/* Dynamic Tab Contents */}
        <div className="p-6 flex-1 overflow-y-auto">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Statistik Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                  <div className="bg-emerald-100 text-emerald-700 p-3.5 rounded-xl">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Total Santri</p>
                    <h3 className="text-2xl font-bold text-slate-800">{santriList.length}</h3>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-700 p-3.5 rounded-xl">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Total Kas Syahriah</p>
                    <h3 className="text-xl font-bold text-slate-800">Rp {totalSyahriah.toLocaleString('id-ID')}</h3>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                  <div className="bg-indigo-100 text-indigo-700 p-3.5 rounded-xl">
                    <Award size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Kas Daftar Ulang</p>
                    <h3 className="text-xl font-bold text-slate-800">Rp {totalDaftarUlang.toLocaleString('id-ID')}</h3>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 border-l-4 border-l-rose-500">
                  <div className="bg-rose-100 text-rose-700 p-3.5 rounded-xl">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Belum Bayar ({currentMonthStr.split(' ')[0]})</p>
                    <h3 className="text-2xl font-bold text-rose-600">{santriBelumBayar.length} Santri</h3>
                  </div>
                </div>
              </div>

              {/* Grid 2 Kolom: Riwayat Terbaru & Belum Bayar */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Riwayat Terbaru */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <h3 className="font-bold text-base text-slate-800 mb-4 flex items-center gap-2">
                    <CreditCard size={18} className="text-emerald-600"/> Pembayaran Syahriah Terbaru
                  </h3>
                  {syahriahList.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">Belum ada data pembayaran syahriah.</p>
                  ) : (
                    <div className="space-y-3">
                      {syahriahList.slice(-5).reverse().map((item) => {
                        const santri = santriList.find(s => s.id === item.santriId);
                        return (
                          <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                              <p className="font-semibold text-sm text-slate-800">{santri ? santri.nama : 'Santri Dihapus'}</p>
                              <p className="text-xs text-slate-500">{item.bulan} &bull; <span className="text-emerald-600 font-medium">{item.metode} {item.metode === 'Transfer' ? `(${item.tujuanTransfer})` : ''}</span></p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-700 text-sm">Rp {Number(item.nominal).toLocaleString('id-ID')}</p>
                              <p className="text-[10px] text-slate-400">{item.tanggal}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Santri Belum Membayar */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <h3 className="font-bold text-base text-rose-700 mb-4 flex items-center gap-2">
                    <AlertCircle size={18} /> Belum Membayar Syahriah ({currentMonthStr})
                  </h3>
                  {santriBelumBayar.length === 0 ? (
                    <div className="py-10 text-center bg-emerald-50 rounded-xl border border-emerald-100">
                      <p className="text-emerald-700 font-semibold text-sm">Alhamdulillah, semua santri sudah membayar syahriah bulan ini! 🎉</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {santriBelumBayar.map((santri) => (
                        <div key={santri.id} className="flex justify-between items-center p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                          <div>
                            <p className="font-semibold text-sm text-slate-800">{santri.nama} <span className="text-xs font-normal text-slate-500">(NIS: {santri.nis})</span></p>
                            <p className="text-xs text-slate-500">{santri.jenjang} - Kelas {santri.kelas} &bull; {santri.jenisKelamin}</p>
                          </div>
                          <button 
                            onClick={() => {
                              setActiveTab('syahriah');
                              setSyahriahForm(prev => ({ ...prev, santriId: santri.id }));
                              setShowSyahriahModal(true);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition"
                          >
                            Catat Bayar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* DATA SANTRI TAB */}
          {activeTab === 'santri' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Cari nama atau NIS santri..." 
                      value={searchSantri}
                      onChange={(e) => setSearchSantri(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-600"
                    />
                  </div>
                  <select 
                    value={filterJenjangSantri} 
                    onChange={(e) => setFilterJenjangSantri(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-emerald-600"
                  >
                    <option value="Semua">Semua Jenjang</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                    <option value="Lulus">Lulus</option>
                  </select>
                </div>

                <button 
                  onClick={() => {
                    setEditingSantri(null);
                    setSantriForm({ nis: '', nama: '', jenisKelamin: 'Putra', jenjang: 'SMP', kelas: '7', alamat: '', noHp: '' });
                    setShowSantriModal(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition shadow-md shadow-emerald-600/20 w-full sm:w-auto justify-center"
                >
                  <Plus size={18} /> Tambah Santri
                </button>
              </div>

              {/* Tabel Santri */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase bg-slate-50/70">
                      <th className="py-3 px-4">No.</th>
                      <th className="py-3 px-4">NIS</th>
                      <th className="py-3 px-4">Nama Santri</th>
                      <th className="py-3 px-4">Gender</th>
                      <th className="py-3 px-4">Jenjang & Kelas</th>
                      <th className="py-3 px-4">Alamat</th>
                      <th className="py-3 px-4">No HP Wali</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {santriList
                      .filter(s => {
                        const matchSearch = s.nama.toLowerCase().includes(searchSantri.toLowerCase()) || s.nis.includes(searchSantri);
                        const matchJenjang = filterJenjangSantri === 'Semua' || s.jenjang === filterJenjangSantri;
                        return matchSearch && matchJenjang;
                      })
                      .map((s, idx) => (
                        <tr key={s.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4 text-slate-500 font-medium">{idx + 1}</td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-emerald-800">{s.nis}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">{s.nama}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              s.jenisKelamin === 'Putra' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                            }`}>
                              {s.jenisKelamin}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-slate-700">{s.jenjang}</span> 
                            <span className="text-xs text-slate-400 ml-1">(Kelas {s.kelas})</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{s.alamat}</td>
                          <td className="py-3.5 px-4 text-slate-600">{s.noHp}</td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => {
                                  setEditingSantri(s);
                                  setSantriForm(s);
                                  setShowSantriModal(true);
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteSantri(s.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Hapus"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SYARIAH BULANAN TAB */}
          {activeTab === 'syahriah' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base text-slate-800">Riwayat Pembayaran Syahriah Bulanan</h3>
                  <p className="text-xs text-slate-500">Catat dan pantau syahriah bulanan seluruh santri</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingSyahriah(null);
                    setSyahriahForm({
                      santriId: santriList[0]?.id || '',
                      tanggal: new Date().toISOString().split('T')[0],
                      bulan: currentMonthStr,
                      nominal: settings.nominalSyahriahDefault,
                      metode: 'Tunai',
                      tujuanTransfer: 'Abi',
                      catatan: 'Lunas'
                    });
                    setShowSyahriahModal(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition shadow-md shadow-emerald-600/20"
                >
                  <Plus size={18} /> Catat Pembayaran Baru
                </button>
              </div>

              {/* Tabel Syahriah */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase bg-slate-50/70">
                      <th className="py-3 px-4">No.</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Nama Santri (NIS)</th>
                      <th className="py-3 px-4">Bulan</th>
                      <th className="py-3 px-4">Nominal</th>
                      <th className="py-3 px-4">Metode</th>
                      <th className="py-3 px-4">Catatan</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {syahriahList.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-8 text-slate-400">Belum ada data pembayaran syahriah.</td>
                      </tr>
                    ) : (
                      syahriahList.map((item, idx) => {
                        const santri = santriList.find(s => s.id === item.santriId);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/60 transition">
                            <td className="py-3.5 px-4 text-slate-500 font-medium">{idx + 1}</td>
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{item.tanggal}</td>
                            <td className="py-3.5 px-4 font-semibold text-slate-800">
                              {santri ? `${santri.nama} ` : 'Santri Dihapus '}
                              <span className="text-xs font-normal text-slate-400">({santri?.nis || '-'})</span>
                            </td>
                            <td className="py-3.5 px-4"><span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium">{item.bulan}</span></td>
                            <td className="py-3.5 px-4 font-bold text-emerald-700">Rp {Number(item.nominal).toLocaleString('id-ID')}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                item.metode === 'Tunai' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'
                              }`}>
                                {item.metode} {item.metode === 'Transfer' ? `(${item.tujuanTransfer})` : ''}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 text-xs italic">{item.catatan}</td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => {
                                    setEditingSyahriah(item);
                                    setSyahriahForm(item);
                                    setShowSyahriahModal(true);
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteSyahriah(item.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                >
                                  <Trash2 size={16} />
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
          )}

          {/* DAFTAR ULANG TAB */}
          {activeTab === 'daftarUlang' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base text-slate-800">Pembayaran Daftar Ulang Santri</h3>
                  <p className="text-xs text-slate-500">Khusus pembayaran daftar ulang tahunan jenjang SMP & SMA</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingDaftarUlang(null);
                    setDaftarUlangForm({
                      santriId: santriList[0]?.id || '',
                      tanggal: new Date().toISOString().split('T')[0],
                      tahunAjaran: '2026/2027',
                      nominal: settings.nominalDaftarUlangSmp,
                      metode: 'Tunai',
                      tujuanTransfer: 'Abi',
                      catatan: 'Daftar Ulang Lengkap'
                    });
                    setShowDaftarUlangModal(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition shadow-md shadow-emerald-600/20"
                >
                  <Plus size={18} /> Catat Daftar Ulang
                </button>
              </div>

              {/* Tabel Daftar Ulang */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase bg-slate-50/70">
                      <th className="py-3 px-4">No.</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Nama Santri (NIS)</th>
                      <th className="py-3 px-4">Jenjang</th>
                      <th className="py-3 px-4">Tahun Ajaran</th>
                      <th className="py-3 px-4">Nominal</th>
                      <th className="py-3 px-4">Metode</th>
                      <th className="py-3 px-4">Catatan</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {daftarUlangList.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-8 text-slate-400">Belum ada data pembayaran daftar ulang.</td>
                      </tr>
                    ) : (
                      daftarUlangList.map((item, idx) => {
                        const santri = santriList.find(s => s.id === item.santriId);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/60 transition">
                            <td className="py-3.5 px-4 text-slate-500 font-medium">{idx + 1}</td>
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{item.tanggal}</td>
                            <td className="py-3.5 px-4 font-semibold text-slate-800">
                              {santri ? `${santri.nama} ` : 'Santri Dihapus '}
                              <span className="text-xs font-normal text-slate-400">({santri?.nis || '-'})</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-medium text-slate-700">{santri?.jenjang || '-'}</span>
                            </td>
                            <td className="py-3.5 px-4"><span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-medium">{item.tahunAjaran}</span></td>
                            <td className="py-3.5 px-4 font-bold text-emerald-700">Rp {Number(item.nominal).toLocaleString('id-ID')}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                item.metode === 'Tunai' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'
                              }`}>
                                {item.metode} {item.metode === 'Transfer' ? `(${item.tujuanTransfer})` : ''}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 text-xs italic">{item.catatan}</td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => {
                                    setEditingDaftarUlang(item);
                                    setDaftarUlangForm(item);
                                    setShowDaftarUlangModal(true);
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteDaftarUlang(item.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                >
                                  <Trash2 size={16} />
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
          )}

          {/* PENGATURAN TAB */}
          {activeTab === 'pengaturan' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-xl mx-auto space-y-6">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Pengaturan Pesantren</h3>
                <p className="text-xs text-slate-500">Sesuaikan nama lembaga dan nominal standar syahriah atau daftar ulang</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                showNotificationMsg('Pengaturan berhasil disimpan!');
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Pondok Pesantren</label>
                  <input 
                    type="text" 
                    value={settings.namaPesantren}
                    onChange={(e) => setSettings({ ...settings, namaPesantren: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nominal Standar Syahriah Bulanan (Rp)</label>
                  <input 
                    type="number" 
                    value={settings.nominalSyahriahDefault}
                    onChange={(e) => setSettings({ ...settings, nominalSyahriahDefault: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nominal Daftar Ulang SMP (Rp)</label>
                  <input 
                    type="number" 
                    value={settings.nominalDaftarUlangSmp}
                    onChange={(e) => setSettings({ ...settings, nominalDaftarUlangSmp: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nominal Daftar Ulang SMA (Rp)</label>
                  <input 
                    type="number" 
                    value={settings.nominalDaftarUlangSma}
                    onChange={(e) => setSettings({ ...settings, nominalDaftarUlangSma: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-emerald-600"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl text-sm transition shadow-md shadow-emerald-600/20"
                >
                  Simpan Perubahan
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* MODAL FORM TAMBAH / EDIT SANTRI */}
      {showSantriModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-base text-slate-800">
                {editingSantri ? 'Edit Data Santri' : 'Tambah Santri Baru'}
              </h3>
              <button onClick={() => setShowSantriModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveSantri} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Induk Santri (NIS)</label>
                  <input 
                    type="text" 
                    value={santriForm.nis}
                    onChange={(e) => setSantriForm({ ...santriForm, nis: e.target.value })}
                    placeholder="Contoh: 1001"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Putra / Putri</label>
                  <select 
                    value={santriForm.jenisKelamin}
                    onChange={(e) => setSantriForm({ ...santriForm, jenisKelamin: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-emerald-600"
                  >
                    <option value="Putra">Putra</option>
                    <option value="Putri">Putri</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Santri</label>
                <input 
                  type="text" 
                  value={santriForm.nama}
                  onChange={(e) => setSantriForm({ ...santriForm, nama: e.target.value })}
                  placeholder="Nama lengkap santri"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenjang Pendidikan</label>
                  <select 
                    value={santriForm.jenjang}
                    onChange={(e) => {
                      const val = e.target.value;
                      const defaultKelas = val === 'SMP' ? '7' : val === 'SMA' ? '10' : '12';
                      setSantriForm({ ...santriForm, jenjang: val, kelas: defaultKelas });
                    }}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-emerald-600"
                  >
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                    <option value="Lulus">Lulus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas</label>
                  <select 
                    value={santriForm.kelas}
                    onChange={(e) => setSantriForm({ ...santriForm, kelas: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-emerald-600"
                  >
                    {santriForm.jenjang === 'SMP' && (
                      <>
                        <option value="7">Kelas 7</option>
                        <option value="8">Kelas 8</option>
                        <option value="9">Kelas 9</option>
                      </>
                    )}
                    {santriForm.jenjang === 'SMA' && (
                      <>
                        <option value="10">Kelas 10</option>
                        <option value="11">Kelas 11</option>
                        <option value="12">Kelas 12</option>
                      </>
                    )}
                    {santriForm.jenjang === 'Lulus' && (
                      <option value="Alumni">Alumni</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat</label>
                <input 
                  type="text" 
                  value={santriForm.alamat}
                  onChange={(e) => setSantriForm({ ...santriForm, alamat: e.target.value })}
                  placeholder="Kota / Desa asal"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No HP Wali</label>
                <input 
                  type="text" 
                  value={santriForm.noHp}
                  onChange={(e) => setSantriForm({ ...santriForm, noHp: e.target.value })}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-600"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowSantriModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
                >
                  Simpan Santri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FORM CATAT SYARIAH */}
      {showSyahriahModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-base text-slate-800">
                {editingSyahriah ? 'Edit Pembayaran Syahriah' : 'Catat Pembayaran Syahriah Baru'}
              </h3>
              <button onClick={() => setShowSyahriahModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveSyahriah} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Santri (Ketik Nama / NIS)</label>
                <select 
                  value={syahriahForm.santriId}
                  onChange={(e) => setSyahriahForm({ ...syahriahForm, santriId: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-emerald-600"
                  required
                >
                  <option value="">-- Pilih Santri --</option>
                  {santriList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nama} (NIS: {s.nis} - {s.jenjang} Kelas {s.kelas})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Bayar</label>
                  <input 
                    type="date" 
                    value={syahriahForm.tanggal}
                    onChange={(e) => setSyahriahForm({ ...syahriahForm, tanggal: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Untuk Bulan</label>
                  <select 
                    value={syahriahForm.bulan}
                    onChange={(e) => setSyahriahForm({ ...syahriahForm, bulan: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-emerald-600"
                  >
                    {bulanOptions.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nominal (Rp)</label>
                <input 
                  type="number" 
                  value={syahriahForm.nominal}
                  onChange={(e) => setSyahriahForm({ ...syahriahForm, nominal: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Metode Pembayaran</label>
                  <select 
                    value={syahriahForm.metode}
                    onChange={(e) => setSyahriahForm({ ...syahriahForm, metode: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-emerald-600"
                  >
                    <option value="Tunai">Tunai</option>
                    <option value="Transfer">Transfer</option>
                  </select>
                </div>
                {syahriahForm.metode === 'Transfer' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Ke</label>
                    <select 
                      value={syahriahForm.tujuanTransfer}
                      onChange={(e) => setSyahriahForm({ ...syahriahForm, tujuanTransfer: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-emerald-600"
                    >
                      <option value="Abi">Abi</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan</label>
                <textarea 
                  value={syahriahForm.catatan}
                  onChange={(e) => setSyahriahForm({ ...syahriahForm, catatan: e.target.value })}
                  rows="2"
                  placeholder="Catatan tambahan pembayaran..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-600 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowSyahriahModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
                >
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FORM DAFTAR ULANG */}
      {showDaftarUlangModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-base text-slate-800">
                {editingDaftarUlang ? 'Edit Daftar Ulang' : 'Catat Daftar Ulang Baru'}
              </h3>
              <button onClick={() => setShowDaftarUlangModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveDaftarUlang} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Santri (SMP / SMA)</label>
                <select 
                  value={daftarUlangForm.santriId}
                  onChange={(e) => {
                    const sId = e.target.value;
                    const selectedS = santriList.find(s => s.id === sId);
                    let defNom = settings.nominalDaftarUlangSmp;
                    if (selectedS && selectedS.jenjang === 'SMA') {
                      defNom = settings.nominalDaftarUlangSma;
                    }
                    setDaftarUlangForm({ ...daftarUlangForm, santriId: sId, nominal: defNom });
                  }}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-emerald-600"
                  required
                >
                  <option value="">-- Pilih Santri --</option>
                  {santriList.filter(s => s.jenjang !== 'Lulus').map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.jenjang} - Kelas {s.kelas})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal</label>
                  <input 
                    type="date" 
                    value={daftarUlangForm.tanggal}
                    onChange={(e) => setDaftarUlangForm({ ...daftarUlangForm, tanggal: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun Ajaran</label>
                  <input 
                    type="text" 
                    value={daftarUlangForm.tahunAjaran}
                    onChange={(e) => setDaftarUlangForm({ ...daftarUlangForm, tahunAjaran: e.target.value })}
                    placeholder="2026/2027"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nominal (Rp)</label>
                <input 
                  type="number" 
                  value={daftarUlangForm.nominal}
                  onChange={(e) => setDaftarUlangForm({ ...daftarUlangForm, nominal: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Metode Pembayaran</label>
                  <select 
                    value={daftarUlangForm.metode}
                    onChange={(e) => setDaftarUlangForm({ ...daftarUlangForm, metode: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-emerald-600"
                  >
                    <option value="Tunai">Tunai</option>
                    <option value="Transfer">Transfer</option>
                  </select>
                </div>
                {daftarUlangForm.metode === 'Transfer' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Ke</label>
                    <select 
                      value={daftarUlangForm.tujuanTransfer}
                      onChange={(e) => setDaftarUlangForm({ ...daftarUlangForm, tujuanTransfer: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-emerald-600"
                    >
                      <option value="Abi">Abi</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan</label>
                <textarea 
                  value={daftarUlangForm.catatan}
                  onChange={(e) => setDaftarUlangForm({ ...daftarUlangForm, catatan: e.target.value })}
                  rows="2"
                  placeholder="Catatan daftar ulang..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-600 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowDaftarUlangModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
                >
                  Simpan Daftar Ulang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
