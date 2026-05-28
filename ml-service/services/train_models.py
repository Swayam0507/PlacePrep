"""
Standalone Training Script
===========================
Run this script to train all ML models and display metrics.

Usage:
    cd ml-service
    python services/train_models.py
"""

import sys
import os

# Add parent directory to path so we can import services
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.predictor import generate_synthetic_data, train_all_models


def main():
    print("=" * 60)
    print("  Smart Placement Platform — ML Model Training")
    print("=" * 60)

    # Generate data
    print("\n📊 Generating synthetic training data (1500 samples)...")
    data = generate_synthetic_data(n_samples=1500)

    print(f"\n  Dataset Shape: {data.shape}")
    print(f"  Placed: {data['placed'].sum()} ({data['placed'].mean()*100:.1f}%)")
    print(f"  Not Placed: {(data['placed'] == 0).sum()} ({(1-data['placed'].mean())*100:.1f}%)")

    print("\n📈 Feature Statistics:")
    print(data.describe().round(2).to_string())

    # Train models
    print("\n\n🚀 Training 4 classifiers...")
    results = train_all_models(data)

    # Summary
    print("\n" + "=" * 60)
    print("  TRAINING SUMMARY")
    print("=" * 60)
    print(f"\n  {'Model':<20} {'Accuracy':>10} {'Precision':>10} {'Recall':>10} {'F1':>10}")
    print("  " + "-" * 62)

    for name, metrics in results.items():
        display_name = name.replace("_", " ").title()
        print(
            f"  {display_name:<20} "
            f"{metrics['accuracy']:>9.2f}% "
            f"{metrics['precision']:>9.2f}% "
            f"{metrics['recall']:>9.2f}% "
            f"{metrics['f1_score']:>9.2f}%"
        )

    print("\n✅ All models saved successfully!")
    print("   Models are ready for prediction via POST /api/ml/predict/")

    # Quick test prediction
    print("\n\n🔮 Quick Test Prediction:")
    from services.predictor import predict

    test_input = {
        "cgpa": 8.5,
        "aptitude_score": 78,
        "coding_score": 85,
        "communication_score": 70,
        "attendance": 90,
        "projects_count": 5,
        "internships_count": 2,
    }

    result = predict(test_input)
    print(f"\n  Input: {test_input}")
    print(f"  Placement Probability: {result['placement_probability']}%")
    print(f"  Prediction: {result['prediction']}")
    print(f"\n  Per-Model Results:")
    for name, model_result in result["model_results"].items():
        print(f"    {model_result['model_name']}: {model_result['probability']}% ({model_result['prediction']})")

    return results


if __name__ == "__main__":
    main()
