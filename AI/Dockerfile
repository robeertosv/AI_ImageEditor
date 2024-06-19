FROM python:3.12

WORKDIR /app/AI

RUN pip install pandas pillow scikit-learn pika
RUN pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
RUN pip3 install transformers[torch]

COPY . .

CMD ["python", "service.py"]