# FeathersUp Ticketing System - Frontend

A modern, dark-themed React frontend for the FeathersUp ticketing system built with TypeScript, Tailwind CSS, and React Router.

## 🚀 Features

- **Dark Mode Design**: Beautiful dark theme with consistent color palette
- **Responsive Layout**: Mobile-first design that works on all devices
- **Authentication**: Login/Register forms with protected routes
- **Dashboard**: Overview of tickets and system statistics
- **Ticket Management**: View, create, and manage support tickets
- **User Profiles**: Edit profile information and account settings
- **Role-Based Access**: Different interfaces for customers and support agents

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **React Router v6** for navigation
- **Tailwind CSS** for styling
- **React Hook Form** for form handling
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **Axios** for API communication

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── layout/         # Layout and navigation
│   ├── profile/        # User profile components
│   ├── tickets/        # Ticket management components
│   └── ui/            # Reusable UI components
├── contexts/           # React contexts (Auth)
├── services/           # API services
├── types/              # TypeScript type definitions
├── App.tsx            # Main application component
├── index.tsx          # Application entry point
└── index.css          # Global styles and Tailwind
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend server running (see main project README)

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
```

## 🔐 Authentication

The application uses JWT tokens for authentication. Users can:

- **Register**: Create new customer accounts
- **Login**: Access existing accounts
- **Protected Routes**: Only authenticated users can access the main application

## 🎨 Design System

### Color Palette

- **Primary**: Blue tones for main actions and highlights
- **Dark**: Various shades of dark for backgrounds and surfaces
- **Success**: Green for positive actions and status
- **Warning**: Yellow/Orange for caution states
- **Danger**: Red for errors and destructive actions

### Components

All UI components are built with consistent styling and support:
- Different variants (primary, secondary, outline, etc.)
- Multiple sizes (sm, md, lg)
- Loading states
- Error handling
- Accessibility features

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Flexible grid layouts
- Adaptive navigation
- Touch-friendly interactions

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_APP_NAME=FeathersUp Ticketing
```

### Tailwind Configuration

The Tailwind config includes:
- Custom color palette
- Custom animations
- Responsive breakpoints
- Component-specific utilities

## 🚧 Development

### Adding New Components

1. Create the component in the appropriate directory
2. Export it from the main file
3. Add it to the routing if needed
4. Update the sidebar navigation if applicable

### Styling Guidelines

- Use Tailwind utility classes
- Follow the established color scheme
- Maintain consistent spacing and typography
- Use the predefined component classes when possible

### State Management

- **Local State**: Use React hooks for component-specific state
- **Global State**: Use React Context for authentication and app-wide state
- **Form State**: Use React Hook Form for all forms

## 🧪 Testing

```bash
npm test
```

## 📦 Build Output

The build process creates:
- Optimized production bundle
- Static assets
- Service worker (if configured)
- Build manifest

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Add proper error handling
4. Test on multiple devices
5. Update documentation as needed

## 📄 License

This project is part of the FeathersUp ticketing system.

## 🆘 Support

For issues and questions:
1. Check the main project README
2. Review the backend API documentation
3. Check the browser console for errors
4. Verify environment configuration

---

**Happy coding! 🎉** 