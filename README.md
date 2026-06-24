# pizza_app
# Pizza Ordering System - Assignment 2

## Student Details
* Alon Kreisberger - ID: 314950064

**GitHub Repository:** https://github.com/KreisAlon/pizza_app

## Project Structure
The project is divided into two main folders:
* `server` - The backend building the REST API using Node.js and Express.
* `client` - The frontend user interface built with React.

## How to Install and Run

### Running the Server
1. Open a terminal inside the `server` folder.
2. Run `npm install` to install dependencies.
3. Run `npm start` to start the server.
The server runs on port 3001.

### Running the Client
1. Open a new terminal inside the `client` folder.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the React app.

---

## Required Questions & Answers

**1. What is the difference between the client and the server in your system?**
The client (React) is just the user interface - it shows the menu, takes user inputs, and displays the cart. The server (Express) is the real "brain" and the single source of truth. It checks if the rules are followed, calculates the real prices, saves the orders, and updates their status.

**2. Where is the total price calculated and why?**
The final total price is calculated on the server. We do this for security. If we only calculated it on the client side, a smart user could change the code in their browser and send a fake cheap price. The server calculates it fresh using its own menu data so no one can cheat.

**3. What happens when a client sends an invalid order?**
If an order is missing details or breaks the rules, the server rejects it and returns a 400 error status. We also added front-end alerts in React to catch empty fields or bad inputs before they even reach the server.

**4. What happens after the fake payment is successful?**
The server saves the new order and returns a 201 status code. On the client side, the shopping cart is cleared, the form resets, and a success message appears showing the new Order ID and the total price. The order also appears for the employee with a "new" status.

**5. What is your personal rule and where is it implemented?**
My ID ends in 4, so my rule is: "A Large pizza must include at least one topping."
I implemented this in two places: 
* In the client: When the user tries to add a Large pizza with zero toppings, an alert pops up and stops them. 
* In the server: The API checks the order and rejects it if a large pizza doesn't have toppings.

**6. What was the most challenging part of the assignment?**
The hardest part was a really annoying bug where the cart total kept showing 0₪. It took a while to realize it was just a tiny mistake trying to read `pizzaId` instead of `id` from the saved cart object. Also, figuring out the best way to extract data straight from the original menu arrays without making the code too messy took some trial and error.

**7. Name one design decision you made and why.**
We decided to add a quantity input when choosing a pizza. To make the cart UI look clean, if a user adds 3 identical pizzas, it shows up as one row with "x3" on the right side. However, before sending the order to the server during checkout, the code flattens it back into 3 separate pizza objects so it perfectly matches the strict API structure required by the assignment.