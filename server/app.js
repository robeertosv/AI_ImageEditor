const express = require('express')
const path = require('path')
const amqp = require('amqplib/callback_api.js')
const multer = require('multer');
const bodyParser = require('body-parser')
const http = require('http')
const socketIo = require('socket.io')
const fs = require('fs')

const host = 'rabbitmq'
const user = 'user'
const pass = 'password'
const mqport = 5672

const storage = multer.diskStorage({
    //destination: '/app/uploads/', // For Docker

    destination: '../uploads/', // For local
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + ext);
    }
});

const upload = multer({ storage })

const app = express();
const server = http.createServer(app)
const io = socketIo(server)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'views')))
app.use(express.json())

let iters = 0;


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'))
})


app.post('/upload', upload.single('image'), (req, res) => {
    let body = req.body;

    res.json({ msg: 'Imagen subida correctamente' })
});

app.get('/image', (req, res) => {
    res.sendFile(path.join(__dirname, '../uploads/image.png'))
})

app.post('/prompt', (req, res) => {
    let { prompt } = req.body;
    console.log(prompt)
    res.send(prompt)

    //amqp.connect(`amqp://${user}:${pass}@${host}:${mqport}`, (err, conn) => {
    amqp.connect(`amqp://localhost`, (err, conn) => {
        conn.createChannel((err, ch) => {
            let q = 'prompt';
            ch.assertQueue(q, { durable: false });
            ch.sendToQueue(q, Buffer.from(prompt));
        })
    })
})

app.post('/rating', (req, res) => {
    const { info } = req.body;

    console.log(info)

    if (info.rating == 0) {
        // Append logs.txt with comment
        fs.appendFileSync('logs.txt', info.comment + '\n');
        return res.send('OK')
    } else {
        // Append AI/dataset.txt with prompt, result, and rating
        fs.appendFileSync('AI/dataset.csv', '"' + info.prompt + '"' + ', ' + parseInt(info.result) + '\n');
        iters++;

        if (iters == 50) {
            // Train the AI
            fetch('http://localhost/train', { method: 'POST', redirect: 'follow' })
        }

        return res.send('OK')
    }

})

app.post('/train', (req, res) => {
    //amqp.connect(`amqp://${user}:${pass}@${host}:${mqport}`, (err, conn) => {
    amqp.connect(`amqp://localhost`, (err, conn) => {
        conn.createChannel((err, ch) => {
            let q = 'prompt';
            ch.assertQueue(q, { durable: false });
            ch.sendToQueue(q, Buffer.from('RETRAIN'));
            console.log("Mensaje de reentreno enviado")
        })
    })

    iters = 0;
})

//amqp.connect(`amqp://${user}:${pass}@${host}:${mqport}`, (err, conn) => {
amqp.connect(`amqp://localhost`, (err, conn) => {
    if(err) { throw err; }
    conn.createChannel((err, ch) => {
        let q = 'result';
        ch.assertQueue(q, { durable: false });
        ch.consume(q, (msg) => {
            console.log("Recibí un mensaje: ", msg.content.toString())
            io.emit('result', msg.content.toString());
            console.log('Mensaje enviado al cliente')
        }, { noAck: true })
    })
})

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Manejar la desconexión del cliente
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});


server.listen(80, () => { console.log('http://localhost') })