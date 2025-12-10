import { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load orders from localStorage on mount
    useEffect(() => {
        const savedOrders = localStorage.getItem('pin_orders');
        if (savedOrders) {
            try {
                setOrders(JSON.parse(savedOrders));
            } catch (e) {
                console.error("Failed to parse orders:", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save orders to localStorage whenever they change, but ONLY after initial load
    useEffect(() => {
        if (!isLoaded) return;

        try {
            console.log("Saving orders to LS:", orders.length);
            localStorage.setItem('pin_orders', JSON.stringify(orders));
        } catch (error) {
            console.error("Failed to save orders to local storage:", error);
            if (error.name === 'QuotaExceededError') {
                alert("Penyimpanan penuh! Mohon reset data di halaman Admin.");
            }
        }
    }, [orders, isLoaded]);

    const addOrder = (orderData) => {
        const newOrder = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            status: 'pending', // pending, processing, completed
            ...orderData,
        };
        console.log("Adding new order to context:", newOrder);
        setOrders((prev) => {
            const updated = [...prev, newOrder];
            console.log("Updated orders list:", updated);
            return updated;
        });
        return newOrder;
    };

    const updateOrderStatus = (orderId, status) => {
        setOrders((prev) =>
            prev.map((order) =>
                order.id === orderId ? { ...order, status } : order
            )
        );
    };

    const clearOrders = () => {
        setOrders([]);
        localStorage.removeItem('pin_orders');
    };

    return (
        <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, clearOrders }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
};
