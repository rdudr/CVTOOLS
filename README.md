# CVTOOLS - AI-Powered Portfolio Generator

Transform any resume into a stunning, personalized portfolio website in minutes using advanced AI technology.

## 🚀 Features

- **AI-Driven Component Selection**: Automatically selects from 7 specialized UI components based on professional category
- **Dynamic Theme Engine**: Applies cohesive color palettes and glassmorphic styling that matches professional identity
- **Multi-Format Resume Processing**: Supports PDF and image uploads with OCR text extraction
- **Real-Time Generation**: Fast portfolio creation with progress feedback and responsive UI
- **Particle Background Effects**: Interactive animated backgrounds with mouse interaction
- **Professional Hero Sections**: Clean, modern hero components with contact information

## 🏗️ Architecture

### Frontend (Next.js 16)
- **Framework**: Next.js 16 with App Router and React Server Components
- **UI Library**: Shadcn UI with custom glassmorphic theme
- **Styling**: Tailwind CSS with CSS variables for dynamic theming
- **Animation**: Framer Motion for component transitions
- **Charts**: Recharts for data visualizations

### Backend (Django 6.0)
- **Framework**: Django 6.0 with async support
- **API**: Django REST Framework
- **AI Integration**: Google Gemini Pro with function calling capabilities
- **OCR**: Google Cloud Vision API for text extraction
- **Database**: Django ORM (PostgreSQL recommended for production)

## 📁 Project Structure

```
CVTOOLS/
├── frontend/                 # Next.js 16 application
│   ├── src/
│   │   ├── app/             # App Router pages and layouts
│   │   ├── components/      # React components
│   │   │   ├── portfolio/   # 7 core portfolio components
│   │   │   ├── processing/  # File processing components
│   │   │   └── ui/          # Shadcn UI base components
│   │   ├── lib/             # Utility functions and configurations
│   │   └── types/           # TypeScript type definitions
│   └── package.json
├── backend/                 # Django 6.0 API server
│   ├── apps/
│   │   └── portfolio/       # Main portfolio generation app
│   │       ├── models.py    # Data models
│   │       ├── views.py     # API endpoints
│   │       ├── serializers.py # DRF serializers
│   │       └── services/    # Business logic services
│   ├── tests/               # Test suites
│   └── requirements/        # Dependency management
└── .kiro/                   # Kiro configuration and specs
    ├── specs/               # Feature specifications
    └── steering/            # AI assistant guidance rules
```

## 🎨 Portfolio Components

The system includes 7 specialized UI components:

1. **HeroPrism** - Liquid glass hero section with interactive cursor effects
2. **HeroTerminal** - Terminal-style hero section with typewriter effects
3. **HeroProfessional** - Clean, professional hero with contact information
4. **ExpTimeline** - Vertical timeline layout with connected experience cards
5. **ExpMasonry** - Staggered grid layout for creative portfolios
6. **SkillDots** - 1-5 glowing neon dot skill indicators
7. **SkillRadar** - Hexagonal spider chart for comprehensive skills
8. **BentoGrid** - Achievement statistics in bento box layout

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Google Cloud Vision API credentials
- Google Gemini Pro API key

### Frontend Setup

```bash
cd frontend/
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd backend/
pip install -r requirements/dev.txt
python manage.py migrate
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Google AI API Keys
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_CLOUD_VISION_CREDENTIALS=path/to/credentials.json

# Django Settings
DEBUG=True
SECRET_KEY=your_secret_key_here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (optional - uses SQLite by default)
DATABASE_URL=postgresql://user:password@localhost:5432/cvtools
```

## 🎯 Usage

1. **Upload Resume**: Upload a PDF or image file of your resume
2. **AI Analysis**: The system uses OCR and AI to extract and analyze your professional information
3. **Component Selection**: AI automatically selects the most appropriate UI components based on your professional category
4. **Theme Application**: Dynamic theme engine applies colors and styling that match your professional identity
5. **Portfolio Generation**: Your personalized portfolio is generated with particle backgrounds and professional layouts

## 🧪 Testing

### Frontend Tests
```bash
cd frontend/
npm run test
```

### Backend Tests
```bash
cd backend/
python manage.py test
pytest  # for property-based tests with Hypothesis
```

## 🎨 Themes

The system supports three dynamic theme palettes:

- **Neon Blue**: Tech-focused cyan palette
- **Emerald Green**: Creative green palette  
- **Cyber Pink**: Creative pink palette

All themes feature glassmorphic design with `bg-white/5`, `border-white/10`, and `backdrop-blur-md` effects.

## 🔧 Development

### Component Registry Pattern
AI tool calls map to React components via a centralized registry system, enabling dynamic component selection and rendering.

### Service Layer Architecture
Business logic is separated into service classes for OCR, AI analysis, and resume processing.

### Theme Engine Pattern
CSS variables enable runtime theme switching with glassmorphic base styles.

## 📝 API Endpoints

- `POST /api/portfolio/upload/` - Upload resume file
- `GET /api/portfolio/{id}/` - Get generated portfolio
- `POST /api/portfolio/analyze/` - Analyze resume content
- `GET /api/portfolio/themes/` - Get available themes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [Django](https://www.djangoproject.com/)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- AI powered by [Google Gemini Pro](https://ai.google.dev/)
- OCR by [Google Cloud Vision](https://cloud.google.com/vision)
- Animations by [Framer Motion](https://www.framer.com/motion/)

---

**CVTOOLS** - Transforming resumes into professional portfolios with the power of AI.