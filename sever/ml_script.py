import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import accuracy_score
import json
import sys
import os

def run_ml(csv_path):
    df = pd.read_csv(csv_path)
    
    # Preprocessing (similar to node logic for consistency)
    # Fill missing
    df['Age'] = df['Age'].fillna(df['Age'].median())
    for col in ['RoomService', 'FoodCourt', 'ShoppingMall', 'Spa', 'VRDeck']:
        df[col] = df[col].fillna(0)
    
    df['HomePlanet'] = df['HomePlanet'].fillna(df['HomePlanet'].mode()[0])
    df['CryoSleep'] = df['CryoSleep'].fillna(df['CryoSleep'].mode()[0]).astype(bool)
    df['Destination'] = df['Destination'].fillna(df['Destination'].mode()[0])
    df['VIP'] = df['VIP'].fillna(df['VIP'].mode()[0]).astype(bool)
    
    # Engineering
    df['TotalSpent'] = df[['RoomService', 'FoodCourt', 'ShoppingMall', 'Spa', 'VRDeck']].sum(axis=1)
    df['SpendingFlag'] = df['TotalSpent'] > 0
    
    df['GroupSize'] = df['PassengerId'].apply(lambda x: x.split('_')[0]).map(df['PassengerId'].apply(lambda x: x.split('_')[0]).value_counts())
    
    df['Deck'] = df['Cabin'].str.split('/').str[0].fillna('Unknown')
    df['Side'] = df['Cabin'].str.split('/').str[2].fillna('Unknown')
    
    # Encoding
    cat_cols = ['HomePlanet', 'CryoSleep', 'Destination', 'VIP', 'SpendingFlag', 'Deck', 'Side']
    X = pd.get_dummies(df[['Age', 'TotalSpent', 'GroupSize'] + cat_cols], columns=cat_cols)
    y = df['Transported'].astype(bool)
    
    # 1. Feature Importance with RF
    rf_rank = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_rank.fit(X, y)
    
    importances = []
    for name, imp in zip(X.columns, rf_rank.feature_importances_):
        importances.append({"feature": name, "importance": float(imp)})
    importances = sorted(importances, key=lambda x: x['importance'], reverse=True)
    
    # 2. Model Comparison
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000),
        "Random Forest": RandomForestClassifier(n_estimators=100),
        "Gradient Boosting": GradientBoostingClassifier(),
        "SVM": SVC()
    }
    
    metrics = []
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    for name, model in models.items():
        # CV Score
        cv_scores = cross_val_score(model, X, y, cv=5)
        
        # Accuracy
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        
        metrics.append({
            "model": name,
            "accuracy": float(acc),
            "cv_score": float(cv_scores.mean())
        })
    
    # Suggested subset based on top importance
    top_feats = [imp['feature'] for imp in importances[:5]]
    
    result = {
        "importances": importances,
        "metrics": metrics,
        "suggestedFeatures": top_feats
    }
    print(json.dumps(result))

if __name__ == "__main__":
    csv_file = sys.argv[1]
    run_ml(csv_file)
