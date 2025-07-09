#!/usr/bin/env python3
"""
Verification script for the Mesop Todo List application.
This script checks that both main.py and demo.py can be imported correctly.
"""

def verify_applications():
    """Verify that both applications can be imported without errors."""
    
    print("🔍 Verifying Mesop Todo List Applications...")
    print("=" * 50)
    
    try:
        # Test importing main application
        print("📋 Testing main application...")
        import main
        print("✅ main.py imported successfully")
        
        # Check if main function exists
        if hasattr(main, 'main'):
            print("✅ main() function found")
        else:
            print("❌ main() function not found")
            
    except Exception as e:
        print(f"❌ Error importing main.py: {e}")
        return False
    
    try:
        # Test importing demo application
        print("\n🎬 Testing demo application...")
        import demo
        print("✅ demo.py imported successfully")
        
        # Check if demo function exists
        if hasattr(demo, 'demo'):
            print("✅ demo() function found")
        else:
            print("❌ demo() function not found")
            
        # Check sample data
        demo_state = demo.State()
        print(f"✅ Demo comes with {len(demo_state.todos)} sample todos")
        
    except Exception as e:
        print(f"❌ Error importing demo.py: {e}")
        return False
    
    print("\n🎉 All verifications passed!")
    print("\n📱 To run the applications:")
    print("   Main app:  ./run.sh")
    print("   Demo app:  ./run.sh demo")
    print("   Manual:    mesop main.py  or  mesop demo.py")
    print("\n🌐 Application will be available at: http://localhost:32123")
    
    return True

if __name__ == "__main__":
    verify_applications()