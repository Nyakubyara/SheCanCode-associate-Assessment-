const express = require('express');
const app = express();
 
app.use(express.json());
const store = new Map();

app.get('/',(req,res)=>{
    res.send("working");
});
app.post('/process-payment', (req, res) => {

    const key = req.headers['idempotency-key'];
    const { amount } = req.body;
    const currency = "FRW";

    if (!key) {
        return res.status(400).json({
            message: "Idempotency-Key is required"
        });
    }

    const existing = store.get(key);

    
    if (existing) {


        if (existing.status === "completed") {

            if (JSON.stringify(existing.body) === JSON.stringify(req.body)) {
                res.setHeader("X-Cache-Hit", "true");
                return res.status(200).json(existing.response);
            }

            return res.status(409).json({
                message: "Idempotency key already used for a different request body."
            });
        }

        
        if (existing.status === "processing") {
            return setTimeout(() => {
                const updated = store.get(key);
                return res.status(200).json(updated.response || {
                    message: "Still processing..."
                });
            }, 2000);
        }
    }

    
    store.set(key, {
        body: req.body,
        status: "processing"
    });

    console.log("Processing payment...");

    setTimeout(() => {

        const response = {
            message: `Charged ${amount} ${currency}`
        };

        store.set(key, {
            body: req.body,
            status: "completed",
            response
        });

        console.log("Payment completed");

    }, 2000);

    res.status(202).json({
        message: "Payment is being processed"
    });
});



app.listen(3000,()=>{
    console.log("server is running on port 3000");
});