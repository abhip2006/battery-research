"""
Authentication and authorization for the Battery Intelligence Platform API
"""
from typing import Optional
from fastapi import Header, HTTPException, status
from fastapi.security import APIKeyHeader
import hashlib
import secrets
from datetime import datetime, timedelta


# API Key header scheme
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=True)


class APIKeyManager:
    """Manage API keys and authentication"""

    def __init__(self):
        # In production, these would be stored in a database
        # For now, using in-memory storage with example keys
        self._keys = {
            # Format: hashed_key -> {"tier": str, "created": datetime, "user_id": str, "active": bool}
            self._hash_key("demo_free_tier_key_12345"): {
                "tier": "free",
                "created": datetime.utcnow(),
                "user_id": "demo_user_1",
                "active": True,
                "name": "Demo Free Account"
            },
            self._hash_key("standard_tier_key_67890"): {
                "tier": "standard",
                "created": datetime.utcnow(),
                "user_id": "demo_user_2",
                "active": True,
                "name": "Demo Standard Account"
            },
            self._hash_key("enterprise_tier_key_abcde"): {
                "tier": "enterprise",
                "created": datetime.utcnow(),
                "user_id": "demo_user_3",
                "active": True,
                "name": "Demo Enterprise Account"
            }
        }

    @staticmethod
    def _hash_key(key: str) -> str:
        """Hash an API key for storage"""
        return hashlib.sha256(key.encode()).hexdigest()

    def validate_key(self, api_key: str) -> Optional[dict]:
        """
        Validate an API key and return key info if valid

        Args:
            api_key: The API key to validate

        Returns:
            Key information dict if valid, None if invalid
        """
        hashed = self._hash_key(api_key)
        key_info = self._keys.get(hashed)

        if not key_info:
            return None

        if not key_info.get("active", False):
            return None

        return key_info

    def get_tier(self, api_key: str) -> Optional[str]:
        """Get the tier for an API key"""
        key_info = self.validate_key(api_key)
        return key_info.get("tier") if key_info else None

    def get_user_id(self, api_key: str) -> Optional[str]:
        """Get the user ID associated with an API key"""
        key_info = self.validate_key(api_key)
        return key_info.get("user_id") if key_info else None

    @staticmethod
    def generate_key() -> str:
        """Generate a new secure API key"""
        return f"bat_{secrets.token_urlsafe(32)}"

    def create_key(self, user_id: str, tier: str = "free", name: str = "") -> str:
        """
        Create a new API key

        Args:
            user_id: User identifier
            tier: API tier (free, standard, enterprise)
            name: Descriptive name for the key

        Returns:
            The generated API key (unhashed)
        """
        api_key = self.generate_key()
        hashed = self._hash_key(api_key)

        self._keys[hashed] = {
            "tier": tier,
            "created": datetime.utcnow(),
            "user_id": user_id,
            "active": True,
            "name": name
        }

        return api_key

    def revoke_key(self, api_key: str) -> bool:
        """
        Revoke an API key

        Args:
            api_key: The API key to revoke

        Returns:
            True if key was revoked, False if not found
        """
        hashed = self._hash_key(api_key)
        if hashed in self._keys:
            self._keys[hashed]["active"] = False
            return True
        return False


# Global API key manager instance
api_key_manager = APIKeyManager()


async def get_api_key(x_api_key: str = Header(..., alias="X-API-Key")) -> str:
    """
    Dependency to validate API key from request header

    Args:
        x_api_key: API key from X-API-Key header

    Returns:
        The validated API key

    Raises:
        HTTPException: If API key is invalid or missing
    """
    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API key",
            headers={"WWW-Authenticate": "ApiKey"}
        )

    key_info = api_key_manager.validate_key(x_api_key)

    if not key_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or inactive API key",
            headers={"WWW-Authenticate": "ApiKey"}
        )

    return x_api_key


async def get_current_user(api_key: str = Depends(get_api_key)) -> dict:
    """
    Get current user information from API key

    Args:
        api_key: Validated API key

    Returns:
        User information dict
    """
    key_info = api_key_manager.validate_key(api_key)
    return {
        "user_id": key_info["user_id"],
        "tier": key_info["tier"],
        "name": key_info.get("name", "")
    }


def require_tier(required_tier: str):
    """
    Dependency factory to require a specific API tier

    Args:
        required_tier: Required tier (free, standard, enterprise)

    Returns:
        Dependency function
    """
    tier_hierarchy = {
        "free": 0,
        "standard": 1,
        "enterprise": 2
    }

    async def check_tier(api_key: str = Depends(get_api_key)):
        tier = api_key_manager.get_tier(api_key)

        if tier_hierarchy.get(tier, -1) < tier_hierarchy.get(required_tier, 999):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This endpoint requires {required_tier} tier or higher"
            )

        return api_key

    return check_tier


# ============================================================================
# EXAMPLE USAGE IN ROUTES
# ============================================================================

"""
# Basic authentication (all tiers)
@app.get("/data")
async def get_data(api_key: str = Depends(get_api_key)):
    ...

# Require specific tier
@app.get("/premium-data")
async def get_premium_data(api_key: str = Depends(require_tier("standard"))):
    ...

# Get user info
@app.get("/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    return user
"""
