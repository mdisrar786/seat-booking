# 🎯 Features
🪑 Core Functionality
15,000+ Seats Rendering with intelligent virtualization

Interactive Seat Selection with 8-seat limit

Smart Zoom & Pan with center-point zooming

Real-time Tooltips showing seat details on hover

Complete Checkout System with multiple payment methods

Responsive Design for desktop and mobile devices

# 🚀 Performance Optimizations
Aggressive Virtualization - Only renders visible seats

Efficient SVG Rendering - Fast rendering for large datasets

Debounced Storage - Efficient localStorage usage

Optimized Event Handlers - Smooth user interactions

# 🎨 User Experience
Visual Legend - Clear seat status indicators

Section Grouping - Organized venue layout

Smart Navigation - Drag to explore zoomed areas

Success Animations - Celebratory payment confirmation

Accessibility - Keyboard navigation support

🛠️ Installation & Setup
Prerequisites
Node.js 16+

npm, yarn, or pnpm

# Clone and Install
git clone git@github.com:mdisrar786/seat-booking.git
cd seat-booking
npm install

# Start Development Server
pnpm dev


# 📁 Project Structure
seat-bookong
src/
├── components/
│   ├── SeatingMap/
│   │   ├── SeatingMap.tsx      # Main seating map component
│   │   ├── Section.tsx         # Individual venue section
│   │   ├── Seat.tsx            # Single seat component
│   │   ├── SelectionPanel.tsx  # Selected seats sidebar
│   │   └── CheckoutModal.tsx   # Payment processing modal
│   ├── UI/
│   │   ├── Tooltip.tsx         # Hover tooltip component
│   │   ├── Legend.tsx          # Seat status legend
│   │   └── LoadingSpinner.tsx  # Loading indicator
│   └── Layout/
│       └── Header.tsx          # Application header
├── hooks/
│   ├── useSeatingData.ts       # Venue data management
│   ├── useSeatSelection.ts     # Seat selection logic
│   └── useLocalStorage.ts      # Persistent storage
├── types/
│   └── index.ts                # TypeScript type definitions
├── utils/
│   ├── seatUtils.ts            # Seat-related utilities
│   └── accessibility.ts        # Accessibility helpers
├── styles/
│   └── App.css                 # Application styles
└── App.tsx                     # Root component

# 🎮 How to Use
# Basic Interactions
Zoom: Use mouse wheel, zoom buttons, or slider

# Pan: Click and drag to move around the venue

# Select Seats: Click on available seats (green)

# View Details: Hover over seats for information

# Checkout: Click "Proceed to Checkout" when ready

# Navigation Tips
# Mouse Wheel: Zoom at cursor position

Zoom Buttons: Zoom towards center

Drag: Explore different areas when zoomed in

100% Button: Reset to default view

Fit View: See entire venue at once

# Seat Status Colors
🟢 Available - Click to select

🔵 Selected - Your chosen seats

🔘 Reserved - Already booked by others

🔴 Unavailable - Not for sale

# Selection Limits
Maximum 8 seats per booking

Real-time counter in selection panel

Clear selection anytime

# 🔧 Technical Implementation
Data Flow Architecture
text
Venue JSON → useSeatingData → SeatingMap → Sections → Seats
                                     ↓
                     SelectionPanel ↔ CheckoutModal

# State Management
typescript
// Seat selection state
const {
  selectedSeats,      // Currently selected seats
  lastPaymentSeats,   // Seats from last successful payment
  selectSeat,         // Add seat to selection
  deselectSeat,       // Remove seat from selection
  clearSelection,     // Clear all selections
  recordPayment,      // Store seats before payment
  getSeatStatus,      // Get current seat status
  maxSelection        // Maximum seats allowed
} = useSeatSelection();

# 🎯 Customization Guide
Adding New Venue Layout
Update venue.json in public/ folder:

json
{
  "venueId": "your-venue",
  "name": "Your Venue Name",
  "map": { "width": 2000, "height": 1500 },
  "sections": [
    {
      "id": "SECTION_A",
      "label": "Your Section",
      "transform": { "x": 0, "y": 0, "scale": 1 },
      "rows": [] // Generated automatically
    }
  ]
}
# Modify seat generation in useSeatingData.ts:

typescript
const sectionConfigs = {
  'SECTION_A': { rows: 50, seatsPerRow: 80, priceTier: 2 }
  // Add your sections here
};
# Customizing Seat Pricing
Update PRICE_TIERS in src/utils/seatUtils.ts:

typescript
const PRICE_TIERS: Record<number, number> = {
  1: 200, // VIP
  2: 150, // Premium
  3: 100, // Standard
  4: 75,  // Economy
  5: 50   // Student
};
Styling Customization
Modify CSS variables in src/styles/App.css:

css
:root {
  --seat-available: #28a745;
  --seat-selected: #007bff;
  --seat-reserved: #6c757d;
  --seat-unavailable: #dc3545;
}
# 📊 Performance Metrics
Scenario	Performance
15,000 Seats Load	~1-2 seconds
Zoom Operations	Smooth, 60fps
Memory Usage	~150-200MB
Panning	Fluid, immediate

# 🤝 Contributing
Development Workflow
Fork the repository

Create feature branch: git checkout -b feature/amazing-feature

Commit changes: git commit -m 'Add amazing feature'

Push to branch: git push origin feature/amazing-feature

Open Pull Request

# Code Standards
Use TypeScript for type safety

Follow React best practices

Write meaningful component names

Include proper JSDoc comments

Maintain performance optimizations


<------------------------------------------------------------------------------------->






This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
