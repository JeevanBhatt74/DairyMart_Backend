const axios = require('axios');
axios.post('https://a.khalti.com/api/v2/epayment/initiate/', {
    return_url: 'http://localhost:3000/api/payment/callback/khalti?successUrl=http%3A%2F%2F10.0.2.2%3A3000%2Fpayment%2Fsuccess&failureUrl=http%3A%2F%2F10.0.2.2%3A3000%2Fpayment%2Ffailure',
    website_url: 'http://localhost:3000/',
    amount: 33000,
    purchase_order_id: '67c13da82fc224dc6e8ccae0',
    purchase_order_name: 'Order 67c13da82fc224dc6e8ccae0',
    customer_info: {
        name: 'Customer',
        email: 'customer@example.com',
        phone: '9800000000'
    }
}, {
    headers: {
        Authorization: 'Key live_secret_key_68791341fdd94846a146f0457ff7b455',
        'Content-Type': 'application/json'
    }
}).then(res => console.log('Success:', res.data)).catch(err => console.error('Error:', err.response?.data || err.message));
