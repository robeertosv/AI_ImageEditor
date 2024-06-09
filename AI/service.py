import pika
import sys
import os
import inference
from PIL import Image, ImageFilter

lookup = ["bn", "color", "blur"]


def main():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host='localhost'))
    channel = connection.channel()

    channel.queue_declare(queue='prompt')

    def callback(ch, method, properties, body):
        # Hacer print del mensaje
        prompt = body.decode('utf-8')

        num = inference.predict_action(prompt)
        print("Resultado de la prediccion: ", num)
        num = int(num)

        if (lookup[num] == "blur"):
            blurImage()
        elif lookup[num] == "bn":
            BN()

    channel.basic_consume(
        queue='prompt', on_message_callback=callback, auto_ack=True)

    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()


def BN():
    try:
        # Abrir la imagen
        img = Image.open(
            'C:\\Users\\Roberto\\PycharmProjects\\AI_ImageEditor\\uploads\\image.png')

        # Convertir la imagen a escala de grises
        bw_img = img.convert('L')

        # Sobrescribir la imagen original
        bw_img.save(
            'C:\\Users\\Roberto\\PycharmProjects\\AI_ImageEditor\\uploads\\image.png')
        sendStatus()
    except Exception as e:
        print(f"Error al procesar la imagen: {e}")


def blurImage():
    try:
        # Obtener path

        img = Image.open(
            'C:\\Users\\Roberto\\PycharmProjects\\AI_ImageEditor\\uploads\\image.png')
        blurred = img.filter(ImageFilter.GaussianBlur(5))
        blurred.save(
            'C:\\Users\\Roberto\\PycharmProjects\\AI_ImageEditor\\uploads\\image.png')
        sendStatus()

    except Exception as e:
        print(e)


def sendStatus():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host='localhost'))

    channel = connection.channel()

    channel.queue_declare(queue='result')

    channel.basic_publish(exchange='', routing_key='result', body='done')
    print(" [x] Editing complete'")
    connection.close()


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
