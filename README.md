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

### Vercel Deployment

1. **Connect to Vercel**
   - Push your code to GitHub
   - Import the project in Vercel
   - Configure environment variables in Vercel dashboard

2. **Environment Variables**
   Set in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_BASE_URL=<your-api-backend-url>
   ```

3. **Deploy**
   Vercel will automatically deploy on every push to main branch.

## 📖 Usage

### Main Application
- Navigate to `/` for the main heart rate monitoring interface
- Allow camera permissions when prompted
- The application will automatically start detecting your heart rate

### Debug Mode
- Navigate to `/debug` for debugging and testing camera functionality
- Use `/test` for manual testing and API interaction

### API Integration
The application connects to a FastAPI backend that provides:
- Session management
- Image analysis
- Heart rate detection
- Status monitoring

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
