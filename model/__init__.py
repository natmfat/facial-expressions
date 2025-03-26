from model.emotion_classifier import AlexNet
import numpy as np
import torch
import torch.nn.functional as F

device = torch.device("cpu")
emotions_count = 7

# load model
model_state = torch.load("./model/emotion_classifier.pt", map_location=device)
model = AlexNet(emotions_count)
model.load_state_dict(model_state)
model.eval()

# inference
def predict(img: str):
    try:
        img = np.fromstring(img, dtype=int, sep=" ")
        img = torch.from_numpy(img).view(-1, 1, 48, 48).type(torch.float32) / 255. 
        result = F.softmax(model(img), dim=1)
        return result.tolist()[0]
    except Exception as e:
        print(e)
        return None