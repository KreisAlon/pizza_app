import React, { useState, useEffect } from 'react';

function Customer() {
    const [menu, setMenu] = useState(null);
    const [cart, setCart] = useState([]);
    const [formData, setFormData] = useState({ customerName: '', phone: '', deliveryAddress: '' });
    const [orderMessage, setOrderMessage] = useState('');

    // New state variables for tracking
    const [trackId, setTrackId] = useState('');
    const [orderStatus, setOrderStatus] = useState(null);

    useEffect(() => {
        fetch('http://localhost:3001/api/menu')
            .then(res => res.json())
            .then(data => setMenu(data));
    }, []);

    const addToCart = (pizza) => setCart([...cart, pizza]);

    const placeOrder = async () => {
        const orderData = {
            ...formData,
            pizzas: cart.map(p => ({ pizzaId: p.id, sizeId: 's1' }))
        };

        const res = await fetch('http://localhost:3001/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (res.ok) {
            const order = await res.json();
            setCart([]);
            setFormData({ customerName: '', phone: '', deliveryAddress: '' });
            setOrderMessage(`Order #${order.id} placed successfully!`);
        } else {
            setOrderMessage('Error placing order.');
        }
    };

    // Logic for checking status
    const checkStatus = async () => {
        const res = await fetch(`http://localhost:3001/api/orders/${trackId}`);
        if (res.ok) {
            const data = await res.json();
            setOrderStatus(data.status);
        } else {
            setOrderStatus('Order not found');
        }
    };

    if (!menu) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial' }}>
            <h1>Pizza Menu</h1>

            {/* Menu List */}
            <div data-testid="menu-list">
                {menu.pizzas.map(pizza => (
                    <div key={pizza.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>{pizza.name} - {pizza.price}₪</span>
                        <button onClick={() => addToCart(pizza)}>Add to Cart</button>
                    </div>
                ))}
            </div>

            {/* Shopping Cart */}
            <div data-testid="cart" style={{ marginTop: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h2>Shopping Cart</h2>
                {cart.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.name}</span>
                        <span>{item.price}₪</span>
                    </div>
                ))}
                <hr />
                <p>Total: {cart.reduce((sum, item) => sum + item.price, 0)}₪</p>
            </div>

            {/* Checkout Form */}
            <div style={{ marginTop: '20px' }}>
                {orderMessage && <div style={{ color: 'green', marginBottom: '10px' }}>{orderMessage}</div>}
                <input placeholder="Name" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} />
                <input placeholder="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                <input placeholder="Address" value={formData.deliveryAddress} onChange={e => setFormData({ ...formData, deliveryAddress: e.target.value })} />
                <button onClick={placeOrder} disabled={cart.length === 0}>Checkout</button>
            </div>

            {/* Tracking Section */}
            <div style={{ marginTop: '40px', padding: '15px', border: '1px dashed #666', borderRadius: '8px' }}>
                <h2>Track Your Order</h2>
                <input placeholder="Enter Order ID" onChange={e => setTrackId(e.target.value)} />
                <button onClick={checkStatus}>Check Status</button>
                {orderStatus && <p>Status: <strong>{orderStatus}</strong></p>}
            </div>
        </div>
    );
}

export default Customer;