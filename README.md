# CodeCraft

CodeCraft is a collaborative coding-learning platform. Users can learn from
programming lessons, solve challenges, run code, track progress, collaborate
in real time, and participate in communities.

The repository contains:

- A React frontend for the learner experience.
- An Express and MongoDB backend for authentication, challenges, progress,
  communities, notifications, and collaboration.
- A Socket.IO layer for real-time collaborative editing and code execution
  updates.
- Judge0 integration for running submissions in JavaScript, Python, Java, and
  C#.

## Features

- Account registration, login, refresh-token authentication, and logout.
- Challenge catalogue and authenticated challenge access.
- In-browser code editor powered by Monaco Editor.
- Code execution with configurable Judge0 language runtimes.
- Progress tracking for completed challenges.
- User search and profile management.
- Collaboration invitations and shared coding sessions.
- Community creation, joining, searching, and image-enabled posts.
- Notifications for collaboration and community activity.

## Repository structure

```text
.
├── backend/
│   ├── config/          Runtime configuration
│   ├── middleware/      Authentication middleware
│   ├── models/          Mongoose models
│   ├── routes/          Express API routes
│   ├── services/        Authentication, progress, and submission logic
│   ├── tests/           Backend unit tests
│   └── index.js         HTTP and Socket.IO server entry point
├── frontend/
│   ├── public/          Static frontend assets
│   └── src/             React application source
└── playground-1.mongodb.js
                       Optional MongoDB shell/playground commands
```

## Prerequisites

- Node.js 18 or newer and npm.
- A MongoDB deployment accessible from the backend.
- A Judge0-compatible execution service. The public Judge0 Community Edition
  endpoint is used by default, but a self-hosted or RapidAPI endpoint can be
  configured.

## Getting started

Clone the repository and install dependencies for both applications:

```bash
git clone <repository-url>
cd <repository-directory>

cd backend
npm install

cd ../frontend
npm install
```

### Configure the backend

Non-sensitive defaults are stored in
[`backend/config/default.json`](backend/config/default.json). MongoDB
credentials and JWT signing secrets are required environment variables and
are deliberately not stored in the repository.

Environment variables supported by the backend include:

| Variable | Purpose | Default |
| --- | --- | --- |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_ACCESS_SECRET` | Access-token signing secret | Required |
| `JWT_REFRESH_SECRET` | Refresh-token signing secret | Required |
| `PORT` | HTTP and Socket.IO server port | `5000` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |
| `JWT_ACCESS_TTL` | Access-token lifetime | `15m` |
| `JWT_REFRESH_TTL` | Refresh-token lifetime | `7d` |
| `JUDGE0_BASE_URL` | Judge0 API base URL | `https://ce.judge0.com` |
| `JUDGE0_RAPIDAPI_KEY` | Optional RapidAPI key | Not set |
| `JUDGE0_RAPIDAPI_HOST` | Optional RapidAPI host | Not set |
| `JUDGE0_LANG_JS` | Judge0 language ID for JavaScript | `63` |
| `JUDGE0_LANG_PY` | Judge0 language ID for Python | `71` |
| `JUDGE0_LANG_JAVA` | Judge0 language ID for Java | `62` |
| `JUDGE0_LANG_CSHARP` | Judge0 language ID for C# | `51` |

The MongoDB connection is read from `MONGODB_URI` and uses the `codecraft`
database. Make sure the configured user has permission to read and write that
database.

Copy [`backend/.env.example`](backend/.env.example) as a reference, then set
the values in your deployment environment. The application intentionally does
not load `.env` files automatically, so secrets remain managed by the shell,
hosting platform, or a secrets manager:

```powershell
$env:MONGODB_URI = "mongodb+srv://<username>:<password>@<cluster>/<database>"
$env:JWT_ACCESS_SECRET = "replace-with-a-long-random-secret"
$env:JWT_REFRESH_SECRET = "replace-with-a-different-long-random-secret"
```

The backend fails fast at startup when any of the three required variables is
missing. Do not commit `backend/.env` or put real credentials in
`backend/config/*.json`; local environment files are excluded by the root
[`.gitignore`](.gitignore).

### Run the backend

From the `backend` directory:

```bash
node index.js
```

The API and Socket.IO server listen on
[http://localhost:5000](http://localhost:5000) by default.

### Run the frontend

In a second terminal, from the `frontend` directory:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000). The frontend uses
`https://collaborative-coding-platform-pvdr.onrender.com` as its default API and
Socket.IO URL. To point it at a different backend, set `REACT_APP_BACKEND_URL`
before starting or building:

```powershell
$env:REACT_APP_BACKEND_URL = "http://localhost:5000"
npm start
```

## Available scripts

### Frontend

Run these commands from `frontend/`:

| Command | Description |
| --- | --- |
| `npm start` | Start the React development server |
| `npm test` | Run frontend tests in watch mode |
| `npm run build` | Create an optimized production build in `frontend/build` |

### Backend

Run these commands from `backend/`:

| Command | Description |
| --- | --- |
| `node index.js` | Start the API and Socket.IO server |
| `npm test` | Run Jest tests with coverage thresholds |
| `npm run test:watch` | Run backend tests in watch mode |
| `npm run test:verbose` | Run backend tests with verbose output |

## API overview

All routes under `/api` are served by the backend. Authentication routes are
public; challenge, execution, user, collaboration, notification, and
community routes require an access token.

| Area | Endpoints |
| --- | --- |
| Authentication | `/api/auth/signup`, `/login`, `/refresh`, `/logout` |
| Challenges | `/api/challenges`, `/api/challenges/catalog` |
| Code execution | `POST /api/execute` |
| Users | `/api/users/me`, `/api/users/search` |
| Collaborations | `/api/collaborations/active`, `/invite`, `/respond` |
| Notifications | `/api/notifications` |
| Communities | `/api/communities` and nested community/post routes |
| Uploaded images | `/uploads/...` |

Authenticated HTTP requests use the access token in the authorization flow
implemented by the frontend. Socket.IO connections authenticate with the same
access token and use collaboration events such as `collaboration:join`,
`collaboration:code_change`, and `collaboration:run`.

## Testing

Backend tests use Jest, Supertest, and an in-memory MongoDB server for
integration coverage. Frontend tests use the Create React App test runner and
Testing Library.

Run both suites from their respective directories:

```bash
cd backend
npm test

cd ../frontend
npm test -- --watchAll=false
```

## Security and deployment notes

- Use long, unique JWT secrets and rotate the MongoDB password and JWT
  secrets if they have ever been committed or shared.
- Keep MongoDB credentials, Judge0 API keys, and other secrets outside source
  control.
- Set `NODE_ENV=production` and configure `CORS_ORIGIN` to the deployed
  frontend origin.
- Use HTTPS in production so authentication cookies and API traffic are
  protected in transit.
- Code execution should use a trusted, isolated Judge0 deployment or provider;
  do not execute untrusted submissions directly on the application server.
- Review uploaded-file storage and retention before deploying community image
  uploads.

## License

No project license has been declared yet.
