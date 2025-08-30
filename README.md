# Scribe Nurse Helper - Robotic Patient Assessment Assistant

A proof-of-concept AI-powered patient assessment system designed for robotic assistants in healthcare settings. Developed by the **Robotic Evangelist Cohort 8** team at **Hospital Authority**, this system enables robots equipped with Android tablets to assist nurses with patient assessments upon admission.

## Project Overview

This is an **in-house Hospital Authority project** that demonstrates how robotic assistants can streamline the patient admission process. The robot, running on an Android tablet interface, guides nurses through standardized patient assessments while automatically documenting findings and calculating risk scores in real-time.

## Features

### 🏥 Patient Management
- **Patient List Dashboard** - View all patients with status tracking
- **Bed Assignment System** - Assign beds to incoming patients
- **Patient Status Tracking** - Monitor patient flow from admission to assessment completion
- **Ward-based Organization** - Organize patients by ward and department

### 🎤 AI-Powered Documentation
- **Real-time Audio Transcription** - Convert speech to text during patient assessments
- **Intelligent Field Mapping** - Automatically populate assessment forms from transcribed audio
- **Voice-to-Text Integration** - Hands-free documentation while maintaining patient focus

### 📊 Automated Risk Assessment
- **Morse Fall Scale** - Automated fall risk calculation (0-125 scale)
- **MST Score** - Malnutrition screening tool assessment (0-5 scale)
- **MEWS Score** - Modified Early Warning Score calculation (0-14 scale)
- **Real-time Risk Updates** - Dynamic risk score calculation as data is entered

### 🤖 Robotic Interface Design
- **Android Tablet Optimization** - Specifically designed for robotic Android tablet interfaces
- **Touch-Friendly Interface** - Large buttons and intuitive navigation for robot-assisted interactions
- **Kiosk Mode Support** - Full-screen operation suitable for robotic deployment
- **Voice-Guided Navigation** - Audio prompts and feedback for seamless nurse-robot interaction

### 🔐 Secure Authentication
- **Supabase Authentication** - Secure user management and session handling
- **Role-Based Access** - Different access levels for doctors, nurses, and admins
- **Device Memory** - Remember trusted devices for quick access
- **Protected Routes** - Secure access to patient data

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **React Router** - Client-side routing
- **React Query** - Server state management

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Edge Functions** - Serverless functions for audio processing
- **Real-time Subscriptions** - Live data updates
- **Row Level Security** - Database-level security policies

### Robotic Platform & Deployment
- **Capacitor** - Native Android app capabilities for robotic tablets
- **Android APK** - Direct installation on robotic Android systems
- **Kiosk Mode** - Full-screen robotic interface deployment
- **Hardware Integration** - Optimized for robotic hardware constraints

### AI & Audio Processing
- **Speech-to-Text API** - Real-time audio transcription
- **Natural Language Processing** - Intelligent field extraction
- **Audio Recording** - Browser-based audio capture

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or bun package manager
- Supabase account (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd scribe-nurse-helper
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file with:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Access the application**
   - Open http://localhost:8080 in your browser
   - Create an account or sign in with existing credentials

### Supabase Setup

1. **Create a new Supabase project**
2. **Run migrations**
   ```bash
   supabase db reset
   ```
3. **Deploy edge functions**
   ```bash
   supabase functions deploy
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── tabs/           # Tab-based assessment components
│   └── *.tsx           # Feature-specific components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
├── lib/                # Utility functions and configurations
├── pages/              # Route components
│   ├── Auth.tsx        # Authentication page
│   ├── Index.tsx       # Patient assessment page
│   ├── Patients.tsx    # Patient list dashboard
│   └── NotFound.tsx    # 404 page
└── utils/              # Helper functions

supabase/
├── functions/          # Edge functions
│   ├── transcribe-audio/
│   ├── process-audio-transcript/
│   ├── calculate-risk-scores/
│   └── submit-assessment/
└── migrations/         # Database schema migrations
```

## Key Components

### Patient Assessment System
- **TabAssessmentSystem** - Multi-tab assessment interface
- **ImprovedAudioRecording** - Audio capture and transcription
- **RiskScoreDisplay** - Real-time risk score visualization
- **ScribeDataDisplay** - AI-generated assessment data

### Patient Management
- **PatientCard** - Individual patient information display
- **BedAssignmentModal** - Bed assignment interface
- **PatientStatusBadge** - Visual status indicators

### Authentication & Security
- **ProtectedRoute** - Route-level authentication
- **UserSelection** - Quick user switching
- **AndroidLayout** - Mobile-optimized layout wrapper

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Robot Deployment

### Building for Android Robot

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Add Android platform** (first time only)
   ```bash
   npx cap add android
   ```

3. **Sync and build APK**
   ```bash
   npx cap sync android
   npx cap open android
   ```

4. **Generate APK in Android Studio**
   - In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
   - APK will be generated in `android/app/build/outputs/apk/debug/`

### Installing on Robot

#### Method 1: Direct APK Installation
1. **Transfer APK to robot**
   ```bash
   adb connect <robot-ip-address>
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

2. **Enable developer options on robot tablet**
   - Go to Settings → About tablet → Tap "Build number" 7 times
   - Enable "USB debugging" and "Install unknown apps"

#### Method 2: USB Installation
1. Connect robot tablet via USB
2. Copy APK file to tablet storage
3. Use file manager to install APK
4. Grant necessary permissions when prompted

#### Method 3: Network Installation (Recommended for Hospital Environment)
1. **Set up internal app distribution**
   - Host APK on internal Hospital Authority server
   - Provide download link to robot operators

2. **Configure robot for kiosk mode**
   ```bash
   # Set as device owner (requires factory reset)
   adb shell dpm set-device-owner com.yourpackage/.DeviceAdminReceiver
   
   # Enable kiosk mode
   adb shell am start -n com.yourpackage/.MainActivity --ez kiosk_mode true
   ```

### Robot Configuration

#### Required Permissions
Ensure the robot tablet has these permissions enabled:
- **Microphone** - For audio recording and transcription
- **Network Access** - For Supabase connectivity
- **Storage** - For local data caching
- **Camera** (optional) - For future barcode scanning features

#### Kiosk Mode Setup
```bash
# Disable navigation bar
adb shell settings put global policy_control immersive.full=*

# Set app as launcher
adb shell pm set-home-activity com.yourpackage/.MainActivity

# Prevent app switching
adb shell am start --user 0 -n com.yourpackage/.MainActivity --ez lock_task_mode true
```

#### Network Configuration
Configure robot to connect to Hospital Authority network:
```json
{
  "wifi": {
    "ssid": "HA-Internal-Network",
    "security": "WPA2-Enterprise",
    "identity": "robot-device-id",
    "password": "robot-network-password"
  }
}
```

## API Integration

### Supabase Edge Functions
- **transcribe-audio** - Convert audio to text
- **process-audio-transcript** - Extract structured data from transcripts
- **calculate-risk-scores** - Compute patient risk assessments
- **submit-assessment** - Save completed assessments

### Database Schema
- **patients** - Patient demographic and status information
- **assessments** - Patient assessment records
- **profiles** - User profile and role information
- **scribe_data** - AI-generated assessment data

## Development Team

**Robotic Evangelist Cohort 8 - Hospital Authority**

This project is developed as part of the Hospital Authority's robotic innovation initiative to enhance patient care through technology.

### Contributing

1. Fork the repository within Hospital Authority's internal GitLab/GitHub
2. Create a feature branch (`git checkout -b feature/robot-enhancement`)
3. Test thoroughly on development robot hardware
4. Commit your changes (`git commit -m 'Add robot enhancement'`)
5. Push to the branch (`git push origin feature/robot-enhancement`)
6. Create a merge request for team review

### Testing on Robot Hardware

Before deploying to production robots:
1. Test on development robot tablet
2. Verify audio recording functionality
3. Test network connectivity in hospital environment
4. Validate kiosk mode operation
5. Confirm all risk calculations are accurate

## Security Considerations

- All patient data is encrypted in transit and at rest
- Row Level Security (RLS) policies protect sensitive information
- Authentication required for all patient data access
- Audit logging for all data modifications
- HIPAA-compliant data handling practices

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting Robot Issues

### Common Robot Deployment Issues

**App won't install on robot:**
- Ensure "Unknown sources" is enabled in Android settings
- Check available storage space on tablet
- Verify APK is not corrupted

**Audio recording not working:**
- Grant microphone permissions in app settings
- Test microphone hardware functionality
- Check network connectivity for transcription services

**Kiosk mode not activating:**
- Ensure device owner permissions are set
- Verify robot tablet supports kiosk mode
- Check Android version compatibility (minimum Android 7.0)

**Network connectivity issues:**
- Verify Hospital Authority network credentials
- Check firewall settings for Supabase endpoints
- Test internet connectivity from robot location

### Support Contacts

**Hospital Authority - Robotic Evangelist Cohort 8**
- Internal IT Support: Contact HA IT Helpdesk
- Development Team: Reach out via internal communication channels
- Robot Hardware Issues: Contact robotic platform vendor

### Documentation

- Internal HA Wiki: [Robot Deployment Guidelines]
- Technical Specifications: [Robot Hardware Requirements]
- User Manual: [Nurse Training Materials]

---

**⚠️ Important Security Notice**: This system handles sensitive patient healthcare data within Hospital Authority's secure network. Ensure all deployments comply with HA's data protection policies and local healthcare regulations before production use. All robot installations must be approved by HA IT Security team.