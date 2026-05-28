from django.urls import path
from . import views

urlpatterns = [
    path("health/", views.health_check, name="health_check"),
    path("ml/predict/", views.predict_placement, name="predict_placement"),
    path("jobs/recommend/", views.recommend_jobs, name="recommend_jobs"),
    path("jobs/scrape/", views.scrape_jobs, name="scrape_jobs"),
]
