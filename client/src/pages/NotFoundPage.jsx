import { Link } from "react-router-dom";

import "./NotFoundPage.css";

function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section className="not-found-content">
        <p className="not-found-eyebrow">
          404 Error
        </p>

        <h1>Page Not Found</h1>

        <p>
          Sorry, the page you're looking for doesn't exist.
        </p>

        <Link
          className="not-found-home-link"
          to="/"
        >
          Return Home
        </Link>
      </section>
    </main>
  );
}

export default NotFoundPage;