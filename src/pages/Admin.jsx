
import { useOrders } from '../context/OrderContext';
import { Clock, CheckCircle, Package, Download, X, User, Ruler, FileText, CheckCircle2 } from 'lucide-react';
import { PIN_SIZES } from '../utils/constants';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Admin = () => {
    const { orders, clearOrders, updateOrderStatus, loading } = useOrders();

    // Queue: Oldest first, FILTER OUT completed orders
    const sortedOrders = [...orders]
        .filter(o => o.status !== 'completed')
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-xl font-bold text-gray-500 animate-pulse">Loading orders...</div>
            </div>
        );
    }

    const [selectedOrder, setSelectedOrder] = useState(null);

    // PNG DPI Fixer
    // Source logic adapted for client-side usage to insert pHYs chunk (300 DPI)
    const setDPI = (canvas, dpi) => {
        // Create a blob from canvas
        const dataURL = canvas.toDataURL('image/png');

        // Convert base64 to Uint8Array
        const byteString = atob(dataURL.split(',')[1]);
        const buffer = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) buffer[i] = byteString.charCodeAt(i);

        // Prepare pHYs chunk
        const ppm = Math.round(dpi / 0.0254); // pixels per meter
        const physChunk = new Uint8Array(21);
        const view = new DataView(physChunk.buffer);
        view.setUint32(0, 9); // Length
        physChunk.set([112, 72, 89, 115], 4); // "pHYs"
        view.setUint32(8, ppm); // X
        view.setUint32(12, ppm); // Y
        view.setUint8(16, 1); // Unit: meter

        // CRC Calculation (essential for valid PNG)
        const crcTable = [];
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
            crcTable[n] = c;
        }
        const crcUpdate = (c, buf, off, len) => {
            let localC = c;
            for (let i = 0; i < len; i++) localC = crcTable[(localC ^ buf[off + i]) & 0xff] ^ (localC >>> 8);
            return localC;
        };
        const crc = crcUpdate(0xffffffff, physChunk, 4, 13) ^ 0xffffffff;
        view.setUint32(17, crc);

        // Construct new buffer: Signature (8) + IHDR (25) + pHYs (21) + Rest
        // Standard Canvas PNG signature + IHDR is 33 bytes.
        // We insert after 33 bytes.
        const newBuffer = new Uint8Array(buffer.length + 21);
        newBuffer.set(buffer.slice(0, 33), 0);
        newBuffer.set(physChunk, 33);
        newBuffer.set(buffer.slice(33), 54);

        return new Blob([newBuffer], { type: 'image/png' });
    };

    const handleProcessOrder = (order) => {
        if (!order.imageData) return;

        const canvas = document.createElement('canvas');
        const sizeConfig = order.sizeDetails;
        if (!sizeConfig) {
            alert("Data ukuran tidak ditemukan untuk pesanan ini. Mohon reset data.");
            return;
        }
        const productType = order.productType === 'keychain' ? 'GANCI' : 'PIN'; // Default PIN

        // Create high-res canvas at 300 DPI for print readiness
        // Formula: pixels = (cm / 2.54) * DPI
        const DPI = 300;
        const CM_TO_INCH = 2.54;

        // precise pixel width for the outer cut line
        const width = Math.round((sizeConfig.outerDiameterCm / CM_TO_INCH) * DPI);
        const height = width;

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const img = new Image();
        img.src = order.imageData;
        img.onload = () => {
            // ... drawing logic reuse ... 
            // To save tokens, I will assume the drawing logic is constant unless I need to change it.
            // Wait, I am replacing the whole function block or just part?
            // Since I need to change the filename at the end, I need the context.
            // I'll rewrite the critical parts.

            const centerX = width / 2;
            const centerY = height / 2;
            const outerRadius = width / 2;
            const innerRadius = outerRadius * (sizeConfig.innerDiameterCm / sizeConfig.outerDiameterCm);

            // 1. Draw Bleed/Cut Line
            ctx.beginPath();
            ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
            ctx.clip();

            // 2. Draw Image with Transform
            const t = order.imageTransform || { scale: 1, x: 0, y: 0 };
            const MOCKUP_BASE_SIZE = 400;
            const ratio = width / MOCKUP_BASE_SIZE;
            const baseScale = Math.max((outerRadius * 2) / img.width, (outerRadius * 2) / img.height);
            const finalScale = baseScale * t.scale;
            const imgW = img.width * finalScale;
            const imgH = img.height * finalScale;
            const dx = centerX - imgW / 2 + (t.x * ratio);
            const dy = centerY - imgH / 2 + (t.y * ratio);

            ctx.drawImage(img, dx, dy, imgW, imgH);

            // 3. Download with improved naming
            const link = document.createElement('a');
            const sanitizedName = order.name.replace(/[^a-zA-Z0-9_-]/g, '_').toUpperCase();

            // FILENAME FORMAT: [TYPE]_[NAME]_QTY[N]_SIZE[N]CM.png
            link.download = productType + "_" + sanitizedName + "_QTY" + order.quantity + "_SIZE" + sizeConfig.outerDiameterCm + "CM.png";

            const blob = setDPI(canvas, 300);
            link.href = URL.createObjectURL(blob);
            link.click();
            setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        };
    };

    const handleMarkProcessed = (orderId) => {
        if (confirm("Pesanan akan dipindahkan ke Laporan. Lanjutkan?")) {
            updateOrderStatus(orderId, 'completed');
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(null);
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section (Unchanged) ... */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
                    <p className="text-gray-500">Kelola antrian pesanan secara real-time.</p>
                </div>
                {/* ... Buttons ... */}
                <div className="flex gap-4 items-center">
                    <Link
                        to="/report"
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <FileText size={16} />
                        Laporan
                    </Link>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
                        <div className="text-sm font-medium">
                            Total Order: {orders.length}
                        </div>
                        <div className="h-4 w-px bg-gray-300"></div>
                        <button
                            onClick={() => {
                                if (confirm('Hapus semua data pesanan?')) {
                                    clearOrders();
                                }
                            }}
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                            Reset Data
                        </button>
                    </div>
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

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Belum ada pesanan</h3>
                    <p className="text-gray-500">Pesanan baru akan muncul di sini secara otomatis.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {sortedOrders.map((order, index) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start md:items-center"
                        >
                            {/* Queue Number */}
                            <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-indigo-50 rounded-full text-indigo-700 font-bold text-xl border border-indigo-100">
                                #{index + 1}
                            </div>

                            {/* Order Image Preview */}
                            <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 relative group">
                                {order.imageData ? (
                                    <img
                                        src={order.imageData}
                                        alt="Preview"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Img</div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-grow space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-lg text-gray-900">{order.name}</h3>
                                    <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
                                        {order.phoneNumber || '-'}
                                    </span>
                                    {/* Product Type Badge */}
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${order.productType === 'keychain' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                        {order.productType === 'keychain' ? 'GANTUNGAN KUNCI' : 'PIN PENITI'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <Package size={14} />
                                        {order.sizeDetails?.label || 'Unknown Size'} ({order.quantity} pcs)
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {new Date(order.timestamp).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400">
                                    ID: {order.id.slice(0, 8)}...
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex-shrink-0 flex flex-col gap-2">
                                <button
                                    onClick={() => handleProcessOrder(order)}
                                    className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download size={16} />
                                    Download
                                </button>
                                <button
                                    onClick={() => handleMarkProcessed(order.id)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={16} />
                                    Selesai
                                </button>
                                <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="text-xs text-gray-400 hover:text-gray-600 underline mt-1 text-center"
                                >
                                    Lihat Detail
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
                            <h2 className="text-xl font-bold text-gray-900">Detail Pesanan</h2>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Header Info */}
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-2xl">
                                    {selectedOrder.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{selectedOrder.name}</h3>
                                    <p className="text-gray-500 text-sm">{selectedOrder.phoneNumber || 'No Phone'}</p>
                                    <p className="text-gray-400 text-xs mt-0.5">ID: {selectedOrder.id}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${selectedOrder.productType === 'keychain' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                            {selectedOrder.productType === 'keychain' ? 'GANTUNGAN KUNCI' : 'PIN PENITI'}
                                        </span>
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium border border-green-200">
                                            {selectedOrder.status}
                                        </span>
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium border border-gray-200">
                                            {new Date(selectedOrder.timestamp).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Specs Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase mb-1">
                                        <Package size={14} /> Ukuran
                                    </div>
                                    <p className="font-medium text-gray-900">{selectedOrder.sizeDetails?.label || '-'}</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase mb-1">
                                        <Ruler size={14} /> Diameter
                                    </div>
                                    <p className="font-medium text-gray-900">{selectedOrder.sizeDetails?.outerDiameterCm || 0} cm</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase mb-1">
                                        <Package size={14} /> Qty
                                    </div>
                                    <p className="font-medium text-gray-900">{selectedOrder.quantity} pcs</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase mb-1">
                                        <User size={14} /> Total
                                    </div>
                                    <p className="font-medium text-gray-900">
                                        Rp {(selectedOrder.quantity * (selectedOrder.sizeDetails?.price || 0)).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Image Preview */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Preview Desain</h4>
                                <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                                    {selectedOrder.imageData ? (
                                        <img
                                            src={selectedOrder.imageData}
                                            alt="Full Design"
                                            className="w-full h-auto max-h-[400px] object-contain"
                                        />
                                    ) : (
                                        <div className="p-12 text-center text-gray-400">Tidak ada gambar</div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    *Gambar ini adalah file asli yang dikompres dan disimpan.
                                </p>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex justify-end gap-3 z-10">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Tutup
                            </button>
                            <button
                                onClick={() => handleProcessOrder(selectedOrder)}
                                className="px-6 py-2.5 border border-indigo-600 text-indigo-600 font-medium rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-2"
                            >
                                <Download size={18} />
                                Download File
                            </button>
                            <button
                                onClick={() => handleMarkProcessed(selectedOrder.id)}
                                className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <CheckCircle2 size={18} />
                                Sudah Diproses
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
