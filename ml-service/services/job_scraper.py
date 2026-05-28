"""
Job Scraper Module
===================
Scrapes publicly available internship and job listings
from free job boards and returns structured results.
"""

import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import quote_plus


def scrape_jobs(query: str = "software engineer internship", location: str = "India", max_results: int = 15) -> list:
    """
    Scrape job/internship listings from free job sites.

    Args:
        query: Search query for jobs
        location: Location filter
        max_results: Maximum number of results to return

    Returns:
        List of job dicts with title, company, location, link, source
    """
    results = []

    # Try multiple sources for robustness
    try:
        results.extend(_scrape_remoteok(query, max_results // 2))
    except Exception as e:
        print(f"RemoteOK scrape error: {e}")

    try:
        results.extend(_scrape_github_jobs_alternative(query, max_results // 2))
    except Exception as e:
        print(f"Alternative jobs scrape error: {e}")

    # If scraping fails, return curated fallback listings
    if not results:
        results = _get_fallback_listings(query)

    return results[:max_results]


def _scrape_remoteok(query: str, max_results: int = 10) -> list:
    """Scrape remote jobs from RemoteOK API (free, no auth needed)."""
    results = []

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        url = "https://remoteok.com/api"
        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code == 200:
            data = response.json()
            query_lower = query.lower()

            for job in data[1:]:  # Skip first element (metadata)
                position = job.get("position", "")
                company = job.get("company", "")
                tags = " ".join(job.get("tags", []))

                # Filter by query
                search_text = f"{position} {company} {tags}".lower()
                query_words = query_lower.split()
                if any(word in search_text for word in query_words):
                    results.append({
                        "title": position,
                        "company": company,
                        "location": job.get("location", "Remote"),
                        "link": job.get("url", f"https://remoteok.com"),
                        "salary": job.get("salary_min", "Not disclosed"),
                        "tags": job.get("tags", [])[:5],
                        "source": "RemoteOK",
                        "date": job.get("date", ""),
                        "type": "Remote",
                    })

                if len(results) >= max_results:
                    break

    except Exception as e:
        print(f"RemoteOK error: {e}")

    return results


def _scrape_github_jobs_alternative(query: str, max_results: int = 10) -> list:
    """
    Scrape from a free jobs API alternative.
    Uses the Arbeitnow free jobs API as a fallback.
    """
    results = []

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        url = f"https://www.arbeitnow.com/api/job-board-api"
        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code == 200:
            data = response.json()
            jobs = data.get("data", [])
            query_lower = query.lower()

            for job in jobs:
                title = job.get("title", "")
                company = job.get("company_name", "")
                tags = " ".join(job.get("tags", []))

                search_text = f"{title} {company} {tags}".lower()
                query_words = query_lower.split()
                if any(word in search_text for word in query_words):
                    results.append({
                        "title": title,
                        "company": company,
                        "location": job.get("location", "Not specified"),
                        "link": job.get("url", ""),
                        "salary": "Not disclosed",
                        "tags": job.get("tags", [])[:5],
                        "source": "Arbeitnow",
                        "date": job.get("created_at", ""),
                        "type": "Remote" if job.get("remote", False) else "On-site",
                    })

                if len(results) >= max_results:
                    break

    except Exception as e:
        print(f"Arbeitnow error: {e}")

    return results


def _get_fallback_listings(query: str) -> list:
    """Return curated fallback job listings when scraping fails."""
    fallback_jobs = [
        {
            "title": "Software Developer Intern",
            "company": "TCS Digital",
            "location": "Mumbai, India",
            "link": "https://www.tcs.com/careers",
            "salary": "₹15,000-25,000/month",
            "tags": ["java", "python", "sql"],
            "source": "Curated",
            "date": "Ongoing",
            "type": "On-site / Hybrid",
        },
        {
            "title": "SDE Intern",
            "company": "Amazon",
            "location": "Bangalore, India",
            "link": "https://www.amazon.jobs",
            "salary": "₹80,000-1,00,000/month",
            "tags": ["dsa", "java", "system design"],
            "source": "Curated",
            "date": "Rolling",
            "type": "On-site",
        },
        {
            "title": "Technology Analyst Intern",
            "company": "Infosys",
            "location": "Mysore, India",
            "link": "https://www.infosys.com/careers",
            "salary": "₹15,000-20,000/month",
            "tags": ["python", "java", "cloud"],
            "source": "Curated",
            "date": "Ongoing",
            "type": "On-site",
        },
        {
            "title": "Full Stack Developer Intern",
            "company": "Flipkart",
            "location": "Bangalore, India",
            "link": "https://www.flipkartcareers.com",
            "salary": "₹60,000-80,000/month",
            "tags": ["react", "node.js", "mongodb"],
            "source": "Curated",
            "date": "Rolling",
            "type": "Hybrid",
        },
        {
            "title": "Data Science Intern",
            "company": "Mu Sigma",
            "location": "Bangalore, India",
            "link": "https://www.mu-sigma.com/careers",
            "salary": "₹25,000-40,000/month",
            "tags": ["python", "machine learning", "statistics"],
            "source": "Curated",
            "date": "Quarterly",
            "type": "On-site",
        },
        {
            "title": "Backend Developer Intern",
            "company": "Razorpay",
            "location": "Bangalore, India",
            "link": "https://razorpay.com/careers",
            "salary": "₹50,000-70,000/month",
            "tags": ["golang", "python", "microservices"],
            "source": "Curated",
            "date": "Rolling",
            "type": "Hybrid",
        },
        {
            "title": "Cloud Engineer Intern",
            "company": "Google",
            "location": "Hyderabad, India",
            "link": "https://careers.google.com",
            "salary": "₹80,000-1,20,000/month",
            "tags": ["gcp", "python", "kubernetes"],
            "source": "Curated",
            "date": "Annual",
            "type": "On-site",
        },
        {
            "title": "Associate Developer",
            "company": "Wipro",
            "location": "Pune, India",
            "link": "https://careers.wipro.com",
            "salary": "₹3.5-4.5 LPA",
            "tags": ["java", "sql", "agile"],
            "source": "Curated",
            "date": "Ongoing",
            "type": "On-site",
        },
        {
            "title": "ML Engineer Intern",
            "company": "Microsoft",
            "location": "Hyderabad, India",
            "link": "https://careers.microsoft.com",
            "salary": "₹70,000-1,00,000/month",
            "tags": ["python", "pytorch", "azure ml"],
            "source": "Curated",
            "date": "Rolling",
            "type": "Hybrid",
        },
        {
            "title": "DevOps Intern",
            "company": "Atlassian",
            "location": "Bangalore, India",
            "link": "https://www.atlassian.com/company/careers",
            "salary": "₹60,000-80,000/month",
            "tags": ["docker", "kubernetes", "ci/cd"],
            "source": "Curated",
            "date": "Annual",
            "type": "Remote",
        },
    ]

    return fallback_jobs
