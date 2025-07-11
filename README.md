# Chillink Frontend

A modern, responsive Next.js frontend for the Chillink voice-only watch party platform.

## Features

- 🎙️ **Voice-Only Chat** - Focus on conversations without distractions
- 🔗 **Easy Room Sharing** - Share room links instantly with invite codes
- 🔒 **Private Rooms** - Password-protected rooms for intimate conversations
- 📱 **Mobile-Friendly** - Responsive design that works on all devices
- 🎨 **Modern UI** - Clean, minimal design with Tailwind CSS
- ⚡ **Real-time** - WebSocket integration for instant voice communication
- 🔐 **Secure Authentication** - JWT-based user authentication

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Real-time**: Socket.io Client
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Heroicons (via SVG)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend server running (see `../backend/README.md`)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your backend URLs:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_WS_URL=http://localhost:3001
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   ├── layout/         # Layout components
│   └── room/           # Room-specific components
├── contexts/           # React Context providers
│   ├── AuthContext.tsx    # Authentication state
│   └── SocketContext.tsx  # WebSocket connection
├── hooks/              # Custom React hooks
│   └── useRooms.ts        # Room management logic
├── lib/                # Utility functions and configurations
│   ├── api.ts             # API client setup
│   └── utils.ts           # Helper functions
├── pages/              # Next.js pages
│   ├── index.tsx          # Home page
│   ├── login.tsx          # Login page
│   ├── register.tsx       # Registration page
│   ├── create.tsx         # Create room page
│   ├── join.tsx           # Join room page
│   └── room/[id].tsx      # Room view page
├── styles/             # Global styles
│   └── globals.css        # Tailwind CSS imports
└── types/              # TypeScript type definitions
    └── index.ts           # Shared types
```

## Key Features

### Authentication
- JWT-based authentication with automatic token refresh
- Persistent login state with secure cookie storage
- Protected routes and automatic redirects

### Room Management
- Create public or private rooms with custom settings
- Join rooms using invite codes or direct links
- Real-time room member updates
- Room owner controls (delete, manage members)

### Voice Communication
- WebSocket-based voice room connectivity
- Mute/unmute controls
- Real-time voice user list
- Connection status indicators

### User Experience
- Responsive design for mobile and desktop
- Loading states and error handling
- Toast notifications for user feedback
- Intuitive navigation and room discovery

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3001/api` |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | `http://localhost:3001` |

## Deployment

### Render.com (Recommended)

1. **Connect your repository** to Render.com

2. **Create a new Web Service** with these settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: 18+

3. **Set environment variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
   NEXT_PUBLIC_WS_URL=https://your-backend-url.onrender.com
   ```

4. **Deploy** - Render will automatically build and deploy your app

### Other Platforms

The app can be deployed to any platform that supports Node.js:
- Vercel
- Netlify
- Railway
- Heroku
- AWS/GCP/Azure

## Development

### Code Style
- ESLint + Prettier for code formatting
- TypeScript for type safety
- Tailwind CSS for styling
- Component-based architecture

### Best Practices
- Use TypeScript interfaces for all data structures
- Implement proper error handling and loading states
- Follow React hooks best practices
- Use semantic HTML and accessibility features
- Optimize for mobile-first responsive design

## API Integration

The frontend integrates with the Chillink backend API:

- **Authentication**: Login, register, token refresh
- **Rooms**: CRUD operations, member management
- **WebSocket**: Real-time voice communication
- **Health**: Service status monitoring

See the backend documentation for detailed API specifications.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.