import pika
import sys
import os
import inference
from PIL import Image, ImageFilter, ImageEnhance

lookup = ["bn", "contrast", "blur", "bright"]
img_path = sys.path[0] + '\\..\\' +'uploads\\image.png' # Use if Local
#img_path = '/app/uploads/image.png' # Use if Docker

# Use if Docker
#credentials = pika.PlainCredentials('user', 'password')
#connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq', port=5672, virtual_host='/', credentials=credentials))

# Use if Local
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()


def main():
    channel.queue_declare(queue='prompt')

    def callback(ch, method, properties, body):
        # Hacer print del mensaje
        prompt = body.decode('utf-8')
        
        if(prompt == "RETRAIN"):
            import train
            import multiprocessing
            p = multiprocessing.Process(target=train.trainModel)
            p.start()
            
        else:
            num = inference.predict_action(prompt)
            print("Resultado de la prediccion: ", num)
            num = int(num)

            if (lookup[num] == "blur"):
                blurImage()
            elif lookup[num] == "bn":
                BN()
            elif lookup[num] == "contrast":
                contraste()
            elif lookup[num] == "bright":
                brillo()
                

    channel.basic_consume(
        queue='prompt', on_message_callback=callback, auto_ack=True)

    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()

def contraste():
    try:
        im = Image.open(img_path) 
    
        enh = ImageEnhance.Contrast(im)  
        im = enh.enhance(1.8)
        im.save(img_path)
        sendStatus(1)
    except:
        print("Error al procesar la imagen")

def brillo():
    try:
        imagen = Image.open(img_path)
        enhancer = ImageEnhance.Brightness(imagen)
        factor = 1.5  # Puedes ajustar este valor para aumentar más o menos el brillo
        imagen_bril = enhancer.enhance(factor)

        # Guardar la imagen resultante
        imagen_bril.save(img_path)
        sendStatus(3)
    except:
        print("Error al procesar la imagen")
        
def BN():
    try:
        # Abrir la imagen
        img = Image.open(img_path)

        # Convertir la imagen a escala de grises
        bw_img = img.convert('L')

        # Sobrescribir la imagen original
        bw_img.save(img_path)
        sendStatus(0)
    except Exception as e:
        print(f"Error al procesar la imagen: {e}")
        #print stack trace
        print(e.with_traceback)


def blurImage():
    try:
        # Obtener path

        img = Image.open(img_path)
        blurred = img.filter(ImageFilter.GaussianBlur(5))
        blurred.save(img_path)
        sendStatus(2)

    except Exception as e:
        print(e)


def sendStatus(code:int):
    channel.queue_declare(queue='result')

    channel.basic_publish(exchange='', routing_key='result', body=str(code))
    print(" [x] Editing complete'")


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
