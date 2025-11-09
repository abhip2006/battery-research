"""
Rate limiting for the Battery Intelligence Platform API
"""
from datetime import datetime, timedelta
from typing import Dict, Optional
from fastapi import HTTPException, status, Request, Response
from fastapi.responses import JSONResponse
import time
from collections import defaultdict
from threading import Lock

from .auth import api_key_manager


class RateLimiter:
    """
    Token bucket rate limiter implementation

    Supports different rate limits per API tier:
    - Free: 100 requests/hour
    - Standard: 1,000 requests/hour
    - Enterprise: 10,000 requests/hour
    """

    # Rate limits per tier (requests per hour)
    TIER_LIMITS = {
        "free": 100,
        "standard": 1000,
        "enterprise": 10000
    }

    def __init__(self):
        # Storage format: {api_key: {"count": int, "reset_time": datetime}}
        self._buckets: Dict[str, dict] = defaultdict(self._create_bucket)
        self._lock = Lock()

    @staticmethod
    def _create_bucket() -> dict:
        """Create a new rate limit bucket"""
        return {
            "count": 0,
            "reset_time": datetime.utcnow() + timedelta(hours=1)
        }

    def _get_limit(self, tier: str) -> int:
        """Get rate limit for a tier"""
        return self.TIER_LIMITS.get(tier, self.TIER_LIMITS["free"])

    def _reset_if_needed(self, api_key: str):
        """Reset bucket if time window has passed"""
        bucket = self._buckets[api_key]
        if datetime.utcnow() >= bucket["reset_time"]:
            bucket["count"] = 0
            bucket["reset_time"] = datetime.utcnow() + timedelta(hours=1)

    def check_rate_limit(self, api_key: str, tier: str) -> dict:
        """
        Check if request is within rate limit

        Args:
            api_key: The API key making the request
            tier: The tier of the API key

        Returns:
            Dict with rate limit information

        Raises:
            HTTPException: If rate limit is exceeded
        """
        with self._lock:
            self._reset_if_needed(api_key)

            bucket = self._buckets[api_key]
            limit = self._get_limit(tier)

            # Check if limit exceeded
            if bucket["count"] >= limit:
                reset_in = int((bucket["reset_time"] - datetime.utcnow()).total_seconds())
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "error": {
                            "code": "RATE_LIMIT_EXCEEDED",
                            "message": f"Rate limit of {limit} requests per hour exceeded. Try again later."
                        },
                        "rate_limit": {
                            "limit": limit,
                            "remaining": 0,
                            "reset": int(bucket["reset_time"].timestamp()),
                            "reset_in_seconds": reset_in
                        }
                    },
                    headers={
                        "X-RateLimit-Limit": str(limit),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": str(int(bucket["reset_time"].timestamp())),
                        "Retry-After": str(reset_in)
                    }
                )

            # Increment counter
            bucket["count"] += 1

            # Return rate limit info
            return {
                "limit": limit,
                "remaining": limit - bucket["count"],
                "reset": int(bucket["reset_time"].timestamp()),
                "used": bucket["count"]
            }

    def get_rate_limit_info(self, api_key: str, tier: str) -> dict:
        """
        Get current rate limit information without incrementing counter

        Args:
            api_key: The API key
            tier: The tier of the API key

        Returns:
            Dict with rate limit information
        """
        with self._lock:
            self._reset_if_needed(api_key)
            bucket = self._buckets[api_key]
            limit = self._get_limit(tier)

            return {
                "limit": limit,
                "remaining": limit - bucket["count"],
                "reset": int(bucket["reset_time"].timestamp()),
                "used": bucket["count"]
            }


# Global rate limiter instance
rate_limiter = RateLimiter()


async def check_rate_limit(request: Request, response: Response, api_key: str) -> bool:
    """
    FastAPI dependency to check rate limits

    Args:
        request: FastAPI request object
        response: FastAPI response object
        api_key: Validated API key from auth dependency

    Returns:
        True if within rate limit

    Raises:
        HTTPException: If rate limit exceeded
    """
    # Get tier for the API key
    tier = api_key_manager.get_tier(api_key)

    if not tier:
        tier = "free"  # Default to free tier

    # Check rate limit
    rate_info = rate_limiter.check_rate_limit(api_key, tier)

    # Add rate limit headers to response
    response.headers["X-RateLimit-Limit"] = str(rate_info["limit"])
    response.headers["X-RateLimit-Remaining"] = str(rate_info["remaining"])
    response.headers["X-RateLimit-Reset"] = str(rate_info["reset"])

    return True


class RateLimitMiddleware:
    """
    Middleware to add rate limit headers to all responses
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        # Process request through app
        await self.app(scope, receive, send)


# ============================================================================
# STATISTICS AND MONITORING
# ============================================================================

class RateLimitStats:
    """Track and report rate limit statistics"""

    def __init__(self):
        self._stats = defaultdict(lambda: {
            "total_requests": 0,
            "rate_limited": 0,
            "by_tier": defaultdict(int)
        })
        self._lock = Lock()

    def record_request(self, api_key: str, tier: str, rate_limited: bool = False):
        """Record a request for statistics"""
        with self._lock:
            stats = self._stats[api_key]
            stats["total_requests"] += 1
            stats["by_tier"][tier] += 1
            if rate_limited:
                stats["rate_limited"] += 1

    def get_stats(self, api_key: Optional[str] = None) -> dict:
        """Get statistics for an API key or all keys"""
        with self._lock:
            if api_key:
                return dict(self._stats.get(api_key, {}))
            return {k: dict(v) for k, v in self._stats.items()}

    def reset_stats(self, api_key: Optional[str] = None):
        """Reset statistics"""
        with self._lock:
            if api_key:
                if api_key in self._stats:
                    del self._stats[api_key]
            else:
                self._stats.clear()


# Global stats tracker
rate_limit_stats = RateLimitStats()


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

"""
# In main FastAPI app:

from fastapi import FastAPI, Depends
from app.core.auth import get_api_key
from app.core.rate_limit import check_rate_limit, rate_limiter

app = FastAPI()

@app.get("/data")
async def get_data(
    api_key: str = Depends(get_api_key),
    rate_limit: bool = Depends(check_rate_limit)
):
    # Both authentication and rate limiting are checked
    return {"data": "..."}

# Get rate limit info for current user
@app.get("/rate-limit-status")
async def get_rate_limit_status(api_key: str = Depends(get_api_key)):
    tier = api_key_manager.get_tier(api_key)
    info = rate_limiter.get_rate_limit_info(api_key, tier)
    return info
"""
