import { useOrders } from '../context/OrderContext';
import { ArrowLeft, FileSpreadsheet, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';

const Report = () => {
    const { orders, clearOrders } = useOrders();

    // Filter only completed orders
    const completedOrders = orders.filter(o => o.status === 'completed')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Newest first

    const totalRevenue = completedOrders.reduce((acc, curr) => acc + (curr.quantity * curr.sizeDetails.price), 0);

    const handleExportExcel = () => {
        // Map data to easy-to-read object format
        // Keys will be the Header Names in Excel
        const data = completedOrders.map(order => {
            const date = new Date(order.timestamp).toLocaleString('id-ID');
            const sanitizedName = order.name.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
            const fileName = "ORDER_" + sanitizedName + "_QTY" + order.quantity + ".png";

            return {
                "ID Pesanan": order.id,
                "Tanggal Order": date,
                "Nama Pemesan": order.name,
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
            { wch: 20 }, // Name
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

    return (
        <div className="space-y-8 animate-fade-in p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                        <ArrowLeft size={24} />
                    </Link>
                    <button
                        onClick={() => {
                            if (confirm('Yakin ingin keluar?')) {
                                localStorage.removeItem('admin_auth');
                                window.location.reload();
                            }
                        }}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                        Logout
                    </button>
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
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Tanggal</th>
                                <th className="px-6 py-4 font-semibold">Nama</th>
                                <th className="px-6 py-4 font-semibold">Detail Ukuran</th>
                                <th className="px-6 py-4 font-semibold text-center">Qty</th>
                                <th className="px-6 py-4 font-semibold text-right">Harga Total</th>
                                <th className="px-6 py-4 font-semibold">Nama File</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {completedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
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
                                            {order.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {order.sizeDetails.label} ({order.sizeDetails.outerDiameterCm} cm)
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-900">
                                            {order.quantity}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            Rp {(order.quantity * order.sizeDetails.price).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs w-48 truncate max-w-xs">
                                            {"ORDER_" + order.name.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase() + "_QTY" + order.quantity + "..."}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Report;
