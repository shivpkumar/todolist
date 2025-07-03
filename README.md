# Todo List App

A modern, full-stack todo list application built with Node.js, Express, and SQLite. Features a beautiful, responsive UI and complete CRUD functionality.

## Features

✨ **Modern UI**: Clean, responsive design with smooth animations  
📱 **Mobile-friendly**: Fully responsive across all devices  
💾 **Persistent storage**: SQLite database for reliable data persistence  
🔍 **Filtering**: View all, active, or completed todos  
✏️ **Inline editing**: Edit todos directly in the interface  
🗑️ **Bulk actions**: Clear all completed todos at once  
📊 **Statistics**: Track total and completed task counts  
⚡ **Real-time updates**: Instant feedback on all actions  

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Modern CSS with gradients and animations

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todolist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## API Endpoints

The application provides a RESTful API:

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo (text or completion status)
- `DELETE /api/todos/:id` - Delete a todo

## Project Structure

```
todolist/
├── server.js          # Express server and API routes
├── package.json       # Node.js dependencies and scripts
├── todos.db          # SQLite database (created automatically)
├── public/           # Static frontend files
│   ├── index.html    # Main HTML file
│   ├── styles.css    # CSS styles and animations
│   └── script.js     # Frontend JavaScript logic
└── README.md         # This file
```

## Usage

1. **Add todos**: Type in the input field and click "Add" or press Enter
2. **Mark complete**: Click the checkbox next to any todo
3. **Edit todos**: Click the "Edit" button to modify todo text
4. **Delete todos**: Click the "Delete" button to remove todos
5. **Filter view**: Use the filter buttons to show all, active, or completed todos
6. **Clear completed**: Use the "Clear Completed" button to remove all finished tasks

## Database Schema

The application uses a simple SQLite database with the following schema:

```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Development

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the ISC License.
