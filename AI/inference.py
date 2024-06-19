from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
import torch, sys

# Cargar el modelo entrenado y el tokenizer

def predict_action(prompt):
    #model = DistilBertForSequenceClassification.from_pretrained('/app/trained_model')
    #tokenizer = DistilBertTokenizerFast.from_pretrained('/app/trained_model')
    
    path = img_path = sys.path[0] + '\\trained_model' # Use if Local
    
    model = DistilBertForSequenceClassification.from_pretrained(path)
    tokenizer = DistilBertTokenizerFast.from_pretrained(path)

    print("Starting to predict", prompt)
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, padding=True)
    outputs = model(**inputs)
    probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
    predicted_class = torch.argmax(probs, dim=-1).item()
    return predicted_class

# Ejemplo de uso
prompt = "Haz que la imagen esté en blanco y negro"
action = predict_action(prompt)
print(f"Predicted action: {action}")
