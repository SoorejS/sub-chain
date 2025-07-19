# Subscription Substituter App

An AI-powered subscription management app that helps users find cheaper alternatives, share subscriptions with others, and track their expenses efficiently.

## Features

- Subscription Management
- AI-powered Alternative Suggestions
- Group Subscription Sharing
- Cost Tracking and Analytics
- Real-time Messaging
- Secure Authentication
- Email Integration
- Push Notifications

## Tech Stack

- Frontend: React.js + Tailwind CSS
- Backend: Node.js with Express
- Authentication: Auth0
- Database: Firebase Firestore
- Cloud Infrastructure: Google Cloud Run
- File Hosting: Vercel
- Secrets Management: Google Secret Manager
- Notification: Firebase Cloud Messaging
- Chat System: Socket.io
- AI: OpenAI GPT-4/3.5
- CI/CD: GitHub Actions
- Email: Gmail API
- Analytics: Firebase Analytics

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Cloud Account
- Firebase Account
- Auth0 Account
- OpenAI API Key

### Installation

1. Clone the repository
2. Install dependencies
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

3. Set up environment variables
   ```bash
   # Create .env files in both frontend and backend directories
   cp .env.example .env
   ```

4. Run the development servers
   ```bash
   # Frontend
   cd frontend
   npm start

   # Backend
   cd ../backend
   npm run dev
   ```

## Project Structure

```
subscription-substituter/
├── frontend/           # React application
├── backend/            # Node.js/Express API
└── docs/              # Documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
