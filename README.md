# Mesop Todo List

A modern, interactive todo list web application built with Google's Mesop framework. This application demonstrates the power of building web UIs using only Python, with no need for JavaScript, HTML, or CSS files.

## Features

- ✅ **Add Todos**: Create new todo items with a simple input interface
- ☑️ **Mark Complete**: Toggle completion status with checkboxes
- 🗑️ **Delete Todos**: Remove individual todos with delete buttons
- 📊 **Statistics**: View total, remaining, and completed todo counts
- 🧹 **Clear Completed**: Bulk remove all completed todos
- 🎨 **Modern UI**: Clean, responsive design with smooth interactions
- ⚡ **Real-time Updates**: Instant UI updates with Mesop's reactive state management

## Technology Stack

- **[Mesop](https://github.com/google/mesop)**: Google's Python UI framework for building web applications
- **Python 3.10+**: Core programming language
- **UUID**: For generating unique todo identifiers
- **Dataclasses**: For structured data management

## Installation

1. **Clone the repository** (or create the files):
   ```bash
   git clone <your-repo-url>
   cd mesop-todo-list
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

### Option 1: Using the run script (recommended)

```bash
# Run the main application
./run.sh

# Or run the demo version with sample data
./run.sh demo
```

### Option 2: Manual execution

```bash
# Activate virtual environment
source venv/bin/activate

# Run the main application
python main.py

# Or run the demo version with sample data
python demo.py
```

### Option 3: Using the Mesop CLI

```bash
mesop main.py
```

The application will be available at `http://localhost:32123` (default Mesop port).

### Demo Version

For a quick demonstration with sample data, run:

```bash
python demo.py
```

This version comes pre-loaded with sample todos to showcase the application's functionality.

## Project Structure

```
mesop-todo-list/
├── main.py              # Main application file
├── demo.py              # Demo version with sample data
├── run.sh               # Convenient run script
├── requirements.txt     # Python dependencies
├── venv/                # Virtual environment (created after setup)
└── README.md           # Project documentation
```

## How It Works

### State Management
The app uses Mesop's `@me.stateclass` decorator to manage application state:
- `todos`: List of Todo objects
- `new_todo_text`: Current input text for new todos

### Components
- **`main()`**: Main page component with input and todo list
- **`todo_item()`**: Individual todo item component
- **`todo_stats()`**: Statistics and bulk actions component

### Event Handling
- **`on_input()`**: Updates new todo text as user types
- **`add_todo()`**: Creates new todo items
- **`toggle_todo()`**: Toggles completion status
- **`delete_todo()`**: Removes specific todos
- **`clear_completed()`**: Removes all completed todos

### Styling
The application uses Mesop's CSS-like styling API with predefined style objects for consistent design.

## Key Mesop Concepts Demonstrated

1. **Declarative UI**: Components defined as Python functions
2. **State Management**: Reactive state with automatic UI updates
3. **Event Handling**: User interactions handled with Python callbacks
4. **Component Composition**: Reusable UI components
5. **Styling**: CSS-like styling entirely in Python
6. **Hot Reload**: Automatic browser refresh during development

## Customization

### Adding Features
You can extend the application by:
- Adding due dates to todos
- Implementing categories or tags
- Adding todo priorities
- Implementing search/filter functionality
- Adding data persistence (local storage or database)

### Styling
Modify the style constants at the top of `main.py` to customize the appearance:
- Colors, fonts, spacing
- Layout and positioning
- Responsive design improvements

## Deployment

For production deployment, you can:

1. **Use Docker**:
   ```dockerfile
   FROM python:3.10-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   EXPOSE 8080
   CMD ["python", "main.py"]
   ```

2. **Deploy to cloud platforms** like Google Cloud Run, Heroku, or Vercel

3. **Use a production WSGI server** like Gunicorn

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## About Mesop

[Mesop](https://github.com/google/mesop) is a Python-based UI framework that allows you to rapidly build web apps like demos and internal apps. It's particularly useful for:
- ML/AI demos and tools
- Internal dashboards
- Rapid prototyping
- Data visualization apps

Key benefits:
- Write UI in idiomatic Python code
- No need to learn JavaScript, HTML, or CSS
- Type-safe development
- Hot reload for fast iteration
- Component-based architecture

---

**Happy coding with Mesop!** 🚀
