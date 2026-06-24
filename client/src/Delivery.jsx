import React, { useState, useEffect } from 'react';

function Delivery() {
    const [orders, setOrders] = useState([]);

    // Fetch only ready orders for delivery
    const fetchReadyOrders = async () => {
        const res = await fetch('http://localhost:3001/api/orders?status=ready');
        const data = await res.json();
        setOrders(data);
    };

    useEffect(() => { fetchReadyOrders(); }, []);

    const markAsDelivered = async (id) => {
        const res = await fetch(`http://localhost:3001/api/orders/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'delivered' })
        });
        if (res.ok) fetchReadyOrders(); // Refresh list after success
        else alert('Error updating status');
    };

    return (
        <div style={{ padding: '20px' }} data-testid="delivery-orders">
            <h1>Delivery Portal</h1>
            {orders.length === 0 ? <p>No orders ready for delivery.</p> : null}
            {orders.map(order => (
                <div key={order.id} style={{ border: '1px solid #666', margin: '10px', padding: '10px' }}>
                    <p>Order #{order.id}</p>
                    <p>Customer: {order.customerName} | Phone: {order.phone}</p>
                    <p>Address: {order.deliveryAddress}</p>
                    <button onClick={() => markAsDelivered(order.id)}>Mark as Delivered</button>
                </div>
            ))}
        </div>
    );
}

export default Delivery;