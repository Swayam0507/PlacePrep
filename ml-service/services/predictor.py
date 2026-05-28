"""
Placement Prediction ML Module
================================
Uses 4 classifiers to predict placement probability:
  - RandomForestClassifier
  - DecisionTreeClassifier
  - SVC (Support Vector Machine)
  - KNeighborsClassifier (KNN)

Features:
  - cgpa (0-10)
  - aptitude_score (0-100)
  - coding_score (0-100)
  - communication_score (0-100)
  - attendance (0-100)
  - projects_count (0-20)
  - internships_count (0-10)
"""

import os
import numpy as np
import pandas as pd
import joblib
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    classification_report,
    precision_score,
    recall_score,
    f1_score,
)

# Directory to save/load models
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "ml_models" / "saved"

FEATURE_NAMES = [
    "cgpa",
    "aptitude_score",
    "coding_score",
    "communication_score",
    "attendance",
    "projects_count",
    "internships_count",
]

MODEL_CONFIGS = {
    "random_forest": {
        "class": RandomForestClassifier,
        "params": {
            "n_estimators": 200,
            "max_depth": 12,
            "min_samples_split": 5,
            "min_samples_leaf": 2,
            "random_state": 42,
            "n_jobs": -1,
        },
    },
    "decision_tree": {
        "class": DecisionTreeClassifier,
        "params": {
            "max_depth": 10,
            "min_samples_split": 5,
            "min_samples_leaf": 3,
            "random_state": 42,
        },
    },
    "svm": {
        "class": SVC,
        "params": {
            "kernel": "rbf",
            "C": 1.0,
            "gamma": "scale",
            "probability": True,
            "random_state": 42,
        },
    },
    "knn": {
        "class": KNeighborsClassifier,
        "params": {
            "n_neighbors": 7,
            "weights": "distance",
            "metric": "minkowski",
            "n_jobs": -1,
        },
    },
}


def generate_synthetic_data(n_samples=1500, random_state=42):
    """
    Generate realistic synthetic placement data.
    Label logic: weighted combination of features determines placement.
    """
    np.random.seed(random_state)

    # --- Generate features with realistic distributions ---
    cgpa = np.clip(np.random.normal(7.0, 1.5, n_samples), 2.0, 10.0)
    aptitude_score = np.clip(np.random.normal(60, 18, n_samples), 5, 100)
    coding_score = np.clip(np.random.normal(55, 20, n_samples), 0, 100)
    communication_score = np.clip(np.random.normal(60, 15, n_samples), 10, 100)
    attendance = np.clip(np.random.normal(75, 12, n_samples), 20, 100)
    projects_count = np.clip(np.random.poisson(3, n_samples), 0, 20).astype(float)
    internships_count = np.clip(np.random.poisson(1, n_samples), 0, 10).astype(float)

    # --- Compute placement score (weighted formula) ---
    placement_score = (
        cgpa * 10 * 0.20          # CGPA weight: 20%
        + aptitude_score * 0.20   # Aptitude weight: 20%
        + coding_score * 0.25     # Coding weight: 25%
        + communication_score * 0.15  # Communication weight: 15%
        + attendance * 0.05       # Attendance weight: 5%
        + projects_count * 3 * 0.10   # Projects weight: 10%
        + internships_count * 5 * 0.05  # Internships weight: 5%
    )

    # Add noise for realism
    noise = np.random.normal(0, 5, n_samples)
    placement_score += noise

    # Threshold: top ~55% get placed
    threshold = np.percentile(placement_score, 45)
    placed = (placement_score >= threshold).astype(int)

    data = pd.DataFrame({
        "cgpa": np.round(cgpa, 2),
        "aptitude_score": np.round(aptitude_score, 1),
        "coding_score": np.round(coding_score, 1),
        "communication_score": np.round(communication_score, 1),
        "attendance": np.round(attendance, 1),
        "projects_count": projects_count.astype(int),
        "internships_count": internships_count.astype(int),
        "placed": placed,
    })

    return data


def train_all_models(data=None):
    """
    Train all 4 classifiers and save them along with the scaler.
    Returns a dict with accuracy metrics for each model.
    """
    if data is None:
        data = generate_synthetic_data()

    X = data[FEATURE_NAMES].values
    y = data["placed"].values

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Preprocessing — scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Ensure save directory exists
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    # Save scaler
    joblib.dump(scaler, MODELS_DIR / "scaler.joblib")

    results = {}

    for name, config in MODEL_CONFIGS.items():
        print(f"\n{'='*50}")
        print(f"Training: {name.upper()}")
        print(f"{'='*50}")

        model = config["class"](**config["params"])
        model.fit(X_train_scaled, y_train)

        # Predictions
        y_pred = model.predict(X_test_scaled)

        # Metrics
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        cm = confusion_matrix(y_test, y_pred)
        report = classification_report(y_test, y_pred, output_dict=True)

        print(f"Accuracy:  {acc:.4f}")
        print(f"Precision: {prec:.4f}")
        print(f"Recall:    {rec:.4f}")
        print(f"F1-Score:  {f1:.4f}")
        print(f"Confusion Matrix:\n{cm}")
        print(classification_report(y_test, y_pred))

        # Save model
        joblib.dump(model, MODELS_DIR / f"{name}.joblib")

        results[name] = {
            "accuracy": round(acc * 100, 2),
            "precision": round(prec * 100, 2),
            "recall": round(rec * 100, 2),
            "f1_score": round(f1 * 100, 2),
            "confusion_matrix": cm.tolist(),
            "classification_report": report,
        }

    # Save metadata
    joblib.dump(
        {"feature_names": FEATURE_NAMES, "models": list(MODEL_CONFIGS.keys())},
        MODELS_DIR / "metadata.joblib",
    )

    print(f"\n✅ All models trained and saved to {MODELS_DIR}")
    return results


def load_models():
    """Load all trained models and scaler from disk."""
    if not MODELS_DIR.exists():
        raise FileNotFoundError(
            f"Models directory not found: {MODELS_DIR}. Run training first."
        )

    scaler = joblib.load(MODELS_DIR / "scaler.joblib")

    models = {}
    for name in MODEL_CONFIGS.keys():
        model_path = MODELS_DIR / f"{name}.joblib"
        if model_path.exists():
            models[name] = joblib.load(model_path)

    if not models:
        raise FileNotFoundError("No trained models found. Run training first.")

    return models, scaler


def predict(input_data: dict) -> dict:
    """
    Make placement prediction using all 4 models (ensemble).

    Args:
        input_data: dict with keys matching FEATURE_NAMES

    Returns:
        dict with placement_probability, recommendation, and per-model results
    """
    # Validate input
    for feature in FEATURE_NAMES:
        if feature not in input_data:
            raise ValueError(f"Missing required feature: {feature}")

    # Prepare feature vector
    features = np.array([[input_data[f] for f in FEATURE_NAMES]])

    # Load models
    models, scaler = load_models()

    # Scale features
    features_scaled = scaler.transform(features)

    # Get predictions from each model
    model_results = {}
    probabilities = []

    for name, model in models.items():
        prediction = model.predict(features_scaled)[0]

        # Get probability if available
        if hasattr(model, "predict_proba"):
            proba = model.predict_proba(features_scaled)[0]
            prob_placed = round(float(proba[1]) * 100, 2)
        else:
            prob_placed = 100.0 if prediction == 1 else 0.0

        probabilities.append(prob_placed)

        display_name = name.replace("_", " ").title()
        model_results[name] = {
            "model_name": display_name,
            "prediction": "Placed" if prediction == 1 else "Not Placed",
            "probability": prob_placed,
        }

    # Ensemble: weighted average of probabilities
    weights = {
        "random_forest": 0.35,
        "decision_tree": 0.15,
        "svm": 0.30,
        "knn": 0.20,
    }

    ensemble_probability = sum(
        model_results[name]["probability"] * weights.get(name, 0.25)
        for name in model_results
    )
    ensemble_probability = round(ensemble_probability, 2)

    # Generate recommendation
    recommendation = _generate_recommendation(input_data, ensemble_probability)

    return {
        "placement_probability": ensemble_probability,
        "prediction": "Placed" if ensemble_probability >= 50 else "Not Placed",
        "recommendation": recommendation,
        "model_results": model_results,
        "input_summary": input_data,
    }


def _generate_recommendation(input_data: dict, probability: float) -> str:
    """Generate a personalized recommendation based on scores."""
    weak_areas = []
    strong_areas = []

    # Evaluate each metric
    if input_data.get("cgpa", 0) < 6.5:
        weak_areas.append("CGPA (aim for 7.0+)")
    elif input_data.get("cgpa", 0) >= 8.0:
        strong_areas.append("CGPA")

    if input_data.get("aptitude_score", 0) < 50:
        weak_areas.append("Aptitude Skills (practice quantitative & logical reasoning)")
    elif input_data.get("aptitude_score", 0) >= 75:
        strong_areas.append("Aptitude")

    if input_data.get("coding_score", 0) < 50:
        weak_areas.append("Coding Skills (practice DSA on LeetCode/HackerRank)")
    elif input_data.get("coding_score", 0) >= 75:
        strong_areas.append("Coding")

    if input_data.get("communication_score", 0) < 50:
        weak_areas.append("Communication (join a public speaking club, practice mock interviews)")
    elif input_data.get("communication_score", 0) >= 75:
        strong_areas.append("Communication")

    if input_data.get("attendance", 0) < 60:
        weak_areas.append("Attendance (maintain 75%+ for eligibility)")

    if input_data.get("projects_count", 0) < 2:
        weak_areas.append("Projects (build 2-3 solid projects with real-world impact)")
    elif input_data.get("projects_count", 0) >= 4:
        strong_areas.append("Projects")

    if input_data.get("internships_count", 0) == 0:
        weak_areas.append("Internships (seek at least 1 industry internship)")
    elif input_data.get("internships_count", 0) >= 2:
        strong_areas.append("Internship Experience")

    # Build recommendation text
    parts = []

    if probability >= 80:
        parts.append("🎉 Excellent! You have a very strong placement profile.")
    elif probability >= 60:
        parts.append("👍 Good profile! You have a solid chance at placement with some improvements.")
    elif probability >= 40:
        parts.append("⚡ Moderate profile. Focused improvement in key areas can significantly boost your chances.")
    else:
        parts.append("📚 Your profile needs significant improvement. Start working on the areas below immediately.")

    if strong_areas:
        parts.append(f"\n\n✅ Strong Areas: {', '.join(strong_areas)}")

    if weak_areas:
        parts.append(f"\n\n🔧 Areas to Improve:\n" + "\n".join(f"  • {area}" for area in weak_areas))

    if probability < 60:
        parts.append("\n\n💡 Tip: Focus on coding skills and aptitude first — they carry the highest weight in placement selection.")

    return "".join(parts)
