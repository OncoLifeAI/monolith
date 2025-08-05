# Patient Portal Monorepo

A production-ready monorepo for the Patient Portal application with separate patient and doctor interfaces.

## Project Structure

```
patient-portal/
├── backend/                 # Python FastAPI backend (unchanged)
├── server/                  # Node.js BFF (Backend for Frontend)
├── packages/                # Shared packages
│   ├── common-types/        # Shared TypeScript types
│   ├── utils-lib/          # Utility functions
│   ├── auth-lib/           # Authentication library
│   ├── api-client/         # API client library
│   └── ui-components/      # Shared UI components
└── apps/                   # Applications
    ├── patient-app/        # Patient interface
    └── doctor-app/         # Doctor interface
```

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm 8+
- Python 3.8+ (for backend)

### Installation

1. Install root dependencies:
```bash
npm install
```

2. Install all workspace dependencies:
```bash
npm run install:all
```

### Development

#### Start all applications:
```bash
npm run dev
```

#### Start specific applications:
```bash
# Patient app only
npm run dev:patient

# Doctor app only
npm run dev:doctor

# Server only
npm run dev:server
```

#### Build all applications:
```bash
npm run build
```

#### Build specific applications:
```bash
# Patient app only
npm run build:patient

# Doctor app only
npm run build:doctor

# Server only
npm run build:server
```

### Available Scripts

- `npm run dev` - Start all applications in development mode
- `npm run build` - Build all applications
- `npm run lint` - Lint all packages and applications
- `npm run test` - Run tests for all packages and applications
- `npm run clean` - Clean all build artifacts
- `npm run type-check` - Run TypeScript type checking

### Package Development

Each package can be developed independently:

```bash
# Build a specific package
cd packages/common-types
npm run build

# Watch mode for development
cd packages/utils-lib
npm run dev
```

## Applications

### Patient App (`apps/patient-app`)
- Patient interface for chat, notes, summaries, and education
- Built with React, TypeScript, and Material-UI
- Uses shared packages for common functionality

### Doctor App (`apps/doctor-app`)
- Doctor interface for patient management and dashboard
- Built with React, TypeScript, and Material-UI
- Uses shared packages for common functionality

### Server (`server`)
- Node.js BFF (Backend for Frontend)
- TypeScript-based Express server
- Handles API proxying, authentication, and WebSocket connections

## Packages

### Common Types (`packages/common-types`)
- Shared TypeScript interfaces and types
- Used across all applications and packages

### Utils Lib (`packages/utils-lib`)
- Utility functions for dates, formatting, validation, etc.
- Framework-agnostic utilities

### Auth Lib (`packages/auth-lib`)
- Authentication components and hooks
- React-based authentication library

### API Client (`packages/api-client`)
- API client with React Query integration
- HTTP client and WebSocket handling

### UI Components (`packages/ui-components`)
- Shared React components
- Material-UI based component library

## Backend

The Python FastAPI backend remains unchanged and is located in the `backend/` directory.

## Development Workflow

1. **Start the backend**: `cd backend && python main.py`
2. **Start the server**: `npm run dev:server`
3. **Start the patient app**: `npm run dev:patient`
4. **Start the doctor app**: `npm run dev:doctor`

## Contributing

1. Create feature branches from `main`
2. Make changes in the appropriate package or app
3. Test your changes
4. Submit a pull request

## License

ISC
