# rPPG Heart Rate Monitor

A Next.js web application that uses remote photoplethysmography (rPPG) technology to monitor heart rate in real-time through facial video analysis.

## 🚀 Features

- **Real-time Heart Rate Monitoring**: Uses webcam to detect heart rate from facial video
- **Session Management**: Maintains persistent sessions for continuous monitoring
- **Live Video Processing**: 20 FPS capture with real-time analysis
- **Modern UI**: Clean, responsive interface built with Tailwind CSS
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Debug Tools**: Built-in debugging pages for development

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Video Capture**: react-webcam
- **HTTP Client**: Axios
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern web browser with webcam support
- rPPG API backend (FastAPI)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd facial-hr-webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Configure your `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Vercel Deployment (Recommended)

This application is optimized for Vercel deployment with automatic HTTPS/HTTP proxy handling.

**Live Demo**: [https://facial-hr-webapp-2zadr1zgc-haizadtarik-gmailcoms-projects.vercel.app](https://facial-hr-webapp-2zadr1zgc-haizadtarik-gmailcoms-projects.vercel.app)

#### Quick Deploy Steps

1. **Deploy via Vercel CLI**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Configure Environment Variables**
   In Vercel dashboard, add:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://44.202.123.117:8000
   ```

3. **Automatic Proxy Handling**
   - The app automatically detects Vercel deployment
   - Routes API calls through Next.js proxy endpoints
   - Eliminates HTTPS/HTTP mixed content issues

#### How HTTPS/HTTP Proxy Works
```
Browser (HTTPS) → Vercel (HTTPS) → Next.js Proxy → Backend API (HTTP)
```

The application includes built-in proxy routes at:
- `/api/create-session` → backend `/create-session`
- `/api/analyze-image` → backend `/analyze-image`
- `/api/session/[id]/status` → backend `/session/[id]/status`

### Alternative Deployment
- **Netlify**: Compatible with static export
- **Docker**: Use included Dockerfile for containerized deployment
- **Traditional hosting**: Build and serve static files

## 📖 Usage

### Main Application (`/test`)
- Primary heart rate monitoring interface
- Allow camera permissions when prompted
- Real-time heart rate detection and display

### API Integration
The application connects to a FastAPI backend that provides:
- Session management
- Image analysis
- Heart rate detection
- Status monitoring

### Architecture
- **Development**: Direct HTTP requests to backend API
- **Production (Vercel)**: Automatic proxy routing through Next.js API routes

## 🐛 Troubleshooting

### Camera Issues
- Ensure browser has camera permissions
- Check if camera is being used by another application
- Try accessing via HTTPS in production

### API Connection Issues
- Verify the API backend is running
- Check environment variables
- Ensure CORS is configured on the backend

### Build Issues
- Clear `.next` cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## 📄 License

This project is licensed under the MIT License.
