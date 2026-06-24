import React, { useState, useEffect } from 'react';

function Customer() {
    // State for menu data, cart, user details, and checkout messages
    const [menu, setMenu] = useState(null);
    const [cart, setCart] = useState([]);
    const [formData, setFormData] = useState({ customerName: '', phone: '', deliveryAddress: '' });
    const [orderMessage, setOrderMessage] = useState('');

    // State for checking order status
    const [statusOrderId, setStatusOrderId] = useState('');
    const [statusResult, setStatusResult] = useState('');

    // Track temporary choices (size, toppings, quantity) before adding to cart
    const [selections, setSelections] = useState({});

    // Fetch the menu on component mount
    useEffect(() => {
        fetch('http://localhost:3001/api/menu')
            .then(res => res.json())
            .then(data => setMenu(data));
    }, []);

    // Set default selections once menu is loaded
    useEffect(() => {
        if (menu) {
            const initial = {};
            menu.pizzas.forEach(p => initial[p.id] = { sizeId: 's1', toppingIds: [], quantity: 1 });
            setSelections(initial);
        }
    }, [menu]);

    // Update selection state dynamically
    const updateSelection = (pizzaId, key, value) => {
        setSelections(prev => ({
            ...prev,
            [pizzaId]: { ...prev[pizzaId], [key]: value }
        }));
    };

    // Calculate base unit price for a SINGLE pizza configuration
    const calculatePizzaUnitPrice = (item) => {
        if (!menu) return 0;

        const pizza = menu.pizzas.find(p => p.id === item.pizzaId);
        const size = menu.sizes.find(s => s.id === item.sizeId);

        if (!pizza || !size) return 0;

        const toppingsPrice = item.toppingIds?.reduce((sum, tId) => {
            const topping = menu.toppings.find(t => t.id === tId);
            return sum + (topping ? topping.price : 0);
        }, 0) || 0;

        return pizza.price + size.price + toppingsPrice;
    };

    // Add a single cart entry reflecting the exact quantity chosen
    const addToCart = (pizzaId) => {
        const pizza = menu.pizzas.find(p => p.id === pizzaId);
        const sel = selections[pizzaId] || { sizeId: 's1', toppingIds: [], quantity: 1 };

        // VALIDATION: Personal Rule - Large pizza must have at least one topping
        if (sel.sizeId === 's3' && (!sel.toppingIds || sel.toppingIds.length === 0)) {
            alert("Personal Rule: A Large pizza must include at least one topping!");
            return;
        }

        // Add the item exactly as configured with its quantity
        const newItemConfig = { ...pizza, ...sel, pizzaId: pizzaId, quantity: sel.quantity || 1 };
        setCart([...cart, newItemConfig]);

        // Reset this specific pizza's selections back to default
        setSelections(prev => ({
            ...prev,
            [pizzaId]: { sizeId: 's1', toppingIds: [], quantity: 1 }
        }));
    };

    // Send the completed order to the server
    const placeOrder = async () => {
        // VALIDATION: Check for empty fields
        if (!formData.customerName.trim()) {
            alert("Please enter your Name.");
            return;
        }
        if (!formData.phone.trim()) {
            alert("Please enter your Phone Number.");
            return;
        }
        if (!formData.deliveryAddress.trim()) {
            alert("Please enter your Delivery Address.");
            return;
        }

        // VALIDATION: Cart must not be empty
        if (cart.length === 0) {
            alert("Please add at least one pizza to the cart.");
            return;
        }

        // Unroll the cart: Server expects individual objects
        const flatPizzas = [];
        cart.forEach(item => {
            for (let i = 0; i < item.quantity; i++) {
                flatPizzas.push({ pizzaId: item.pizzaId, sizeId: item.sizeId, toppingIds: item.toppingIds || [] });
            }
        });

        const orderData = { ...formData, pizzas: flatPizzas };

        try {
            const res = await fetch('http://localhost:3001/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const order = await res.json();
                setCart([]);
                setFormData({ customerName: '', phone: '', deliveryAddress: '' });
                setOrderMessage(`Order #${order.id} placed! Total: ${order.totalPrice}₪`);
            } else {
                setOrderMessage('Error placing order');
            }
        } catch (error) {
            setOrderMessage('Network error placing order');
        }
    };

    // Check the status of an existing order
    const checkOrderStatus = async () => {
        if (!statusOrderId.trim()) {
            setStatusResult('Please enter an Order ID');
            return;
        }

        try {
            const res = await fetch(`http://localhost:3001/api/orders/${statusOrderId}`);
            if (res.ok) {
                const order = await res.json();
                setStatusResult(`Order #${order.id} status: ${order.status}`);
            } else {
                setStatusResult('Order not found.');
            }
        } catch (error) {
            setStatusResult('Error checking order status.');
        }
    };

    if (!menu) return <div>Loading menu...</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial' }}>
            <h1>Pizza Menu</h1>

            {/* List of available pizzas */}
            <div data-testid="menu-list">
                {menu.pizzas.map(pizza => (
                    <div key={pizza.id} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd' }}>
                        <p>{pizza.name} - {pizza.price}₪</p>

                        {/* Size dropdown */}
                        <select
                            onChange={(e) => updateSelection(pizza.id, 'sizeId', e.target.value)}
                            value={selections[pizza.id]?.sizeId || 's1'}
                        >
                            {menu.sizes.map(s => <option key={s.id} value={s.id}>{s.name} (+{s.price}₪)</option>)}
                        </select>

                        {/* Toppings checkboxes */}
                        <div>
                            {menu.toppings.map(t => (
                                <label key={t.id} style={{ display: 'block' }}>
                                    <input
                                        type="checkbox"
                                        checked={selections[pizza.id]?.toppingIds?.includes(t.id) || false}
                                        onChange={(e) => {
                                            const current = selections[pizza.id]?.toppingIds || [];

                                            // VALIDATION: Max 3 toppings
                                            if (e.target.checked) {
                                                if (current.length >= 3) {
                                                    alert("You can select up to a maximum of 3 toppings per pizza.");
                                                    return;
                                                }
                                                updateSelection(pizza.id, 'toppingIds', [...current, t.id]);
                                            } else {
                                                updateSelection(pizza.id, 'toppingIds', current.filter(id => id !== t.id));
                                            }
                                        }}
                                    /> {t.name} ({t.price}₪)
                                </label>
                            ))}
                        </div>

                        {/* Quantity input */}
                        <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                            <label>Quantity: </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={selections[pizza.id]?.quantity || 1}
                                onChange={(e) => updateSelection(pizza.id, 'quantity', parseInt(e.target.value) || 1)}
                                style={{ width: '50px' }}
                            />
                        </div>

                        <button onClick={() => addToCart(pizza.id)}>Add to Cart</button>
                    </div>
                ))}
            </div>

            {/* Shopping cart summary */}
            <div data-testid="cart" style={{ marginTop: '30px', padding: '15px', border: '1px solid #ccc' }}>
                <h2>Order Summary</h2>

                {cart.map((item, index) => {
                    const size = menu.sizes.find(s => s.id === item.sizeId);

                    return (
                        <div key={index} style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div><strong>Pizza {item.name}</strong> - {item.price * item.quantity}₪</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>x{item.quantity}</div>
                            </div>

                            <div style={{ color: '#555' }}>Size {size?.name} - {size?.price * item.quantity}₪</div>

                            {item.toppingIds?.map(tId => {
                                const topping = menu.toppings.find(t => t.id === tId);
                                return topping ? (
                                    <div key={tId} style={{ color: '#555' }}>
                                        Topping {topping.name} - {topping.price * item.quantity}₪
                                    </div>
                                ) : null;
                            })}

                            <div style={{ borderBottom: '1px dashed #999', margin: '15px 0' }}></div>
                        </div>
                    );
                })}

                <h3>Total: {cart.reduce((sum, item) => sum + (calculatePizzaUnitPrice(item) * item.quantity), 0)}₪</h3>
            </div>

            {/* Checkout form */}
            <div data-testid="order-summary-panel" style={{ marginTop: '20px' }}>
                <input
                    placeholder="Name"
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                />
                <input
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={e => {
                        const onlyNumbers = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, phone: onlyNumbers });
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="10"
                />
                <input
                    placeholder="Address"
                    value={formData.deliveryAddress}
                    onChange={e => setFormData({ ...formData, deliveryAddress: e.target.value })}
                />
                <button data-testid="checkout-button" onClick={placeOrder}>Checkout</button>
                {orderMessage && <p data-testid="order-confirmation" style={{ fontWeight: 'bold', color: 'green' }}>{orderMessage}</p>}
            </div>

            {/* Order Status Checker */}
            <div style={{ marginTop: '30px', padding: '15px', border: '1px solid #ccc', backgroundColor: '#f9f9f9' }}>
                <h2>Check Order Status</h2>
                <input
                    placeholder="Enter Order ID"
                    value={statusOrderId}
                    onChange={e => setStatusOrderId(e.target.value)}
                    style={{ marginRight: '10px' }}
                />
                <button onClick={checkOrderStatus}>Check Status</button>
                {statusResult && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{statusResult}</p>}
            </div>
        </div>
    );
}

export default Customer;