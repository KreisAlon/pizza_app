import React, { useState, useEffect } from 'react';

function Employee() {
    const [orders, setOrders] = useState([]);

    // Fetch only active orders (new or preparing)
    const fetchOrders = async () => {
        const res = await fetch('http://localhost:3001/api/orders?status=new');
        const res2 = await fetch('http://localhost:3001/api/orders?status=preparing');
        const newOrders = await res.json();
        const prepOrders = await res2.json();
        setOrders([...newOrders, ...prepOrders]);
    };

    useEffect(() => { fetchOrders(); }, []);

    const updateStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'new' ? 'preparing' : 'ready';
        const res = await fetch(`http://localhost:3001/api/orders/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: nextStatus })
        });
        if (res.ok) fetchOrders(); // Refresh list
        else alert('Error updating status');
    };

    return (
        <div style={{ padding: '20px' }} data-testid="employee-orders">
            <h1>Employee Portal</h1>
            {orders.map(order => (
                <div key={order.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                    <p>Order #{order.id} - {order.customerName}</p>
                    <p>Status: {order.status}</p>
                    <button onClick={() => updateStatus(order.id, order.status)}>
                        {order.status === 'new' ? 'Start Preparing' : 'Mark Ready'}
                    </button>
                </div>
            ))}
        </div>
    );
}

export default Employee;