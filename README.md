# 🧬 Pokémon Table App

A sleek, responsive, and server-rendered web application built with **Next.js**, **Tailwind CSS**, and **Framer Motion** that allows users to:

- Search Pokémon by exact name
- Paginate through Pokémon and Evolution Triggers
- View Pokémon stats in a modal
- Navigate between views using an elegant tab UI

> **Powered by:** [PokéAPI](https://pokeapi.co/)

---

## ✨ Features

### 🧾 Pokémon Table

- ✅ Server-side search by exact Pokémon name
- ✅ Server-side pagination (10 per page)
- ✅ Modal popup with detailed stats
- ✅ Clickable rows with image preview

### 🌱 Evolution Triggers Table

- ✅ Server-side paginated list of evolution triggers
- ✅ Separate table view under a tab
- ✅ Styled table with hover interaction

### 💡 Additional UI Features

- ✅ Tab-based navigation using **Framer Motion**
- ✅ Loading spinner during page transitions
- ✅ Clean layout with responsive design
- ✅ Animations and accessibility enhancements

---

## ⚙️ Tech Stack

| Technology                                      | Purpose                                      |
| ----------------------------------------------- | -------------------------------------------- |
| [Next.js](https://nextjs.org/)                  | Framework with SSR (Server-Side Rendering)   |
| [React](https://react.dev/)                     | UI building blocks                           |
| [Tailwind CSS](https://tailwindcss.com/)        | Utility-first styling                        |
| [Framer Motion](https://www.framer.com/motion/) | Tab animation and transitions                |
| [TanStack Table](https://tanstack.com/table)    | Render Pokémon table with strong flexibility |
| [PokéAPI](https://pokeapi.co/)                  | Public API for Pokémon data                  |

---

## 🔁 Server-Side Rendering (SSR)

This project uses **Next.js `getServerSideProps()`** to:

- Fetch paginated Pokémon data
- Fetch paginated Evolution Triggers
- Handle server-side search for exact Pokémon names

You can confirm this by:

- Checking browser DevTools → Network tab
- Look for the `document` type request to `/`
- Confirm response code = `200` and type = `document`

✅ This ensures faster initial load, SEO support, and dynamic content rendering.

---

## 🔍 Server-Side Filtering

We implement **true server-side filtering** via:

- Capturing search terms in the query string
- Making a dynamic fetch to PokéAPI inside `getServerSideProps()`
- Only returning matching data from the server (not filtering client-side)

✅ No unnecessary data loaded
✅ Works well with pagination
✅ Keeps app efficient and lean

---

## 📊 Why TanStack Table?

We use **TanStack Table** to render the Pokémon table efficiently with:

- Column definitions
- Custom cell rendering (image, text formatting)
- Table body generation from rows and cells

ℹ️ We **did not use built-in filtering or pagination features** of TanStack Table because:

- Our app requirements demand **server-side filtering and pagination**
- Handling filtering client-side would conflict with SSR behavior

---

## Preview

<img src="./public/preview.png" alt="App Preview" width="100%" />

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/sahebghosh/pokemon-table-app.git
cd pokemon-table-app
npm install
npm run dev
App runs at: http://localhost:3000



```

## 🙏 Acknowledgements

Thanks to the awesome PokéAPI team for their free, open data.
