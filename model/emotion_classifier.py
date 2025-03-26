import torch
import torch.nn as nn

class ConvBlock(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size, stride, padding):
        super().__init__()
        
        self.conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size, stride, padding),
            nn.ReLU(inplace=True),
            nn.LocalResponseNorm(size=5, alpha=1e-4, beta=0.75, k=2),
            nn.MaxPool2d(kernel_size=3, stride=2) # overlapping max pooling
        )
    
    def forward(self, x):
        return self.conv(x)

class LinearBlock(nn.Module):
    def __init__(self, in_features, out_features):
        super().__init__()

        self.linear = nn.Sequential(
            nn.Dropout(),
            nn.Linear(in_features, out_features),
            nn.ReLU(inplace=True)
        )
    
    def forward(self, x):
        return self.linear(x)

class AlexNet(nn.Module):
    def __init__(self, num_classes):
        super().__init__()
        
        self.features = nn.Sequential(
            ConvBlock(in_channels=1, out_channels=32, kernel_size=5, stride=1, padding=2),
            ConvBlock(in_channels=32, out_channels=128, kernel_size=5, stride=1, padding=2),
            
            nn.Conv2d(in_channels=128, out_channels=256, kernel_size=3, stride=1, padding=1),
            nn.ReLU(inplace=True),

            nn.Conv2d(in_channels=256, out_channels=256, kernel_size=3, stride=1, padding=1),
            nn.ReLU(inplace=True),
            
            nn.Conv2d(in_channels=256, out_channels=256, kernel_size=3, stride=1, padding=1),
            nn.ReLU(inplace=True),
            
            nn.MaxPool2d(kernel_size=3, stride=2)
        )

        self.avgpool = nn.AvgPool2d((2, 2))

        self.classifier = nn.Sequential(
            LinearBlock(1024, 128),
            LinearBlock(128, 128),
            LinearBlock(128, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = self.avgpool(x)
        x = self.classifier(torch.flatten(x, 1))

        return x