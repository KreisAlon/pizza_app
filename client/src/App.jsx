import React, { useState, useEffect } from 'react';

function App() {
  const [menu, setMenu] = useState(null);
  const [cart, setCart] = useState([]); // כאן נשמור את מה שהמשתמש בחר

  useEffect(() => {
    fetch('http://localhost:3001/api/menu')
      .then(res => res.json())
      .then(data => setMenu(data));
  }, []);

  const addToCart = (pizza) => {
    setCart([...cart, pizza]);
  };

  if (!menu) return <div>Loading menu...</div>;

  return (
    <div>
      <h1>Pizza Menu</h1>
      <div data-testid="menu-list">
        {menu.pizzas.map(pizza => (
          <div key={pizza.id} style={{ marginBottom: '10px' }}>
            {pizza.name} - {pizza.price}₪
            <button onClick={() => addToCart(pizza)}>הוסף לעגלה</button>
          </div>
        ))}
      </div>

      <div data-testid="cart" style={{ marginTop: '20px', borderTop: '1px solid black' }}>
        <h2>עגלת קניות ({cart.length} פריטים)</h2>
        {cart.map((item, index) => <p key={index}>{item.name}</p>)}
      </div>
    </div>
  );
}

export default App;