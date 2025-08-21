/**
 * This file initializes an Express server that acts as the frontend for a headless
 * WordPress installation. It handles routing, fetches data from the WordPress REST API
 * using an optional secure API key, and renders dynamic EJS templates.
 */

require("dotenv").config();

const path = require("path");
const express = require("express");
const axios = require("axios");
const app = express();

const PORT = process.env.PORT || 3000;

// The WP_URL is the only truly required variable for the application to function.
if (!process.env.WP_URL) {
  console.error(
    "FATAL ERROR: WP_URL must be defined in your .env file."
  );
  process.exit(1); // Exit the process with an error code.
}

/**
 * A headers object that is conditionally built based on the presence of a WP_API_KEY.
 * If a key is provided, the app runs in "Authenticated Mode," allowing access to private content.
 * Otherwise, it runs in "Public Mode," accessing only publicly available data.
 */
const apiHeaders = {};

if (process.env.WP_API_KEY) {
  apiHeaders.Authorization = `Bearer ${process.env.WP_API_KEY}`;
  console.log("✅ API connection configured in Authenticated Mode.");
} else {
  console.log(
    "⚠️  API connection configured in Public Mode. Only published content will be accessible."
  );
}

/**
 * A pre-configured Axios instance for making requests to the WordPress REST API.
 * This centralizes API configuration, making the application easier to maintain and debug.
 */
const wpApi = axios.create({
  /** The base URL for all WordPress REST API v2 requests. */
  baseURL: `${process.env.WP_URL}/wp-json/wp/v2`,
  /** The headers to be sent with every API request. */
  headers: apiHeaders,
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

/**
 * Fetches data required for the sidebar (categories and recent posts).
 * This function is reused across multiple routes to keep the code DRY
 */
async function getSidebarData() {
  try {
    // Fetch categories and recent posts in parallel to improve performance.
    const [categoriesRes, recentPostsRes] = await Promise.all([
      wpApi.get("/categories", { params: { per_page: 20, hide_empty: true } }),
      wpApi.get("/posts", { params: { per_page: 5 } }),
    ]);
    return {
      categories: categoriesRes.data,
      recentPosts: recentPostsRes.data,
    };
  } catch (error) {
    console.error("Error fetching sidebar data:", error.message);
    // Return empty arrays to prevent the frontend from crashing if the API fails.
    return { categories: [], recentPosts: [] };
  }
}

/**
 * Route handler for the homepage and its paginated pages.
 */
app.get(["/", "/page/:pageNumber"], async (req, res) => {
  try {
    // Determine the current page from the URL parameter, defaulting to 1.
    const currentPage = parseInt(req.params.pageNumber, 10) || 1;

    // Fetch the main post list and sidebar data concurrently for faster page loads.
    const [postsRes, sidebarData] = await Promise.all([
      wpApi.get("/posts", {
        params: { per_page: 10, page: currentPage },
      }),
      getSidebarData(),
    ]);

    // The WordPress API provides the total page count in the response headers.
    const totalPages = parseInt(postsRes.headers["x-wp-totalpages"], 10) || 1;

    // Data validation to ensure the API response is in the expected array format.
    if (!Array.isArray(postsRes.data)) {
      throw new Error("Invalid post data structure received from API.");
    }

    // Render the index template with all the necessary data.
    res.render("index", {
      posts: postsRes.data,
      title: "Modern Headless Blog",
      ...sidebarData,
      currentPage,
      totalPages,
    });
  } catch (error) {
    console.error("Error on home route:", error.message);
    res.status(500).render("error", {
      message: "Could not fetch posts. Please check the API connection.",
      title: "Error",
    });
  }
});

/**
 * Route handler for a single post page.
 */
app.get("/post/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    // Fetch the specific post (with embedded data for author/image) and sidebar data concurrently.
    const [postRes, sidebarData] = await Promise.all([
      wpApi.get("/posts", { params: { slug, _embed: true } }),
      getSidebarData(),
    ]);

    // Handle cases where the post is not found (API returns an empty array).
    if (!Array.isArray(postRes.data) || postRes.data.length === 0) {
      return res.status(404).render("error", {
        message: "The post you were looking for could not be found.",
        title: "Post Not Found",
        ...sidebarData,
      });
    }

    res.render("single-post", {
      post: postRes.data[0],
      title: postRes.data[0].title.rendered,
      ...sidebarData,
    });
  } catch (error) {
    console.error("Error on single post route:", error.message);
    res.status(500).render("error", {
      message: "Could not fetch the post. Please check the API connection.",
      title: "Error",
    });
  }
});

/**
 * Route handler for category archive pages and their pagination.
 */
app.get(["/category/:slug", "/category/:slug/page/:pageNumber"], async (req, res) => {
  try {
    const { slug } = req.params;
    const currentPage = parseInt(req.params.pageNumber, 10) || 1;
    const sidebarData = await getSidebarData();

    // Find the category by its slug to get its ID and name.
    const categoryRes = await wpApi.get("/categories", { params: { slug } });

    if (!Array.isArray(categoryRes.data) || categoryRes.data.length === 0) {
      return res.status(404).render("error", {
        message: "The category you were looking for could not be found.",
        title: "Category Not Found",
        ...sidebarData,
      });
    }
    const category = categoryRes.data[0];

    // Fetch all posts belonging to that category's ID for the current page.
    const postsRes = await wpApi.get("/posts", {
      params: {
        categories: category.id,
        per_page: 10,
        page: currentPage,
      },
    });

    const totalPages = parseInt(postsRes.headers["x-wp-totalpages"], 10) || 1;

    res.render("category-archive", {
      posts: postsRes.data,
      category: category,
      title: `Category: ${category.name}`,
      ...sidebarData,
      currentPage,
      totalPages,
    });
  } catch (error) {
    console.error("Error on category archive route:", error.message);
    res.status(500).render("error", {
      message: "Could not fetch posts for this category.",
      title: "Error",
    });
  }
});

/**
 * Starts the Express server and listens for incoming connections on the specified port.
 */
app.listen(PORT, () => {
  console.log(`✅ Server is running and available at http://localhost:${PORT}`);
});
