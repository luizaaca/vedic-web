# Vedic Astrology App - AI-Powered Chart Analysis

Welcome to the Vedic Astrology App, a modern and interactive web application for calculating and analyzing Vedic astral charts (Jyotish). The platform offers detailed visual tools and a chat interface with an AI specialist to provide personalized interpretations and answer questions about the generated chart.

This project represents the **frontend** of the application, built with Next.js and TypeScript, and it consumes a backend API for calculations and analysis.

> **Backend:** The backend responsible for astrological calculations and AI logic can be found in the repository: [luizaaca/vedic-app](https://github.com/luizaaca/vedic-app).

## ✨ Key Features

- **Vedic Chart Calculation:** Enter birth data (date, time, and location) to generate an accurate Vedic astral chart.
- **Multiple Chart Views:**
  - **North Indian Style Chart:** A classic diamond-shaped view that highlights the astrological houses.
  - **Zodiac Style Chart:** A circular chart showing the position of planets in the zodiac signs.
- **JSON Data Viewer:** Access all raw astral chart data in a well-structured JSON format, ideal for in-depth study.
- **Chart Downloads:** Easily export the North Indian or Zodiac charts as high-quality JPEG images.
- **Chat with AI Specialist:** Converse with an AI trained to interpret the elements of your chart, provide summaries, analyses, and answer specific questions.
- **Responsive Interface:** Fully functional on desktops, tablets, and mobile devices.
- **React Native WebView Support:** Designed to be seamlessly embedded within a React Native application. It utilizes `window.ReactNativeWebView.postMessage` to communicate with the native host, enabling features like downloading chart images directly to the user's device.

## 🛠️ Tech Stack

This project is built using a modern set of technologies to ensure performance, scalability, and a great developer experience.

- **Framework:** Next.js (v13+ with App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui, React Tabs, React Tooltip
- **Charts:** `@astrodraw/astrochart` for the zodiac chart and `html-to-image` for the download functionality.
- **Icons:** Lucide React

## 📂 Project Structure

The file structure is organized to keep the code modular and easy to maintain.

```
.
├── app/                  # Next.js 13+ Routes, Pages, and Layouts
│   ├── api/              # API Routes (BFF - Backend for Frontend)
│   │   ├── calculate/    # Proxy for map calculation
│   │   └── interpret/    # Proxy for AI interpretation
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Main application layout
│   └── page.tsx          # Main application page (root component)
├── components/           # Reusable React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── Chart.tsx         # Component that renders charts and tabs
│   ├── ChartResult.tsx   # Component that encapsulates the map result
│   ├── ChatInterface.tsx # Chat interface component with AI
│   ├── BirthDataForm.tsx # Birth data input form
│   └── MapPicker.tsx     # Location picker on the map
├── hooks/                # Custom hooks (e.g., useIsMobile)
├── lib/                  # Utility functions and constants (e.g., timezones)
└── public/               # Static files (images, icons, etc.)
```

## 🚀 How to Run Locally

To run this project in your development environment, follow the steps below.

### Prerequisites

-   Node.js (version 18.x or higher)
-   npm, yarn, or pnpm
-   Git

### Steps

1.  **Clone the Backend**
    First, clone and run the backend server. Follow the instructions in its repository.
    ```bash
    git clone https://github.com/luizaaca/vedic-app.git
    cd vedic-app
    # Follow the backend installation and execution instructions
    # It will usually be available at http://localhost:8080
    ```

2.  **Clone this Repository (Frontend)**
    ```bash
    git clone https://github.com/luizaaca/vedic-web.git
    cd vedic-astrology-app
    ```

3.  **Install Dependencies**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

4.  **Configure Environment Variables**
    Create a `.env.local` file in the project root, copying the contents from `.env.example` (if it exists) or using the template below.
    ```env
    # .env.local

    # Backend API URL for map calculation
    CALCULATE_API_URL=http://localhost:8080/api/vedic

    # Backend API URL for chat interpretation
    INTERPRET_API_URL=http://localhost:8080/api/explain
    ```
    > **Note:** The URLs above are the defaults expected if you are running the backend locally. Adjust them if your environment is different.

5.  **Run the Development Server**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

6.  **Open in Browser**
    Open http://localhost:3000 in your browser to see the application running.

## 🤝 Contributions

Contributions are always welcome! If you have an idea to improve the project, feel free to:

1.  Fork the project.
2.  Create a new Branch (`git checkout -b feature/MyFeature`).
3.  Commit your changes (`git commit -m 'Add MyFeature'`).
4.  Push to the Branch (`git push origin feature/MyFeature`).
5.  Open a Pull Request.

---