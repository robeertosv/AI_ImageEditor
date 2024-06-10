<<<<<<< HEAD
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
import torch

# Cargar el modelo entrenado y el tokenizer
model = DistilBertForSequenceClassification.from_pretrained('./AI/trained_model')
tokenizer = DistilBertTokenizerFast.from_pretrained('./AI/trained_model')

def predict_action(prompt):
    print("Starting to predict", prompt)
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, padding=True)
    outputs = model(**inputs)
    probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
    predicted_class = torch.argmax(probs, dim=-1).item()
    return predicted_class

# Ejemplo de uso
#prompt = "Haz que la imagen esté en blanco y negro"
#action = predict_action(prompt)
#print(f"Predicted action: {action}")
=======
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
import torch

# Cargar el modelo entrenado y el tokenizer
model = DistilBertForSequenceClassification.from_pretrained('./AI/trained_model')
tokenizer = DistilBertTokenizerFast.from_pretrained('./AI/trained_model')

def predict_action(prompt):
    print("Starting to predict", prompt)
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, padding=True)
    outputs = model(**inputs)
    probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
    predicted_class = torch.argmax(probs, dim=-1).item()
    return predicted_class

# Ejemplo de uso
#prompt = "Haz que la imagen esté en blanco y negro"
#action = predict_action(prompt)
#print(f"Predicted action: {action}")
>>>>>>> d2aab1ef5b14bdc0c399f32b737df35219010fb8
