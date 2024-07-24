document.addEventListener("alpine:init", () => {
    Alpine.data("pizzaCart", () => {
        return {
            title: 'Pizza Cart API',
            pizzas: [],
            username: '',
            cartId: '',
            cartPizzas: [],
            cartTotal: 0.00,
            featuedPizza: [],
            paymentAmount: 0,
            message: '',
            history: [],
            cartData: {},
            isLoggedIn: false,
            showHistory: false,


            login() {
                if (this.username.length > 2) {
                    localStorage.setItem('username', this.username)
                    this.createCart();
                    // this.username = '';
                    // this.isLoggedIn = true;
                } else {
                    alert('Username is too short!');
                }
            },
            logout() {
                if (confirm('Do you want to logout?')) {
                    this.username = '',
                        this.cartId = '',
                        this.showHistory = '',
                        // this.featuedPizza = '',
                        // localStorage['cartId'],
                        localStorage.removeItem('username');
                        localStorage.removeItem('featuedPizza');
                }
            },
            createCart() {
                if (!this.username) {
                    // this.cartId = 'No username to create a cart for '
                    return Promise.resolve();
                }

                const cartId = localStorage['cartId']
                if (cartId) {
                    this.cartId = cartId;
                    return Promise.resolve();
                } else {
                    const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`

                    return axios.get(createCartURL)
                        .then(result => {
                            this.cartId = result.data.cart_code;
                            localStorage['cartId'] = this.cartId;
                        })
                }
            },
            getFeature() {
                const getFeatureURL = `https://pizza-api.projectcodex.net/api/pizzas/featured?username=${this.username}`
                return axios.get(getFeatureURL);
            },
            getCart() {
                console.log({cartID: this.cartId});
                const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`
                return this.cartId ? axios.get(getCartURL) : '';
            },
            postFeature(pizzaId) {
                console.log({pizzaId});
                return axios.post(`https://pizza-api.projectcodex.net/api/pizzas/featured`, {
                    "username": this.username,
                    "pizza_id": pizzaId
                })
            },
            addPizza(pizzaId) {

                return axios.post(`https://pizza-api.projectcodex.net/api/pizza-cart/add`, {
                    "cart_code": this.cartId,
                    "pizza_id": pizzaId
                })

            },
            removePizza(pizzaId) {

                return axios.post(`https://pizza-api.projectcodex.net/api/pizza-cart/remove`, {
                    "cart_code": this.cartId,
                    "pizza_id": pizzaId
                })

            },

            clearCartHistory() {
                localStorage.removeItem('cartHistory')
                this.history = []
            },
            getCartHistory() {
                this.history = JSON.parse(localStorage.getItem('cartHistory'));
            },
            pay(amount) {
                return axios.post(`https://pizza-api.projectcodex.net/api/pizza-cart/pay`, {

                    "cart_code": this.cartId,
                    amount
                })
                    .then((result) => {
                        this.getCart()
                        console.log(this.history)
                        console.log(result.data.status)
                        if (result.data.status != 'failure') {
                            let storage = JSON.parse(localStorage.getItem('cartHistory')) || [];
                            this.cartData.pizzas.forEach(pizza => {
                                storage.push(pizza)
                            })
                            this.history = storage;
                            localStorage.setItem('cartHistory', JSON.stringify(storage))
                        }
                        return result
                        
                    })
                

            },
            showCartData() {
                this.getCart()
                    .then(result => {

                        const cartData = result.data;

                        this.cartPizzas = cartData.pizzas?.map(pizza =>{
                            return {
                                ...pizza,
                                size: pizza.size.charAt(0).toUpperCase() + pizza.size.slice(1)
                            }
                        })
                        this.cartData = cartData;
                        this.cartTotal = cartData.total.toFixed(2);

                    });
                this.getFeature().then(result => {
                    // console.log(result.data);
                    this.featuedPizza = result.data.pizzas
                });
            },


            init() {

                const storedUsername = localStorage['username'];

                if (storedUsername) {
                    this.username = storedUsername;
                }

                axios
                    .get('https://pizza-api.projectcodex.net/api/pizzas')
                    .then(result => {
                        //code here
                        //console.log(result.data);
                        this.pizzas = result.data.pizzas
                        //code here...
                    });

                if (!this.cartId) {
                    this
                        .createCart()
                        .then(() => {
                            this.showCartData();
                            console.log('show cart data');
                            this.fetchHistory();
                            this.getFeature()
                            // console.log(JSON.parse(localStorage.getItem('cartHistory')).pizzas);
                            // this.history = JSON.parse(localStorage.getItem('cartHistory')).pizzas;
                        })
                }
            },
            addToFeature(pizzaId) {
                this.postFeature(pizzaId)
                    .then((r) => {
                        // console.log(r);
                        this.getFeature();

                    })
            },
            addPizzaToCart(pizzaId) {
                // alert(pizzaId)
                // const button = document.getElementById('myButton');
                // button.addEventListener('click', function() {
                //     alert('Button was clicked!');
                //   });
                this
                    .addPizza(pizzaId)
                    .then(() => {
                        this.showCartData();
                        console.log(this.cartPizzas, 'addPizza function');
                    })
            },
            removePizzaFromCart(pizzaId) {
                this
                    .removePizza(pizzaId)
                    .then(() => {
                        this.showCartData();
                    })
            },
            fetchHistory() {
                let storage = JSON.parse(localStorage.getItem('cartHistory')) || [];
                this.history = storage;
            },
            showHistoryEvent() {
                this.showHistory = !this.showHistory
            },
            payForCart() {
                
                // alert("Pay now: " + this.paymentAmount)
                this
                    .pay(this.paymentAmount)
                    .then(result => {
                        if (result.data.status == 'failure') {
                            this.displayMessage('Payment failed!');
                            setTimeout(() => this.message = '', 3000);
                        } else {
                            const change = this.paymentAmount - this.cartTotal;
                            this.displayChange(`Change: R${change.toFixed(2)}`);
                            this.displayMessage('Payment received!');
                            setTimeout(() => {
                                this.message = '';
                                this.cartPizzas = [];
                                this.cartTotal = 0.00;
                                // this.cartId = '';
                                this.paymentAmount = 0;
                                localStorage['cartId'] = '';
                                this.createCart();
                            }, 3000);
                        }
                    })
            },
            displayMessage(message) {
                this.message = message;
                setTimeout(() => this.message = '', 3000);
            },
            displayChange(message) {
                const changeDisplay = document.getElementById('changeDisplay');
                changeDisplay.innerText = message;
                changeDisplay.style.display = 'block';

                
                setTimeout(() => {
                    changeDisplay.style.display = 'none';
                }, 3000);
            }
        }
    });
});


function pizzaOrder() {
    return {

        getImage(size) {
            if (size === 'small') return 'https://pizza-api.projectcodex.net/api/pizzas';
            if (size === 'medium') return 'https://pizza-api.projectcodex.net/api/pizzas';
            if (size === 'large') return 'https://pizza-api.projectcodex.net/api/pizzas';
        },
        getClass(size) {
            if (size === 'small') return 'Pic3';
            if (size === 'medium') return 'Pic2';
            if (size === 'large') return 'Pic1';
        }
    };
};
