#!/usr/bin/env python3
"""
Verify RAG Chatbot Setup
This script checks if all dependencies and configurations are correct.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def check_imports():
    """Check if all required packages are installed."""
    print("Checking Python dependencies...")
    required_packages = [
        ('fastapi', 'FastAPI'),
        ('sqlalchemy', 'SQLAlchemy'),
        ('anthropic', 'Anthropic'),
        ('openai', 'OpenAI'),
        ('pgvector', 'pgvector'),
        ('pydantic', 'Pydantic'),
    ]
    
    all_installed = True
    for package, name in required_packages:
        try:
            __import__(package)
            print(f"  ✓ {name}")
        except ImportError:
            print(f"  ✗ {name} - NOT INSTALLED")
            all_installed = False
    
    return all_installed

def check_env_file():
    """Check if .env file exists and has required keys."""
    print("\nChecking .env file...")
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    
    if not os.path.exists(env_path):
        print("  ✗ .env file not found")
        print("    Run: cp .env.example .env")
        return False
    
    print("  ✓ .env file exists")
    
    # Check for API keys
    with open(env_path, 'r') as f:
        content = f.read()
    
    issues = []
    if 'your-openai-api-key-here' in content:
        issues.append("OpenAI API key not set")
    if 'your-anthropic-api-key-here' in content:
        issues.append("Anthropic API key not set")
    
    if issues:
        print("  ⚠ Issues found:")
        for issue in issues:
            print(f"    - {issue}")
        return False
    else:
        print("  ✓ API keys configured")
        return True

def check_database():
    """Check database connection."""
    print("\nChecking database connection...")
    try:
        from app.config import settings
        import asyncpg
        import asyncio
        
        async def test_connection():
            try:
                # Parse DATABASE_URL
                url = settings.DATABASE_URL.replace('postgresql+asyncpg://', 'postgresql://')
                conn = await asyncpg.connect(url)
                version = await conn.fetchval('SELECT version()')
                await conn.close()
                return True, version
            except Exception as e:
                return False, str(e)
        
        success, result = asyncio.run(test_connection())
        
        if success:
            print("  ✓ Database connection successful")
            print(f"    {result.split(',')[0]}")
            return True
        else:
            print("  ✗ Database connection failed")
            print(f"    Error: {result}")
            return False
            
    except Exception as e:
        print(f"  ✗ Error checking database: {e}")
        return False

def check_pgvector():
    """Check if pgvector extension is installed."""
    print("\nChecking pgvector extension...")
    try:
        from app.config import settings
        import asyncpg
        import asyncio
        
        async def test_pgvector():
            try:
                url = settings.DATABASE_URL.replace('postgresql+asyncpg://', 'postgresql://')
                conn = await asyncpg.connect(url)
                
                # Check if vector extension exists
                result = await conn.fetchval(
                    "SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector')"
                )
                await conn.close()
                return result
            except Exception as e:
                return False
        
        has_vector = asyncio.run(test_pgvector())
        
        if has_vector:
            print("  ✓ pgvector extension installed")
            return True
        else:
            print("  ✗ pgvector extension not installed")
            print("    Run: CREATE EXTENSION vector;")
            return False
            
    except Exception as e:
        print(f"  ⚠ Could not check pgvector: {e}")
        return False

def main():
    """Run all checks."""
    print("=" * 50)
    print("RAG Chatbot Setup Verification")
    print("=" * 50)
    print()
    
    results = {
        'Dependencies': check_imports(),
        'Environment': check_env_file(),
        'Database': check_database(),
        'pgvector': check_pgvector(),
    }
    
    print("\n" + "=" * 50)
    print("Summary")
    print("=" * 50)
    
    all_good = True
    for check, status in results.items():
        symbol = "✓" if status else "✗"
        print(f"  {symbol} {check}")
        if not status:
            all_good = False
    
    print()
    if all_good:
        print("✓ All checks passed! You can now:")
        print("  1. Process documents: python scripts/process_documents.py")
        print("  2. Start API: uvicorn app.main:app --reload")
        print("  3. Open chat-widget.html in your browser")
    else:
        print("✗ Some checks failed. Please fix the issues above.")
        print("\nFor help, see:")
        print("  - RAG_CHATBOT_README.md")
        print("  - backend/setup_rag_chatbot.sh")
    
    print()
    return 0 if all_good else 1

if __name__ == "__main__":
    sys.exit(main())
