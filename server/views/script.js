let mostRecentPrompt;
let mostRecentResult;

const socket = io();

socket.on('result', async (data) => {
    console.log("He recibido un mensaje: ", data)
    mostRecentResult = data;
    let res = await fetch('/image');
    let blob = await res.blob();
    let url = URL.createObjectURL(blob);
    document.getElementById('result').src = url;
    document.querySelector('.left .rating').style.display = 'flex';
})

// Mosrtar la imagen original, que será la que se subirá al server
document.getElementById('image').addEventListener('change', function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const img = document.getElementById('preview');
        img.src = e.target.result;
        img.style.display = 'block';
    };

    if (file) {
        reader.readAsDataURL(file);
    }
});

// Enviar los datos del formulario
document.querySelector('form').addEventListener('submit', async e => {
    e.preventDefault();

    //Obtener la imagen como archivo
    const file = document.getElementById('image').files[0];

    //Si la imagen no ha sido subida, subirla, si ya ha sido subida, enviar solo el prompt
    document.getElementById('result').src == window.location.href ? upload().then(async () => { await sendPrompt() }) : sendPrompt();

    // Subir la imagen
    async function upload() {
        console.log('SUBIENDO IMAGEN')
        const formData = new FormData();
        formData.append('image', file);

        let response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

    }

    //Enviar el prompt
    async function sendPrompt() {
        const prompt = document.getElementById('prompt').value;

        mostRecentPrompt = prompt;

        //Enviar los datos al servidor (subir la imagen con multer)

        res = await fetch('/prompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });

        res = await res.text();
        console.log(res);
    }

})


// Ratings

// Comprobar si los botones de rating existen

const ratingButtons = document.querySelectorAll('.rating button');

ratingButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
        let info;

        if(e.target.id == 'ok') {
            info = {
                rating: 1,
                prompt: mostRecentPrompt,
                result: mostRecentResult,
                comment: 'OK'
            }
        } else {
            let com = prompt('¿Qué esperabas que la IA hiciese?')
            info = {
                rating: 0,
                prompt: mostRecentPrompt,
                result: mostRecentResult,
                comment: "'"+com + "' was expected for prompt: '" + mostRecentPrompt + "', but got code: " + mostRecentResult
            }
        }

        let res = await fetch('/rating', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ info })
        });
    })
})