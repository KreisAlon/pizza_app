const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Use environment port or default to 3001
const PORT = process.env.PORT || 3001;

// Simple test route
app.get('/api/test', (req, res) => {
    res.status(200).json({ message: "Server is up and running" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// In-memory database
const menu = {
    pizzas: [
        { id: 'p1', name: 'Margherita', price: 35 },
        { id: 'p2', name: 'Vegetarian', price: 39 },
        { id: 'p3', name: 'Pepperoni', price: 42 }
    ],
    sizes: [
        { id: 's1', name: 'Small', price: 0 },
        { id: 's2', name: 'Medium', price: 8 },
        { id: 's3', name: 'Large', price: 15 }
    ],
    toppings: [
        { id: 't1', name: 'Olives', price: 4 },
        { id: 't2', name: 'Mushrooms', price: 4 },
        { id: 't3', name: 'Corn', price: 4 },
        { id: 't4', name: 'Onion', price: 4.5 },
        { id: 't5', name: 'Extra Cheese', price: 3.5 }
    ]
};

// Array to store all orders
let orders = [];

// GET /api/menu - Returns the restaurant menu
app.get('/api/menu', (req, res) => {
    res.status(200).json(menu);
});


// helper to make random order id
const generateId = () => Math.random().toString(36).substr(2, 9);

// POST /api/orders - add new order
app.post('/api/orders', (req, res) => {
    const { customerName, phone, deliveryAddress, pizzas } = req.body;

    // check missing data
    if (!customerName || !phone || !deliveryAddress || !pizzas || !Array.isArray(pizzas) || pizzas.length === 0) {
        return res.status(400).json({ error: "missing fields" });
    }

    let totalPrice = 0;

    // calc total price and check ids
    for (let i = 0; i < pizzas.length; i++) {
        const item = pizzas[i];

        const p = menu.pizzas.find(x => x.id === item.pizzaId);
        const s = menu.sizes.find(x => x.id === item.sizeId);

        if (!p || !s) return res.status(400).json({ error: "bad pizza or size id" });

        // max 3 toppings rule
        if (item.toppingIds && item.toppingIds.length > 3) {
            return res.status(400).json({ error: "too many toppings" });
        }

        // my custom rule: large pizza must have at least 1 topping
        if (s.name === 'Large' && (!item.toppingIds || item.toppingIds.length === 0)) {
            return res.status(400).json({ error: "large pizza needs toppings" });
        }

        let toppingsPrice = 0;
        if (item.toppingIds) {
            for (let tId of item.toppingIds) {
                const t = menu.toppings.find(x => x.id === tId);
                if (!t) return res.status(400).json({ error: "bad topping id" });
                toppingsPrice += t.price;
            }
        }

        totalPrice += p.price + s.price + toppingsPrice;
    }

    const newOrder = {
        id: generateId(),
        customerName,
        phone,
        deliveryAddress,
        pizzas: pizzas,
        totalPrice,
        status: "new",
        createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    res.status(201).json(newOrder);
});


// GET /api/orders/:id - get order by id
app.get('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: "order not found" });
    res.status(200).json(order);
});

// GET /api/orders?status=xyz - filter orders
app.get('/api/orders', (req, res) => {
    const status = req.query.status;
    // return empty array if no status or no match, as requested
    if (!status) return res.status(200).json([]);

    const filteredOrders = orders.filter(o => o.status === status);
    res.status(200).json(filteredOrders);
});

// PATCH /api/orders/:id/status - update order state
app.patch('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    const order = orders.find(o => o.id === req.params.id);

    if (!order) return res.status(404).json({ error: "order not found" });

    // check valid transitions
    const states = ['new', 'preparing', 'ready', 'delivered'];
    const currentIndex = states.indexOf(order.status);
    const newIndex = states.indexOf(status);

    // must move exactly 1 step forward. no skipping, no going back.
    if (newIndex === -1 || newIndex !== currentIndex + 1) {
        return res.status(409).json({ error: "invalid state transition" });
    }

    order.status = status;
    res.status(200).json(order);
});