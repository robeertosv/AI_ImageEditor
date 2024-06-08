from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
import torch

# Cargar el modelo entrenado y el tokenizer
model = DistilBertForSequenceClassification.from_pretrained('./trained_model')
tokenizer = DistilBertTokenizerFast.from_pretrained('./trained_model')

def predict_action(prompt):
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, padding=True)
    outputs = model(**inputs)
    probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
    predicted_class = torch.argmax(probs, dim=-1).item()
    return predicted_class

# Ejemplo de uso
prompt = "Difumina la imágen"
action = predict_action(prompt)
print(f"Predicted action: {action}")
