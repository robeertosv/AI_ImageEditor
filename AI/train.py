import pandas as pd
from sklearn.model_selection import train_test_split
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification, Trainer, TrainingArguments
import torch


datos = pd.read_csv('./AI/dataset.csv')

prompts = []
labels = []

for i in range(len(datos['prompt'])):
    prompts.append(datos['prompt'][i])
    labels.append(datos['label'][i])

# Cargar datos
data = pd.DataFrame({
    "prompt": prompts,
    "label": labels
})

# Dividir los datos en entrenamiento y validación
train_texts, val_texts, train_labels, val_labels = train_test_split(data['prompt'].tolist(), data['label'].tolist(), test_size=0.2) #0.2

# Cargar el tokenizer y el modelo
tokenizer = DistilBertTokenizerFast.from_pretrained('distilbert-base-uncased')
model = DistilBertForSequenceClassification.from_pretrained('distilbert-base-uncased', num_labels=3)

# Tokenizar los textos
train_encodings = tokenizer(train_texts, truncation=True, padding=True)
val_encodings = tokenizer(val_texts, truncation=True, padding=True)

# Convertir a un formato de Dataset
class PromptDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.labels)

train_dataset = PromptDataset(train_encodings, train_labels)
val_dataset = PromptDataset(val_encodings, val_labels)

# Configurar el entrenamiento
training_args = TrainingArguments(
    output_dir='./results',
    num_train_epochs=3,
    per_device_train_batch_size=3,
    per_device_eval_batch_size=3,
    warmup_steps=100,
    weight_decay=0.01,
    logging_dir='./logs',
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
)

# Entrenar el modelo
trainer.train()

# Guardar el modelo entrenado
model.save_pretrained('./trained_model')
tokenizer.save_pretrained('./trained_model')