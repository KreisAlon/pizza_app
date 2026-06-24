const express = require('express');
const cors = require('cors');

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// menu data
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

let orders = [];

// routes
app.get('/api/menu', (req, res) => {
    res.status(200).json(menu);
});

const generateId = () => Math.random().toString(36).substr(2, 9);

app.post('/api/orders', (req, res) => {
    const { customerName, phone, deliveryAddress, pizzas } = req.body;

    if (!customerName || !phone || !deliveryAddress || !pizzas || !Array.isArray(pizzas) || pizzas.length === 0) {
        return res.status(400).json({ error: "missing fields" });
    }

    let totalPrice = 0;

    for (let item of pizzas) {
        const p = menu.pizzas.find(x => x.id === item.pizzaId);
        const s = menu.sizes.find(x => x.id === item.sizeId);

        if (!p || !s) return res.status(400).json({ error: "bad pizza or size" });

        if (item.toppingIds && item.toppingIds.length > 3) {
            return res.status(400).json({ error: "max 3 toppings" });
        }

        // personal rule: large pizza must have at least 1 topping
        if (s.name === 'Large' && (!item.toppingIds || item.toppingIds.length === 0)) {
            return res.status(400).json({ error: "large needs topping" });
        }

        let tPrice = 0;
        if (item.toppingIds) {
            for (let tId of item.toppingIds) {
                const t = menu.toppings.find(x => x.id === tId);
                if (!t) return res.status(400).json({ error: "bad topping" });
                tPrice += t.price;
            }
        }
        totalPrice += p.price + s.price + tPrice;
    }

    const newOrder = { id: generateId(), customerName, phone, deliveryAddress, pizzas, totalPrice, status: "new", createdAt: new Date().toISOString() };
    orders.push(newOrder);
    res.status(201).json(newOrder);
});

app.get('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: "not found" });
    res.status(200).json(order);
});

app.get('/api/orders', (req, res) => {
    const status = req.query.status;
    if (!status) return res.status(200).json([]);
    res.status(200).json(orders.filter(o => o.status === status));
});

app.patch('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: "not found" });

    const states = ['new', 'preparing', 'ready', 'delivered'];
    const curr = states.indexOf(order.status);
    const next = states.indexOf(status);

    if (next === -1 || next !== curr + 1) return res.status(409).json({ error: "bad transition" });

    order.status = status;
    res.status(200).json(order);
});

// server init
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// Keep the server alive
setInterval(() => { }, 1000);