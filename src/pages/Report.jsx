import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ArrowLeft, FileSpreadsheet, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';

const Report = () => {
    const [completedOrders, setCompletedOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch completed orders directly (not from context)
    useEffect(() => {
        const fetchCompletedOrders = async () => {
            try {
                // Optimized: Don't fetch imageData (not needed in report table)
                // This reduces data transfer by 80-90%!
                const { data, error } = await supabase
                    .from('orders')
                    .select('id, created_at, name, phone_number, product_type, size, quantity, size_details, status')
                    .eq('status', 'completed')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const formattedData = (data || []).map(item => ({
                    id: item.id,
                    timestamp: item.created_at,
                    name: item.name,
                    phoneNumber: item.phone_number,
                    productType: item.product_type,
                    size: item.size,
                    quantity: item.quantity,
                    sizeDetails: item.size_details,
                    status: item.status
                    // imageData excluded for performance
                }));

                setCompletedOrders(formattedData);
            } catch (error) {
                console.error('Error fetching completed orders:', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCompletedOrders();
    }, []);

    const totalRevenue = completedOrders.reduce((acc, curr) => acc + (curr.quantity * curr.sizeDetails.price), 0);

    const handleExportExcel = () => {
        // Map data to easy-to-read object format
        // Keys will be the Header Names in Excel
        const data = completedOrders.map(order => {
            const date = new Date(order.timestamp).toLocaleString('id-ID');
            const sanitizedName = order.name.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
            const productType = order.productType === 'keychain' ? 'GANCI' : 'PIN';
            const fileName = productType + "_ORDER_" + sanitizedName + "_QTY" + order.quantity + ".png";

            return {
                "ID Pesanan": order.id,
                "Tanggal Order": date,
                "Jenis Produk": order.productType === 'keychain' ? 'Gantungan Kunci' : 'Pin Peniti',
                "Jenis Produk": order.productType === 'keychain' ? 'Gantungan Kunci' : 'Pin Peniti',
                "Nama Pemesan": order.name,
                "No. Handphone": order.phoneNumber || '-',
                "Ukuran Pin": order.sizeDetails.label,
                "Diameter (cm)": order.sizeDetails.outerDiameterCm,
                "Jumlah (Qty)": order.quantity,
                "Harga Satuan (Rp)": order.sizeDetails.price,
                "Total Harga (Rp)": order.quantity * order.sizeDetails.price,
                "Nama File Gambar": fileName
            };
        });

        // Create Worksheet
        const ws = XLSX.utils.json_to_sheet(data);

        // Adjust Column Widths (Optional but good)
        const wscols = [
            { wch: 10 }, // ID (short)
            { wch: 20 }, // Date
            { wch: 15 }, // Jenis Produk
            { wch: 15 }, // Jenis Produk
            { wch: 20 }, // Name
            { wch: 15 }, // Phone
            { wch: 15 }, // Size Label
            { wch: 12 }, // Diameter
            { wch: 10 }, // Qty
            { wch: 15 }, // Price
            { wch: 15 }, // Total
            { wch: 40 }  // File Name (Long)
        ];
        ws['!cols'] = wscols;

        // Create Workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Laporan Penjualan");

        // Write File
        const dateStr = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, "REPORT_ORDER_PIN_" + dateStr + ".xlsx");
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-64"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
                            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Laporan Penjualan</h1>
                        <p className="text-gray-500">Rekap data pesanan yang sudah diproses.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleExportExcel}
                        className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                        disabled={completedOrders.length === 0}
                    >
                        <FileSpreadsheet size={18} />
                        Export Excel (.xlsx)
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Yakin ingin keluar?')) {
                                localStorage.removeItem('admin_auth');
                                window.location.reload();
                            }
                        }}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                        Keluar
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Pesanan Selesai</p>
                    <p className="text-3xl font-bold text-gray-900">{completedOrders.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Item Terjual</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {completedOrders.reduce((acc, curr) => acc + curr.quantity, 0)} pcs
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 bg-green-50/30">
                    <p className="text-sm font-medium text-green-700 mb-1">Total Pendapatan</p>
                    <p className="text-3xl font-bold text-green-700">
                        Rp {totalRevenue.toLocaleString()}
                    </p>
                </div>
            </div >

            {/* Table */}
            < div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" >
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Tanggal</th>
                                <th className="px-6 py-4 font-semibold">Jenis</th>
                                <th className="px-6 py-4 font-semibold">Nama</th>
                                <th className="px-6 py-4 font-semibold">No. HP</th>
                                <th className="px-6 py-4 font-semibold">Detail Ukuran</th>
                                <th className="px-6 py-4 font-semibold text-center">Qty</th>
                                <th className="px-6 py-4 font-semibold text-right">Harga Total</th>
                                <th className="px-6 py-4 font-semibold">Nama File</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {completedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                                        Belum ada data laporan.
                                    </td>
                                </tr>
                            ) : (
                                completedOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {new Date(order.timestamp).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${order.productType === 'keychain' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                                {order.productType === 'keychain' ? 'Ganci' : 'Pin'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {order.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.phoneNumber ? (
                                                <a
                                                    href={`https://wa.me/${order.phoneNumber.replace(/^0/, '62').replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-600 hover:text-green-700 font-medium hover:underline flex items-center gap-1"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                    </svg>
                                                    {order.phoneNumber}
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {order.sizeDetails?.label || '-'} ({order.sizeDetails?.outerDiameterCm || '?'} cm)
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-900">
                                            {order.quantity}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            Rp {(order.quantity * (order.sizeDetails?.price || 0)).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs w-48 truncate max-w-xs">
                                            {/* Replicate logic for display name since keys are confusing here */}
                                            {(order.productType === 'keychain' ? 'GANCI' : 'PIN') + "_ORDER_..."}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div >
        </div >
    );
};

export default Report;
