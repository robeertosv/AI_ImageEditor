const socket = io();

socket.on('result', async (data) => {
    console.log("He recibido un mensaje: ", data)

    let res = await fetch('/image');
    let blob = await res.blob();
    let url = URL.createObjectURL(blob);
    document.getElementById('result').src = url;
})

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

document.querySelector('form').addEventListener('submit', async e => {
    e.preventDefault();

    //Obtener la imagen como archivo
    const file = document.getElementById('image').files[0];

    document.getElementById('result').src == window.location.href ? upload().then(async () => { await sendPrompt() }) : sendPrompt();

    async function upload() {
        const formData = new FormData();
        formData.append('image', file);

        let response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

    }

    async function sendPrompt() {
        const prompt = document.getElementById('prompt').value;

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