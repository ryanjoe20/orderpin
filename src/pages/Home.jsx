import { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { useDarkMode } from '../context/DarkModeContext';
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
        phoneNumber: '', // Added phoneNumber
        productType: 'pin', // 'pin' or 'keychain'
        size: 'small', // default
        quantity: 1,
        image: null,
    });
    const [imageTransform, setImageTransform] = useState({ scale: 1, x: 0, y: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const { isDarkMode } = useDarkMode();

    const handleClosePopup = () => {
        setShowSuccessPopup(false);
        setFormData({
            name: '',
            phoneNumber: '',
            productType: 'pin',
            size: 'small',
            quantity: 1,
            image: null,
        });
        setImageTransform({ scale: 1, x: 0, y: 0 });
    };

    // ... compressImage and handleImageChange ...
    // Note: Re-include compressImage and handleImageChange code here as they are inside the replaced block's scope if I replaced too much. 
    // Actually, I should target specific blocks. But let's look at the TargetContent carefully.
    // I will replace the top part of the component to init state, and then the return block.

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
                    const MAX_WIDTH = 800;
                    const scaleSize = MAX_WIDTH / Math.max(img.width, MAX_WIDTH);
                    canvas.width = img.width * scaleSize;
                    canvas.height = img.height * scaleSize;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
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

        try {
            const compressedImageData = await compressImage(formData.image);

            await addOrder({
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                productType: formData.productType,
                size: formData.size,
                sizeDetails: PIN_SIZES[formData.size],
                quantity: parseInt(formData.quantity),
                imageData: compressedImageData,
                imageTransform: imageTransform,
            });

            setIsSubmitting(false);
            setShowSuccessPopup(true);

        } catch (error) {
            setIsSubmitting(false);
            alert("Error: " + error.message);
        }
    };

    const selectedSize = PIN_SIZES[formData.size];

    return (
        <>
            <PromoCarousel />
            <div className="grid lg:grid-cols-2 gap-12 items-start animate-fade-in-up">
                {/* Left Column: Form */}
                <div className={`p-8 rounded-3xl shadow-2xl border transition-colors ${isDarkMode
                    ? 'bg-gray-800/90 backdrop-blur-xl border-gray-700'
                    : 'bg-white/70 backdrop-blur-xl border-white/20'
                    }`}>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                        Buat Pin & Ganci Custom
                    </h1>
                    <p className={`mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Desain pin berkualitas tinggi dengan mudah. Upload, preview, pesan.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Product Type Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Pilih Jenis Produk</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => setFormData({ ...formData, productType: 'pin' })}
                                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center ${formData.productType === 'pin'
                                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                                        : 'border-gray-100 hover:border-gray-200 bg-white'
                                        }`}
                                >
                                    <div className="w-10 h-10 mb-2 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">1</div>
                                    <span className="font-bold text-gray-900">Pin Peniti</span>
                                    <span className="text-xs text-gray-500 mt-1">Belakang Peniti</span>
                                </div>
                                <div
                                    onClick={() => setFormData({ ...formData, productType: 'keychain' })}
                                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center ${formData.productType === 'keychain'
                                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                                        : 'border-gray-100 hover:border-gray-200 bg-white'
                                        }`}
                                >
                                    <div className="w-10 h-10 mb-2 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">2</div>
                                    <span className="font-bold text-gray-900">Gantungan Kunci</span>
                                    <span className="text-xs text-gray-500 mt-1">Ring Rantai</span>
                                </div>
                            </div>
                        </div>

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

                        {/* Phone Number Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Nomor WhatsApp</label>
                            <input
                                type="tel"
                                required
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                                placeholder="Contoh: 08123456789"
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

                        {/* WhatsApp Contact Button - Static */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <a
                                href="https://wa.me/6289693235475"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 bg-[#25D366] hover:bg-[#20BA5A] text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Hubungi Kami via WhatsApp
                            </a>
                        </div>
                    </form>
                </div>

                {/* Right Column: Mockup Preview */}
                <div className={`sticky top-24 p-8 rounded-3xl shadow-xl border text-center relative overflow-hidden transition-colors ${isDarkMode
                    ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border-gray-700'
                    : 'bg-gradient-to-br from-white/80 to-indigo-50/80 backdrop-blur-xl border-white/50'
                    }`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl -translate-y-16 translate-x-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl translate-y-16 -translate-x-16 pointer-events-none"></div>

                    <h2 className={`text-2xl font-bold mb-6 relative z-10 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Live Preview</h2>

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
