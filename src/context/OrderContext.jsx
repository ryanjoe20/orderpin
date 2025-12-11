import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async (statusFilter = 'pending') => {
        try {
            // Optimized: Fetch only specific status to reduce data transfer
            // Default: pending (for Admin dashboard)
            // Report page will call with 'completed'
            let query = supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            // Apply status filter if provided
            if (statusFilter) {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;

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
                imageData: item.image_data,
                imageTransform: item.image_transform,
                status: item.status
            }));

            setOrders(formattedData);
        } catch (error) {
            console.error('Error fetching orders:', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Load orders on mount AND set up realtime subscription? 
    // For now, just load on mount. Realtime can be added if needed.
    useEffect(() => {
        fetchOrders();

        // Listen for both INSERT (new orders) and UPDATE (status changes)
        const channel = supabase
            .channel('orders_channel')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'orders'
            }, (payload) => {
                console.log('🆕 New order inserted:', payload);
                fetchOrders();
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders'
            }, (payload) => {
                console.log('🔄 Order updated:', payload);
                fetchOrders();
            })
            .subscribe((status) => {
                console.log('📡 Realtime subscription status:', status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const addOrder = async (orderData) => {
        try {
            // Map frontend data to DB columns if needed
            // Our DB schema matches the object keys mostly:
            // name, productType, size, quantity, imageData, imageTransform
            // But 'sizeDetails' is an object, size_details is jsonb.

            const dbPayload = {
                name: orderData.name,
                phone_number: orderData.phoneNumber,
                product_type: orderData.productType,
                size: orderData.size,
                quantity: orderData.quantity,
                size_details: orderData.sizeDetails,
                image_data: orderData.imageData,
                image_transform: orderData.imageTransform,
                status: 'pending'
            };

            const { data, error } = await supabase
                .from('orders')
                .insert([dbPayload])
                .select();

            if (error) throw error;

            // Optimistic update or wait for fetch? 
            // Realtime subscription should handle it, but let's be safe for UI feedback.
            if (data) {
                // setOrders(prev => [data[0], ...prev]); // Realtime will handle this
                return data[0];
            }
        } catch (error) {
            console.error('Error adding order:', error.message);
            throw error; // Re-throw so UI can show error
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', orderId);

            if (error) throw error;

            // Manual refetch to ensure immediate UI update
            // (fallback in case realtime subscription is slow or not working)
            await fetchOrders();
        } catch (error) {
            console.error('Error updating order:', error.message);
            alert("Gagal mengupdate status: " + error.message);
        }
    };

    const clearOrders = async () => {
        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all hack

            if (error) throw error;
            setOrders([]);
        } catch (error) {
            console.error('Error clearing orders:', error.message);
            alert("Gagal menghapus data: " + error.message);
        }
    };

    return (
        <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, clearOrders, loading }}>
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
