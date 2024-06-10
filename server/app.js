<<<<<<< HEAD
const express = require('express')
const path = require('path')
const amqp = require('amqplib/callback_api')
const multer = require('multer');
const bodyParser = require('body-parser')
const http = require('http')
const socketIo = require('socket.io')
const fs = require('fs')

const storage = multer.diskStorage({
    destination: 'uploads/',
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

    amqp.connect('amqp://localhost', (err, conn) => {
        conn.createChannel((err, ch) => {
            let q = 'prompt';
            ch.assertQueue(q, { durable: false });
            ch.sendToQueue(q, Buffer.from(prompt));
        })
    })
})


amqp.connect('amqp://localhost', (err, conn) => {
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


=======
const express = require('express')
const path = require('path')
const amqp = require('amqplib/callback_api')
const multer = require('multer');
const bodyParser = require('body-parser')
const http = require('http')
const socketIo = require('socket.io')
const fs = require('fs')

const storage = multer.diskStorage({
    destination: 'uploads/',
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

    amqp.connect('amqp://localhost', (err, conn) => {
        conn.createChannel((err, ch) => {
            let q = 'prompt';
            ch.assertQueue(q, { durable: false });
            ch.sendToQueue(q, Buffer.from(prompt));
        })
    })
})


amqp.connect('amqp://localhost', (err, conn) => {
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


>>>>>>> d2aab1ef5b14bdc0c399f32b737df35219010fb8
server.listen(80, () => { console.log('http://localhost') })