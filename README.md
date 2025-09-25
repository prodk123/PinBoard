# PinBoard - Knowledge Pinning Platform (Pinterest Clone)

A MERN stack web application that replicates Pinterest's visual experience for organizing and managing knowledge. Users can create boards and pin various types of content including images, links, repositories, PDFs, and YouTube videos with a beautiful Pinterest-like interface.

## Features

### 🔐 User Management
- User registration and login with session-based authentication
- User profiles with avatar and bio
- Secure password hashing with bcrypt

### 📋 Board Management
- Create, view, update, and delete boards
- Add collaborators to boards
- Board descriptions and metadata

### 📌 Pin Management
- Add pins of different types: images, links, repositories, PDFs, YouTube videos
- **Direct file uploads** for images and PDFs from computer
- **Pinterest-style masonry grid** layout for visual appeal
- Tag-based organization and search
- Pin metadata including creation date and creator

### 🔍 Search & Filter
- Search pins by tags
- Filter pins by content type
- Board-specific pin searches

### 🎨 Pinterest-Like UI Features
- **Masonry grid layout** with responsive columns
- **Image previews** for uploaded and linked images
- **Hover overlays** with action buttons
- **Pinterest color scheme** (signature red #e60023)
- **Modern card designs** with rounded corners and shadows
- **Smooth animations** and transitions
- **Visual board previews** with gradient backgrounds

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **bcryptjs** - Password hashing
- **express-session** - Session management
- **cors** - Cross-origin resource sharing
- **multer** - File upload handling

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling

## Project Structure

```
pinboard/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Board.js
│   │   └── Pin.js
│   ├── routes/
│   │   ├── users.js
│   │   ├── boards.js
│   │   └── pins.js
│   ├── app.js
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Boards.js
│   │   │   ├── Pins.js
│   │   │   ├── AddBoard.js
│   │   │   ├── AddPin.js
│   │   │   └── Profile.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally on port 27017)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`

### Database Setup
Make sure MongoDB is running locally on the default port (27017). The application will automatically create a database named `pinboard`.

## API Endpoints

### User Routes (`/api/users`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /profile/:id` - Get user profile
- `PUT /profile/:id` - Update user profile
- `GET /auth/check` - Check authentication status

### Board Routes (`/api/boards`)
- `GET /` - Get all boards for authenticated user
- `GET /:id` - Get single board by ID
- `POST /` - Create new board
- `PUT /:id` - Update board
- `DELETE /:id` - Delete board

### Pin Routes (`/api/pins`)
- `GET /` - Search pins across all accessible boards
- `GET /board/:boardId` - Get pins for specific board
- `GET /:id` - Get single pin by ID
- `POST /` - Create new pin
- `PUT /:id` - Update pin
- `DELETE /:id` - Delete pin

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Create Boards**: Organize your content by creating themed boards
3. **Add Pins**: Pin various types of content to your boards
4. **Tag Content**: Use tags to categorize and search your pins
5. **Collaborate**: Add collaborators to boards for shared knowledge management
6. **Search**: Find pins using tag-based search functionality

## Supported Pin Types

- **🔗 Link**: Any web page or article
- **🖼️ Image**: Direct links to images
- **📁 Repository**: GitHub, GitLab, or other code repositories
- **📄 PDF**: Direct links to PDF documents
- **📺 YouTube**: YouTube video links

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- CORS protection
- Input validation and sanitization
- Authorization checks for all operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
