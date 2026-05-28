from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import traceback


@api_view(["GET"])
def health_check(request):
    """Health check endpoint for the ML microservice."""
    return Response(
        {
            "status": "ok",
            "service": "Smart Placement Platform — ML Service",
            "version": "1.0.0",
        }
    )


@api_view(["POST"])
def predict_placement(request):
    """
    Placement prediction endpoint.
    Expects JSON body with:
      cgpa, aptitude_score, coding_score, communication_score,
      attendance, projects_count, internships_count
    """
    try:
        data = request.data

        # Validate required fields
        required_fields = [
            "cgpa", "aptitude_score", "coding_score",
            "communication_score", "attendance",
            "projects_count", "internships_count",
        ]

        missing = [f for f in required_fields if f not in data]
        if missing:
            return Response(
                {"error": f"Missing required fields: {', '.join(missing)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Convert to float
        input_data = {}
        for field in required_fields:
            try:
                input_data[field] = float(data[field])
            except (ValueError, TypeError):
                return Response(
                    {"error": f"Invalid value for {field}: must be a number"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Validate ranges
        validations = {
            "cgpa": (0, 10),
            "aptitude_score": (0, 100),
            "coding_score": (0, 100),
            "communication_score": (0, 100),
            "attendance": (0, 100),
            "projects_count": (0, 20),
            "internships_count": (0, 10),
        }

        for field, (min_val, max_val) in validations.items():
            if not (min_val <= input_data[field] <= max_val):
                return Response(
                    {"error": f"{field} must be between {min_val} and {max_val}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Run prediction
        from services.predictor import predict
        result = predict(input_data)

        return Response({
            "success": True,
            "data": result,
        })

    except FileNotFoundError as e:
        return Response(
            {"error": f"Models not trained yet. {str(e)}"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except Exception as e:
        traceback.print_exc()
        return Response(
            {"error": f"Prediction failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def recommend_jobs(request):
    """
    Job recommendation endpoint.
    Expects JSON body with:
      skills: list of strings
      scores: dict with cgpa, aptitude_score, coding_score, communication_score
    """
    try:
        data = request.data
        skills = data.get("skills", [])
        scores = data.get("scores", {})

        if not skills and not scores:
            return Response(
                {"error": "Provide at least 'skills' (list) or 'scores' (dict)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from services.job_recommender import recommend_jobs as get_recommendations
        recommendations = get_recommendations(skills=skills, scores=scores, top_n=15)

        return Response({
            "success": True,
            "count": len(recommendations),
            "recommendations": recommendations,
        })

    except Exception as e:
        traceback.print_exc()
        return Response(
            {"error": f"Recommendation failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def scrape_jobs(request):
    """
    Job scraping endpoint.
    Query params:
      query: search term (default: "software engineer internship")
      location: location filter (default: "India")
      limit: max results (default: 15)
    """
    try:
        query = request.query_params.get("query", "software engineer internship")
        location = request.query_params.get("location", "India")
        limit = int(request.query_params.get("limit", 15))

        from services.job_scraper import scrape_jobs as scrape
        jobs = scrape(query=query, location=location, max_results=limit)

        return Response({
            "success": True,
            "count": len(jobs),
            "query": query,
            "jobs": jobs,
        })

    except Exception as e:
        traceback.print_exc()
        return Response(
            {"error": f"Scraping failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
