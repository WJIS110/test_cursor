#!/usr/bin/env python3
"""
Style test script for Mesop Todo List application.
This script tests that all styling definitions work correctly.
"""

import mesop as me

def test_styling():
    """Test that all styling objects can be created without errors."""
    
    print("🎨 Testing Mesop Styling Definitions...")
    print("=" * 45)
    
    try:
        # Test margin/padding syntax
        print("📏 Testing margin and padding syntax...")
        margin = me.Margin(top=20, bottom=20, left="auto", right="auto")
        padding = me.Padding.all(20)
        padding_explicit = me.Padding(top=12, bottom=12, left=20, right=20)
        print("✅ Margin and padding definitions work correctly")
        
        # Test border syntax
        print("🔲 Testing border syntax...")
        border_solid = me.Border.all(me.BorderSide(width=2, color="#e5e7eb", style="solid"))
        border_none = me.Border.all(me.BorderSide(width=0, color="transparent", style="none"))
        print("✅ Border definitions work correctly")
        
        # Test complete style objects
        print("🎨 Testing complete style objects...")
        
        container_style = me.Style(
            max_width="800px",
            margin=margin,
            padding=padding,
            background="white",
            border_radius=8,
            box_shadow="0 2px 10px rgba(0,0,0,0.1)"
        )
        
        input_style = me.Style(
            flex="1",
            padding=me.Padding.all(12),
            border=border_solid,
            border_radius=6,
            font_size="16px",
            outline="none"
        )
        
        button_style = me.Style(
            background="#10b981",
            color="white",
            padding=padding_explicit,
            border=border_none,
            border_radius=6,
            font_size="16px",
            font_weight="500",
            cursor="pointer",
            transition="background 0.2s"
        )
        
        print("✅ All style objects created successfully")
        
        print("\n🎉 All styling tests passed!")
        print("\n📋 Style definitions are working correctly:")
        print("   • Margins and padding with explicit values")
        print("   • Borders using BorderSide objects")  
        print("   • Complete style objects with all properties")
        
        return True
        
    except Exception as e:
        print(f"❌ Styling test failed: {e}")
        return False

if __name__ == "__main__":
    test_styling()