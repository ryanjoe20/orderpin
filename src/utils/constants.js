export const PIN_SIZES = {
    small: {
        id: 'small',
        label: 'Kecil',
        outerDiameterCm: 5.5,
        innerDiameterCm: 4.4,
        originalPrice: 6000, // Strikethrough price
        price: 5000, // Actual price
        description: 'Pin ukuran standar (5.5cm)',
    },
    large: {
        id: 'large',
        label: 'Besar',
        outerDiameterCm: 6.95,
        innerDiameterCm: 5.8,
        originalPrice: 9000, // Strikethrough price
        price: 8000, // Actual price
        description: 'Pin ukuran besar (6.95cm)',
    },
};

export const PRODUCT_TYPES = {
    pin: {
        id: 'pin',
        label: 'Pin Peniti',
        code: 'PIN'
    },
    keychain: {
        id: 'keychain',
        label: 'Gantungan Kunci',
        code: 'GANCI'
    }
};
