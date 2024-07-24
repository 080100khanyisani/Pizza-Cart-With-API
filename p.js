document.addEventListener("alpine:init", () => {
    Alpine.data('pizzaCart', () => {
        return {
            cartCode:'',
            username:'',
            history:'',

            init(){
                this.fetchHistoryCart();

            },
            fetchHistoryCart(){
                axios
                .get(`https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`

                ).then((res)=>{
                    const carts =res.data;
                    carts.foreach((cart)=>{
                        if(cart.status == 'paid'){
                            const cartCode = cart.cart_code;
                            axios.get(
                                `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartCode}/get`
                            ).then((res)=>{
                                const cartData = res.data;
                                console.log('Cart Data',cartData);
                                this.history.push(cartData),
                            })
                        }
                    })
                })
            }

        };
    });
});