---

# Headless WordPress Blog Frontend with Node.js & Tailwind CSS

This repository contains the source code for a modern, performant, and SEO-friendly blog frontend built to consume a headless WordPress backend. It uses a lightweight Node.js and Express server to securely fetch data from the WordPress REST API and renders the content using server-side EJS templates, styled with Tailwind CSS.

This project is designed to work in tandem with the **[WP Headless Gateway](httpshttps://github.com/chrismccoy/wp-headless-gateway)** plugin, which provides secure API key authentication and webhook management for your WordPress instance.

---

## Features

-   **Headless Architecture:** Decouples your WordPress backend from the frontend, allowing for greater flexibility, security, and performance.
-   **Secure API Communication:** Uses bearer token authentication to securely fetch data from the WordPress REST API.
-   **Server-Side Rendering (SSR):** All pages are rendered on the server using EJS, ensuring fast initial page loads and excellent SEO.
-   **Modern & Responsive Design:** Styled with Tailwind CSS for a clean, minimalist, and fully responsive user experience.
-   **Dynamic Routing:**
    -   Homepage with paginated post listings.
    -   Single post pages (`/post/:slug`).
    -   Category archive pages with pagination (`/category/:slug`).
-   **Reusable Components:** Features a sidebar with "Recent Posts" and "Categories" widgets.
-   **Optimized Performance:** API calls are optimized to only fetch the data needed for each view (e.g., `_embed` is only used on single post pages).
-   **Robust Error Handling:** Gracefully handles API connection errors, missing posts/categories, and posts without featured images.

---

## Setup and Installation

Follow these steps to get the project running locally.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/chrismccoy/headless-express.git
    cd headless-express
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create your environment file:**
    Copy the example environment file to create your own local configuration.
    ```bash
    cp .env.example .env
    ```

4.  **Configure your environment variables:**
    Open the newly created `.env` file and add your WordPress site URL and the API key you generated.

    ```ini
    # .env

    # The full URL to your WordPress site (without a trailing slash)
    WP_URL="https://your-wordpress-site.com"

    # The API Key generated from the WP Headless Gateway plugin
    WP_API_KEY="whg_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    ```

---

## Running the Application

This project requires two terminal processes to run concurrently during development.

### Terminal 1: Build the CSS

This command starts the Tailwind CSS compiler in "watch" mode. It will automatically scan your template files and rebuild your stylesheet whenever you make a change.

```bash
npm run build:css
```

### Terminal 2: Start the Development Server

This command starts the Node.js server using `nodemon`, which will automatically restart the server every time you save a change to `server.js`.

```bash
npm run dev
```

Once both processes are running, you can view the application in your browser at:

**[http://localhost:3000](http://localhost:3000)**

---

## Project Structure

```
.
├── public/
│   └── css/
│       └── style.css       # Compiled Tailwind CSS output
├── src/
│   └── input.css           # Source Tailwind CSS file
├── views/
│   ├── partials/           # Reusable EJS components (_header, _footer, etc.)
│   ├── category-archive.ejs# Template for category listings
│   ├── error.ejs           # Error page template
│   ├── index.ejs           # Homepage template
│   └── single-post.ejs     # Single blog post template
├── .env                    # Your local environment variables (ignored by Git)
├── .env.example            # Template for the .env file
├── .gitignore
├── package.json            # Project dependencies and scripts
├── server.js               # The main Express server application
└── tailwind.config.js      # Tailwind CSS configuration
```

