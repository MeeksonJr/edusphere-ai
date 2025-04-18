# 🚀 EduSphere AI

**EduSphere AI** is a modern full-stack SaaS platform designed to support students from K–University with AI-powered academic tools, personalized learning assistance, and productivity features — all within a sleek, dark-themed interface.

With features like AI-driven content generation, a Markdown blog hub, resume upload portals, and subscription support, EduSphere AI enhances how students study, create, and manage academic tasks.

---

## 🌟 Features

- 🧠 **AI-Powered Assignment Help**  
  Generate essays, summarize text, and brainstorm ideas using **Gemini Flash 2.0** and **Hugging Face** models.

- 📆 **Smart Calendar Integration** *(Coming Soon)*  
  Manage deadlines, class schedules, and to-dos with a personalized academic calendar.

- 📂 **Markdown Blog & Content Hub**  
  Post articles in Markdown with AI-generated images via **FLUX.1-dev** from Hugging Face.

- 📎 **Internship & Scholarship Applications**  
  Upload resumes and apply directly through the app — files are securely stored in **Supabase**.

- 🔐 **Authentication & User Profiles**  
  Auth powered by **Supabase**, offering secure login and role-based access control.

- 💳 **Subscription System**  
  Users can unlock premium features through **PayPal Sandbox**-integrated payments.

- 🎨 **Modern UI/UX**  
  Styled using **TailwindCSS**, animated with **Framer Motion**, and polished with a **glassmorphism** dark theme.

- 📱 **Mobile-Ready & Fully Responsive**  
  Optimized layout for all screen sizes.

---

## 🧰 Tech Stack

| Layer         | Technologies                                                                 |
|---------------|------------------------------------------------------------------------------|
| **Frontend**  | Next.js, React, TypeScript, TailwindCSS, Framer Motion                      |
| **Backend**   | Supabase (PostgreSQL, Auth, Storage), Node.js (API Routes via Vercel)       |
| **AI/ML**     | Google Gemini Flash 2.0, Hugging Face (FLUX.1-dev)                          |
| **Database**  | Supabase PostgreSQL, Neon (for future scaling)                              |
| **Payments**  | PayPal (Sandbox Integration)                                                |
| **Versioning**| GitHub                                                                       |
| **Deployments**| Vercel                                                                      |

---

## 📁 Folder Structure
```
edusphere-ai/ 
├── app/ # App routes (Next.js 13+) 
├── components/ # Reusable UI components 
├── contexts/ # React context providers 
├── hooks/ # Custom React hooks 
├── lib/ # API logic and utilities 
├── public/ # Static assets 
├── sql/ # Supabase SQL schemas or seed data 
├── styles/ # Global styles 
├── types/ # TypeScript types 
├── utils/ # Reusable utility functions 
├── .env.local # Environment variables 
├── components.json # ShadCN/UI component config 
├── next.config.mjs # Next.js configuration 
├── package.json # Project metadata and scripts 
├── pnpm-lock.yaml # Dependency lock file (PNPM) 
├── postcss.config.mjs # PostCSS config 
├── tailwind.config.ts # TailwindCSS configuration 
├── tsconfig.json # TypeScript config 
└── readMe.md # Project documentation
```

---

## 📦 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/MeeksonJr/edusphere-ai.git
cd edusphere-ai
```
### 2. Install Dependencies
```
npm install
```

### 3. Environment Variables
```
Create a `.env.local` file and add your credentials:
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_URL=your_supabase_url
SUPABASE_JWT_SECRET=your_jwt_secret
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_URL=your_postgres_url
POSTGRES_HOST=your_postgres_host
POSTGRES_DATABASE=your_postgres_database
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling

# AI Services
HUGGING_FACE_API_KEY=your_huggingface_api_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_KEY=your_gemini_api_key

# Payment (for future implementation)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```
### 4. Run Locally
```
npm run dev
```
## Skills Demonstrated
- Full-stack SaaS architecture
- API integrations (Gemini, Hugging Face, PayPal)
- Authentication & authorization (Supabase Auth)
- PostgreSQL design & file handling (Supabase)
- Payment systems and user roles
- UI/UX design with Framer Motion + Tailwind
- Dark mode + glassmorphism themes
- CI/CD deployment (Vercel + GitHub)

## 📈 Future Enhancements
- Multi-project dashboard
- AI-powered previews & smart suggestions
- Social integrations (Twitter, Medium, LinkedIn, Substack)
- Real-time sync with academic tools (e.g., Google Calendar, Notion)

## 🧠 About the Project
EduSphere AI is a capstone-style SaaS app built with scalability, accessibility, and the future of education in mind. It's a platform created by a student — for students — to simplify the academic journey through smart automation.

“Empowering students with intelligent tools for a brighter academic journey.”

#
🔗 Connect

[GitHub-MeeksonJr](https://github.com/MeeksonJr)  
[LinkedIn-Mohamed Datt](https://www.linkedin.com/in/mohamed-datt-b60907296/)

