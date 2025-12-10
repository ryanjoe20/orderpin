import { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { PIN_SIZES } from '../utils/constants';
import PinMockup from '../components/PinMockup';
import { Upload, ShoppingCart, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PromoCarousel from '../components/PromoCarousel';

const Home = () => {
    const navigate = useNavigate();
    const { addOrder } = useOrders();
    const [formData, setFormData] = useState({
        name: '',
        size: 'small', // default
        quantity: 1,
        image: null,
    });
    const [imageTransform, setImageTransform] = useState({ scale: 1, x: 0, y: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const handleClosePopup = () => {
        setShowSuccessPopup(false);
        setFormData({
            name: '',
            size: 'small',
            quantity: 1,
            image: null,
        });
        // Reset transform if possible, but component state is local. 
        // Ideally we force re-mount or expose a reset ref. 
        // For now, empty image will reset visual.
        setImageTransform({ scale: 1, x: 0, y: 0 });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, image: e.target.files[0] });
        }
    };

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    // Max dimension 800px is enough for preview & print prototype
                    const MAX_WIDTH = 800;
                    const scaleSize = MAX_WIDTH / Math.max(img.width, MAX_WIDTH);
                    canvas.width = img.width * scaleSize;
                    canvas.height = img.height * scaleSize;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // Compress to JPEG 0.7
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.image) {
            alert('Mohon upload gambar terlebih dahulu');
            return;
        }

        setIsSubmitting(true);

        // Compress image before saving
        try {
            console.log("Starting image compression...");
            const compressedImageData = await compressImage(formData.image);
            console.log("Image compressed. length:", compressedImageData?.length);

            // Simulate slight delay
            setTimeout(() => {
                console.log("Submitting order with data:", { ...formData, imageData: "..." });
                addOrder({
                    name: formData.name,
                    size: formData.size,
                    sizeDetails: PIN_SIZES[formData.size],
                    quantity: parseInt(formData.quantity),
                    imageData: compressedImageData,
                    imageTransform: imageTransform,
                });
                console.log("Order submitted to context.");
                setIsSubmitting(false);
                setShowSuccessPopup(true);
            }, 1000);

        } catch (error) {
            console.error("Error compressing image or submitting:", error);
            setIsSubmitting(false);
            alert("Gagal memproses gambar. Silakan coba lagi. Error: " + error.message);
        }
    };

    const selectedSize = PIN_SIZES[formData.size];

    return (
        <>
            <PromoCarousel />
            <div className="grid lg:grid-cols-2 gap-12 items-start animate-fade-in-up">
                {/* Left Column: Form */}
                <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                        Buat Pin Custom
                    </h1>
                    <p className="text-gray-500 mb-8">
                        Desain pin berkualitas tinggi dengan mudah. Upload, preview, pesan.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Nama Pemesan</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                                placeholder="Masukkan nama anda"
                            />
                        </div>

                        {/* Size Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Pilih Ukuran</label>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.values(PIN_SIZES).map((size) => (
                                    <div
                                        key={size.id}
                                        onClick={() => setFormData({ ...formData, size: size.id })}
                                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center ${formData.size === size.id
                                            ? 'border-indigo-600 bg-indigo-50/50'
                                            : 'border-gray-100 hover:border-gray-200 bg-white'
                                            }`}
                                    >
                                        <span className="font-bold text-gray-900">{size.label}</span>
                                        <span className="text-xs text-gray-500 mt-1">{size.outerDiameterCm}cm</span>
                                        <span className="text-sm font-semibold text-indigo-600 mt-2">
                                            Rp {size.price.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Upload Desain</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors">
                                    <Upload className="text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">
                                        {formData.image ? formData.image.name : 'Klik untuk upload gambar'}
                                    </span>
                                    <span className="text-xs text-gray-400 mt-1">Format JPG, PNG</span>
                                </div>
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Jumlah Pesanan</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                            />
                        </div>

                        {/* Summary & Button */}
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-600">Total Biaya</span>
                                <span className="text-2xl font-bold text-gray-900">
                                    Rp {(formData.quantity * selectedSize.price).toLocaleString()}
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 text-white font-bold text-lg rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    'Memproses...'
                                ) : (
                                    <>
                                        <ShoppingCart size={20} />
                                        Pesan Sekarang
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Column: Mockup Preview */}
                <div className="sticky top-24">
                    <div className="bg-gradient-to-br from-white/80 to-indigo-50/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl -translate-y-16 translate-x-16 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl translate-y-16 -translate-x-16 pointer-events-none"></div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-6 relative z-10">Live Preview</h2>

                        <div className="flex justify-center mb-8 relative z-10 w-full max-w-[400px] mx-auto">
                            <PinMockup
                                imageFile={formData.image}
                                sizeId={formData.size}
                                onTransformChange={setImageTransform}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-left bg-white/50 p-4 rounded-xl relative z-10">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Ukuran</p>
                                <p className="font-medium text-gray-900">{selectedSize.label}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Diameter Potong</p>
                                <p className="font-medium text-gray-900">{selectedSize.outerDiameterCm} cm</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Diameter Wajah</p>
                                <p className="font-medium text-gray-900">{selectedSize.innerDiameterCm} cm</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Jumlah</p>
                                <p className="font-medium text-gray-900">{formData.quantity} pcs</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Popup */}
            {
                showSuccessPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-fade-in-up">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Terima Kasih!</h2>
                            <p className="text-gray-500 mb-8">
                                Pesanan anda telah berhasil dibuat. Silahkan tunggu proses pembuatan pin custom anda.
                            </p>
                            <button
                                onClick={handleClosePopup}
                                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default Home;
