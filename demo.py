import mesop as me
from typing import List
from dataclasses import dataclass, field
import uuid


@dataclass
class Todo:
    id: str
    text: str
    completed: bool = False


@me.stateclass
class State:
    todos: List[Todo] = field(default_factory=lambda: [
        Todo(id=str(uuid.uuid4()), text="Learn about Mesop framework", completed=True),
        Todo(id=str(uuid.uuid4()), text="Build a todo list application", completed=True),
        Todo(id=str(uuid.uuid4()), text="Add styling and components", completed=False),
        Todo(id=str(uuid.uuid4()), text="Deploy to production", completed=False),
        Todo(id=str(uuid.uuid4()), text="Share with friends", completed=False),
    ])
    new_todo_text: str = ""


# Import all the same styling and functionality from main.py
# (The rest of the code is identical to main.py)

# Styling
CONTAINER_STYLE = me.Style(
    max_width="800px",
    margin=me.Margin(top=20, bottom=20, left="auto", right="auto"),
    padding=me.Padding.all(20),
    background="white",
    border_radius=8,
    box_shadow="0 2px 10px rgba(0,0,0,0.1)"
)

HEADER_STYLE = me.Style(
    text_align="center",
    color="#2563eb",
    margin=me.Margin(bottom=30),
    font_size="2.5rem",
    font_weight="bold"
)

INPUT_CONTAINER_STYLE = me.Style(
    display="flex",
    gap="10px",
    margin=me.Margin(bottom=30),
    align_items="center"
)

INPUT_STYLE = me.Style(
    flex="1",
    padding=me.Padding.all(12),
    border="2px solid #e5e7eb",
    border_radius=6,
    font_size="16px",
    outline="none"
)

ADD_BUTTON_STYLE = me.Style(
    background="#10b981",
    color="white",
    padding=me.Padding(top=12, bottom=12, left=20, right=20),
    border="none",
    border_radius=6,
    font_size="16px",
    font_weight="500",
    cursor="pointer",
    transition="background 0.2s"
)

TODO_ITEM_STYLE = me.Style(
    display="flex",
    align_items="center",
    gap="12px",
    padding=me.Padding.all(16),
    border="1px solid #e5e7eb",
    border_radius=6,
    margin=me.Margin(bottom=8),
    background="#fafafa"
)

TODO_ITEM_COMPLETED_STYLE = me.Style(
    display="flex",
    align_items="center",
    gap="12px",
    padding=me.Padding.all(16),
    border="1px solid #e5e7eb",
    border_radius=6,
    margin=me.Margin(bottom=8),
    background="#f0f9ff",
    opacity="0.7"
)

TODO_TEXT_STYLE = me.Style(
    flex="1",
    font_size="16px",
    color="#374151"
)

TODO_TEXT_COMPLETED_STYLE = me.Style(
    flex="1",
    font_size="16px",
    color="#6b7280",
    text_decoration="line-through"
)

CHECKBOX_STYLE = me.Style(
    width="18px",
    height="18px",
    cursor="pointer"
)

DELETE_BUTTON_STYLE = me.Style(
    background="#ef4444",
    color="white",
    padding=me.Padding(top=6, bottom=6, left=12, right=12),
    border="none",
    border_radius=4,
    font_size="14px",
    cursor="pointer",
    transition="background 0.2s"
)

STATS_STYLE = me.Style(
    display="flex",
    justify_content="space-between",
    align_items="center",
    margin=me.Margin(top=20),
    padding=me.Padding.all(16),
    background="#f8fafc",
    border_radius=6,
    font_size="14px",
    color="#64748b"
)

EMPTY_STATE_STYLE = me.Style(
    text_align="center",
    padding=me.Padding.all(40),
    color="#6b7280",
    font_size="18px"
)

DEMO_BANNER_STYLE = me.Style(
    background="#fef3c7",
    color="#92400e",
    padding=me.Padding.all(12),
    border_radius=6,
    margin=me.Margin(bottom=20),
    text_align="center",
    font_size="14px",
    border="1px solid #fcd34d"
)


def on_input(e: me.InputEvent):
    """Handle input changes for new todo text"""
    state = me.state(State)
    state.new_todo_text = e.value


def add_todo(e: me.ClickEvent):
    """Add a new todo item"""
    state = me.state(State)
    if state.new_todo_text.strip():
        new_todo = Todo(
            id=str(uuid.uuid4()),
            text=state.new_todo_text.strip(),
            completed=False
        )
        state.todos.append(new_todo)
        state.new_todo_text = ""


def toggle_todo(todo_id: str):
    """Toggle the completion status of a todo"""
    def handler(e: me.ClickEvent):
        state = me.state(State)
        for todo in state.todos:
            if todo.id == todo_id:
                todo.completed = not todo.completed
                break
    return handler


def delete_todo(todo_id: str):
    """Delete a todo item"""
    def handler(e: me.ClickEvent):
        state = me.state(State)
        state.todos = [todo for todo in state.todos if todo.id != todo_id]
    return handler


def clear_completed(e: me.ClickEvent):
    """Clear all completed todos"""
    state = me.state(State)
    state.todos = [todo for todo in state.todos if not todo.completed]


@me.component
def todo_item(todo: Todo):
    """Component for rendering a single todo item"""
    item_style = TODO_ITEM_COMPLETED_STYLE if todo.completed else TODO_ITEM_STYLE
    text_style = TODO_TEXT_COMPLETED_STYLE if todo.completed else TODO_TEXT_STYLE
    
    with me.box(style=item_style):
        me.checkbox(
            checked=todo.completed,
            on_change=toggle_todo(todo.id),
            style=CHECKBOX_STYLE
        )
        me.text(todo.text, style=text_style)
        me.button(
            "Delete",
            on_click=delete_todo(todo.id),
            style=DELETE_BUTTON_STYLE
        )


@me.component
def todo_stats(todos: List[Todo]):
    """Component for displaying todo statistics"""
    total = len(todos)
    completed = len([todo for todo in todos if todo.completed])
    remaining = total - completed
    
    with me.box(style=STATS_STYLE):
        me.text(f"Total: {total}")
        me.text(f"Remaining: {remaining}")
        me.text(f"Completed: {completed}")
        if completed > 0:
            me.button(
                "Clear Completed",
                on_click=clear_completed,
                style=me.Style(
                    background="#6366f1",
                    color="white",
                    padding=me.Padding(top=6, bottom=6, left=12, right=12),
                    border="none",
                    border_radius=4,
                    font_size="12px",
                    cursor="pointer"
                )
            )


@me.page(
    path="/",
    title="Todo List Demo - Mesop"
)
def demo():
    """Demo page component with sample data"""
    state = me.state(State)
    
    with me.box(style=CONTAINER_STYLE):
        # Demo banner
        with me.box(style=DEMO_BANNER_STYLE):
            me.text("🎬 Demo Mode - This application comes pre-loaded with sample todos!")
        
        # Header
        me.text("✅ Todo List Demo", style=HEADER_STYLE)
        
        # Add new todo input
        with me.box(style=INPUT_CONTAINER_STYLE):
            me.input(
                value=state.new_todo_text,
                placeholder="What needs to be done?",
                on_input=on_input,
                style=INPUT_STYLE
            )
            me.button(
                "Add Todo",
                on_click=add_todo,
                style=ADD_BUTTON_STYLE
            )
        
        # Todo list
        if state.todos:
            for todo in state.todos:
                todo_item(todo)
            
            # Statistics
            todo_stats(state.todos)
        else:
            # Empty state
            with me.box(style=EMPTY_STATE_STYLE):
                me.text("🎉 All done! Add a new todo above to get started.")


# Note: Run this app with: mesop demo.py
# The demo() function will be automatically discovered by Mesop